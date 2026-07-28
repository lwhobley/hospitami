import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    body: string;
    senderAccountId: string;
  };

  const thread = await prisma.inboxThread.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      messages: { orderBy: { sentAt: "asc" }, take: 1 },
    },
  });

  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  const sender = await prisma.senderAccount.findFirst({
    where: { id: body.senderAccountId, workspaceId: ctx.workspace.id },
  });

  if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });

  const replySubject = thread.subject.startsWith("Re:")
    ? thread.subject
    : `Re: ${thread.subject}`;

  // Send via Resend
  await sendEmail({
    from: sender.email,
    fromName: sender.name,
    to: thread.contactEmail,
    subject: replySubject,
    html: body.body.replace(/\n/g, "<br>"),
    text: body.body,
  });

  // Record the outbound message
  const message = await prisma.inboxMessage.create({
    data: {
      threadId: id,
      direction: "OUTBOUND",
      fromEmail: sender.email,
      fromName: sender.name,
      toEmail: thread.contactEmail,
      subject: replySubject,
      body: body.body,
      sentAt: new Date(),
    },
  });

  // Update thread
  await prisma.inboxThread.update({
    where: { id },
    data: { lastMessageAt: new Date(), isRead: true },
  });

  return NextResponse.json(message);
}
