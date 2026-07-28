import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const workspaceId = sp.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wsId = ctx.workspace.id;

  const [campaigns, senderAccounts, recentActivity] = await Promise.all([
    prisma.campaign.findMany({
      where: { workspaceId: wsId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        senderAccount: { select: { email: true, name: true } },
        leads: {
          select: { sentAt: true, openedAt: true, clickedAt: true, repliedAt: true },
        },
      },
    }),

    prisma.senderAccount.findMany({
      where: { workspaceId: wsId },
      include: {
        campaigns: {
          include: {
            leads: {
              select: { sentAt: true, openedAt: true, repliedAt: true },
            },
          },
        },
      },
    }),

    prisma.activity.findMany({
      where: { lead: { workspaceId: wsId } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { createdAt: true, type: true },
    }),
  ]);

  // Campaign comparison data
  const campaignComparison = campaigns.map((c) => {
    const sent = c.leads.filter((l) => l.sentAt).length;
    const opened = c.leads.filter((l) => l.openedAt).length;
    const clicked = c.leads.filter((l) => l.clickedAt).length;
    const replied = c.leads.filter((l) => l.repliedAt).length;
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      sender: c.senderAccount?.email ?? "unknown",
      sent,
      opened,
      clicked,
      replied,
      openRate: sent > 0 ? Math.round((opened / sent) * 1000) / 10 : 0,
      clickRate: sent > 0 ? Math.round((clicked / sent) * 1000) / 10 : 0,
      replyRate: sent > 0 ? Math.round((replied / sent) * 1000) / 10 : 0,
    };
  });

  // Sender performance
  const senderPerformance = senderAccounts.map((s) => {
    const allLeads = s.campaigns.flatMap((c) => c.leads);
    const sent = allLeads.filter((l) => l.sentAt).length;
    const opened = allLeads.filter((l) => l.openedAt).length;
    const replied = allLeads.filter((l) => l.repliedAt).length;
    return {
      id: s.id,
      email: s.email,
      name: s.name,
      status: s.status,
      sent,
      openRate: sent > 0 ? Math.round((opened / sent) * 1000) / 10 : 0,
      replyRate: sent > 0 ? Math.round((replied / sent) * 1000) / 10 : 0,
    };
  });

  // Weekly activity bucketing (last 8 weeks)
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (7 - i) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end, label: `W${i + 1}` };
  });

  const weeklyData = weeks.map((w) => ({
    week: w.label,
    emails: recentActivity.filter(
      (a) =>
        a.type === "email_sent" &&
        new Date(a.createdAt) >= w.start &&
        new Date(a.createdAt) < w.end
    ).length,
    replies: recentActivity.filter(
      (a) =>
        a.type === "reply_received" &&
        new Date(a.createdAt) >= w.start &&
        new Date(a.createdAt) < w.end
    ).length,
  }));

  return NextResponse.json({ campaignComparison, senderPerformance, weeklyData });
}
