import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";
import { createResendDomain } from "@/lib/email";

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
        dailyLimit: body.dailyLimit ?? 50,
      },
    });
    return NextResponse.json(account);
  }

  if (body.type === "domain") {
    if (!body.domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    // Create domain in Resend to get DNS records
    let dnsRecords: { dkimRecord?: string; spfRecord?: string; dmarcRecord?: string } = {};
    try {
      const resendDomain = await createResendDomain(body.domain);
      if (resendDomain.data?.records) {
        const records = resendDomain.data.records as Array<{ type: string; value: string }>;
        const dkim = records.find((r) => r.type === "TXT" && r.value.includes("dkim"));
        const spf = records.find((r) => r.type === "TXT" && r.value.includes("spf"));
        dnsRecords = {
          dkimRecord: dkim?.value,
          spfRecord: spf?.value ?? "v=spf1 include:amazonses.com ~all",
          dmarcRecord: `v=DMARC1; p=none; rua=mailto:dmarc@${body.domain}`,
        };
      }
    } catch {
      // Resend not configured — still create the domain record
      dnsRecords = {
        spfRecord: "v=spf1 include:sendgrid.net ~all",
        dmarcRecord: `v=DMARC1; p=none; rua=mailto:dmarc@${body.domain}`,
      };
    }

    const senderDomain = await prisma.senderDomain.create({
      data: {
        workspaceId: wsId,
        domain: body.domain,
        verified: false,
        ...dnsRecords,
      },
    });
    return NextResponse.json(senderDomain);
  }

  return NextResponse.json({ error: "type must be 'account' or 'domain'" }, { status: 400 });
}
