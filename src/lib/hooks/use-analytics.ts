"use client";

import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface CampaignComparison {
  id: string;
  name: string;
  status: string;
  sender: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
}

export interface SenderPerformance {
  id: string;
  email: string;
  name: string;
  status: string;
  sent: number;
  openRate: number;
  replyRate: number;
}

export interface WeeklyData {
  week: string;
  emails: number;
  replies: number;
}

export interface AnalyticsData {
  campaignComparison: CampaignComparison[];
  senderPerformance: SenderPerformance[];
  weeklyData: WeeklyData[];
}

export function useAnalytics() {
  const { workspaceId } = useWorkspace();

  return useQuery<AnalyticsData>({
    queryKey: ["analytics", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId! });
      const res = await fetch(`/api/analytics?${params}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json() as Promise<AnalyticsData>;
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}
