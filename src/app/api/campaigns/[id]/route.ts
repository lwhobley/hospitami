import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";
import { type CampaignStatus } from "@/generated/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      sequence: {
        include: { steps: { orderBy: { order: "asc" } } },
      },
      senderAccount: true,
      leads: {
        include: {
          lead: {
            include: {
              company: { select: { name: true, category: true } },
              contact: { select: { name: true, title: true, email: true } },
            },
          },
        },
        orderBy: { sentAt: "desc" },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const leads = campaign.leads.map((cl) => ({
    id: cl.id,
    leadId: cl.leadId,
    businessName: cl.lead.company?.name ?? "Unknown",
    contactName: cl.lead.contact?.name ?? "",
    contactTitle: cl.lead.contact?.title ?? "",
    currentStep: cl.currentStep,
    totalSteps: campaign.sequence?.steps.length ?? 0,
    status: cl.status,
    sentAt: cl.sentAt,
    openedAt: cl.openedAt,
    clickedAt: cl.clickedAt,
    repliedAt: cl.repliedAt,
    lastActivity: cl.repliedAt ?? cl.clickedAt ?? cl.openedAt ?? cl.sentAt ?? new Date(),
  }));

  const sent = leads.filter((l) => l.sentAt).length;
  const opened = leads.filter((l) => l.openedAt).length;
  const clicked = leads.filter((l) => l.clickedAt).length;
  const replied = leads.filter((l) => l.repliedAt).length;

  return NextResponse.json({
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      sequence: campaign.sequence,
      sender: campaign.senderAccount,
      startedAt: campaign.startedAt,
      completedAt: campaign.completedAt,
    },
    stats: { sent, opened, clicked, replied, total: leads.length },
    leads,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { status?: CampaignStatus };

  const campaign = await prisma.campaign.update({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.status === "ACTIVE" && { startedAt: new Date() }),
      ...(body.status === "COMPLETED" && { completedAt: new Date() }),
    },
  });

  return NextResponse.json(campaign);
}
