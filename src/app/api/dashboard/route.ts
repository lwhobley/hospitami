import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wsId = ctx.workspace.id;

  const [
    totalLeads,
    activeCampaigns,
    recentLeads,
    campaignLeadStats,
    activeCampaignPerf,
  ] = await Promise.all([
    prisma.lead.count({ where: { workspaceId: wsId } }),

    prisma.campaign.count({
      where: { workspaceId: wsId, status: "ACTIVE" },
    }),

    prisma.lead.findMany({
      where: { workspaceId: wsId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        company: { select: { name: true, category: true, city: true, state: true } },
      },
    }),

    prisma.campaignLead.aggregate({
      where: {
        campaign: { workspaceId: wsId },
        sentAt: { not: null },
      },
      _count: {
        sentAt: true,
        openedAt: true,
        repliedAt: true,
      },
    }),

    prisma.campaign.findMany({
      where: { workspaceId: wsId, status: "ACTIVE" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { leads: { where: { sentAt: { not: null } } } } },
        leads: {
          where: { sentAt: { not: null } },
          select: { openedAt: true, repliedAt: true, sentAt: true },
        },
      },
    }),
  ]);

  const sent = campaignLeadStats._count.sentAt;
  const opened = campaignLeadStats._count.openedAt;
  const replied = campaignLeadStats._count.repliedAt;
  const openRate = sent > 0 ? Math.round((opened / sent) * 1000) / 10 : 0;
  const replyRate = sent > 0 ? Math.round((replied / sent) * 1000) / 10 : 0;

  const campaignPerf = activeCampaignPerf.map((c) => {
    const cSent = c.leads.length;
    const cOpened = c.leads.filter((l) => l.openedAt).length;
    const cReplied = c.leads.filter((l) => l.repliedAt).length;
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      sent: cSent,
      opened: cOpened,
      replied: cReplied,
      openRate: cSent > 0 ? Math.round((cOpened / cSent) * 1000) / 10 : 0,
    };
  });

  return NextResponse.json({
    stats: {
      totalLeads,
      activeCampaigns,
      openRate,
      replyRate,
    },
    recentLeads: recentLeads.map((l) => ({
      id: l.id,
      name: l.company?.name ?? "Unknown",
      category: l.company?.category ?? "",
      city: l.company?.city ?? "",
      state: l.company?.state ?? "",
      score: l.qualificationScore ?? 0,
      status: l.status,
    })),
    campaignPerformance: campaignPerf,
  });
}
