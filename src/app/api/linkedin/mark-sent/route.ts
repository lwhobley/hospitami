import { NextResponse, type NextRequest } from "next/server";
import { getWorkspaceContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    leadId: string;
    contactName: string;
    type: "connection" | "inmail";
    message: string;
  };

  const lead = await prisma.lead.findFirst({
    where: { id: body.leadId, workspaceId: ctx.workspace.id },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const meta: Prisma.InputJsonValue = {
    type: body.type,
    charCount: body.message.length,
    preview: body.message.slice(0, 120),
  };

  await prisma.activity.create({
    data: {
      leadId: body.leadId,
      userId: ctx.user.id,
      type: `linkedin_${body.type}_sent`,
      title: `LinkedIn ${body.type === "connection" ? "connection request" : "InMail"} sent to ${body.contactName}`,
      metadata: meta,
    },
  });

  await prisma.lead.update({
    where: { id: body.leadId },
    data: { lastActivityAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
