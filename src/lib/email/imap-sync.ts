import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { prisma } from "@/lib/prisma";

export interface ImapConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  tls?: boolean;
}

export async function syncImapRepliesForSender(senderId?: string, workspaceId?: string) {
  // 1. Resolve Sender Account or ENV credentials
  let host = process.env.IMAP_HOST;
  let port = Number(process.env.IMAP_PORT ?? 993);
  let user = process.env.IMAP_USER;
  let pass = process.env.IMAP_PASS;
  let tls = process.env.IMAP_TLS !== "false";

  let targetWorkspaceId = workspaceId;

  if (senderId) {
    const sender = await prisma.senderAccount.findUnique({ where: { id: senderId } });
    if (sender) {
      targetWorkspaceId = sender.workspaceId;
      if (sender.imapHost) host = sender.imapHost;
      if (sender.imapPort) port = sender.imapPort;
      if (sender.imapUser) user = sender.imapUser;
      if (sender.imapPass) pass = sender.imapPass;
      if (sender.imapTls !== null) tls = sender.imapTls;
    }
  }

  if (!host || !user || !pass) {
    return {
      synced: 0,
      error: "IMAP configuration incomplete. Please set IMAP_HOST, IMAP_USER, IMAP_PASS in .env or on your Sender Account.",
    };
  }

  if (!targetWorkspaceId) {
    const defaultWs = await prisma.workspace.findFirst();
    if (!defaultWs) return { synced: 0, error: "No workspace found to associate incoming replies." };
    targetWorkspaceId = defaultWs.id;
  }

  const client = new ImapFlow({
    host,
    port,
    secure: tls,
    auth: {
      user,
      pass,
    },
    logger: false,
  });

  let syncedCount = 0;

  try {
    await client.connect();

    // Lock INBOX
    const lock = await client.getMailboxLock("INBOX");
    try {
      // Search for UNSEEN messages
      const messages = client.fetch({ seen: false }, { source: true, envelope: true });

      for await (const message of messages) {
        if (!message.source) continue;

        const parsed = await simpleParser(message.source);
        const fromEmail = parsed.from?.value[0]?.address?.toLowerCase();
        const fromName = parsed.from?.value[0]?.name || fromEmail;
        const subject = parsed.subject || "(No Subject)";
        const bodyText = parsed.text || parsed.html || "";
        const bodyHtml = typeof parsed.html === "string" ? parsed.html : undefined;

        if (!fromEmail) continue;

        // Find existing thread or lead in this workspace
        let thread = await prisma.inboxThread.findFirst({
          where: { workspaceId: targetWorkspaceId, contactEmail: fromEmail },
        });

        if (!thread) {
          thread = await prisma.inboxThread.create({
            data: {
              workspaceId: targetWorkspaceId,
              subject,
              contactEmail: fromEmail,
              contactName: fromName,
              isRead: false,
              lastMessageAt: parsed.date || new Date(),
            },
          });
        } else {
          await prisma.inboxThread.update({
            where: { id: thread.id },
            data: {
              isRead: false,
              lastMessageAt: parsed.date || new Date(),
              subject: subject || thread.subject,
            },
          });
        }

        // Add to InboxMessage
        await prisma.inboxMessage.create({
          data: {
            threadId: thread.id,
            direction: "INBOUND",
            fromEmail,
            fromName,
            toEmail: user,
            subject,
            body: bodyText,
            htmlBody: bodyHtml,
            sentAt: parsed.date || new Date(),
          },
        });

        // Update matching CampaignLead status to 'replied'
        await prisma.campaignLead.updateMany({
          where: {
            lead: { contact: { email: fromEmail } },
            repliedAt: null,
          },
          data: {
            repliedAt: parsed.date || new Date(),
            status: "replied",
          },
        });

        // Mark message SEEN in IMAP
        await client.messageFlagsAdd({ uid: message.uid }, ["\\Seen"]);
        syncedCount++;
      }
    } finally {
      lock.release();
    }

    await client.logout();

    // Update sender lastSyncedAt
    if (senderId) {
      await prisma.senderAccount.update({
        where: { id: senderId },
        data: { lastSyncedAt: new Date() },
      });
    }

    return { synced: syncedCount };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "IMAP connection failed";
    return { synced: syncedCount, error: errorMsg };
  }
}
