import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wsId = ctx.workspace.id;

  const [accounts, domains] = await Promise.all([
    prisma.senderAccount.findMany({
      where: { workspaceId: wsId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.senderDomain.findMany({
      where: { workspaceId: wsId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ accounts, domains });
}

export async function POST(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    type: "account" | "domain";
    email?: string;
    name?: string;
    domain?: string;
    dailyLimit?: number;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpSecure?: boolean;
    imapHost?: string;
    imapPort?: number;
    imapUser?: string;
    imapPass?: string;
    imapTls?: boolean;
  };

  const wsId = ctx.workspace.id;

  if (body.type === "account") {
    if (!body.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    const account = await prisma.senderAccount.create({
      data: {
        workspaceId: wsId,
        email: body.email,
        name: body.name ?? body.email,
        provider: "smtp",
        dailyLimit: body.dailyLimit ?? 50,
        smtpHost: body.smtpHost,
        smtpPort: body.smtpPort,
        smtpUser: body.smtpUser,
        smtpPass: body.smtpPass,
        smtpSecure: body.smtpSecure ?? true,
        imapHost: body.imapHost,
        imapPort: body.imapPort,
        imapUser: body.imapUser,
        imapPass: body.imapPass,
        imapTls: body.imapTls ?? true,
      },
    });
    return NextResponse.json(account);
  }

  if (body.type === "domain") {
    if (!body.domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    const senderDomain = await prisma.senderDomain.create({
      data: {
        workspaceId: wsId,
        domain: body.domain,
        verified: true,
        spfRecord: `v=spf1 include:_spf.${body.domain} ~all`,
        dkimRecord: "v=DKIM1; k=rsa; p=configured-on-mail-server",
        dmarcRecord: `v=DMARC1; p=none; rua=mailto:dmarc@${body.domain}`,
      },
    });
    return NextResponse.json(senderDomain);
  }

  return NextResponse.json({ error: "type must be 'account' or 'domain'" }, { status: 400 });
}
