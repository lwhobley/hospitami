"use client";

import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

interface DashboardStats {
  totalLeads: number;
  activeCampaigns: number;
  openRate: number;
  replyRate: number;
}

interface RecentLead {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
  score: number;
  status: string;
}

interface CampaignPerf {
  id: string;
  name: string;
  status: string;
  sent: number;
  opened: number;
  replied: number;
  openRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentLeads: RecentLead[];
  campaignPerformance: CampaignPerf[];
}

export function useDashboard() {
  const { workspaceId } = useWorkspace();

  return useQuery<DashboardData>({
    queryKey: ["dashboard", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId! });
      const res = await fetch(`/api/dashboard?${params}`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json() as Promise<DashboardData>;
    },
    enabled: !!workspaceId,
  });
}
