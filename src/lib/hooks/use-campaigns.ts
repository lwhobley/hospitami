"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface Campaign {
  id: string;
  name: string;
  status: string;
  sequence?: { id: string; name: string } | null;
  senderAccount?: { id: string; email: string; name: string } | null;
  _count?: { leads: number };
  createdAt: string;
  startedAt?: string | null;
}

export interface CampaignDetail {
  campaign: {
    id: string;
    name: string;
    status: string;
    sequence: { id: string; name: string; steps: Array<{ order: number; subject?: string; body?: string }> } | null;
    sender: { id: string; email: string; name: string } | null;
    startedAt: string | null;
    completedAt: string | null;
  };
  stats: { sent: number; opened: number; clicked: number; replied: number; total: number };
  leads: Array<{
    id: string;
    leadId: string;
    businessName: string;
    contactName: string;
    contactTitle: string;
    currentStep: number;
    totalSteps: number;
    status: string;
    sentAt: string | null;
    openedAt: string | null;
    clickedAt: string | null;
    repliedAt: string | null;
    lastActivity: string;
  }>;
}

export function useCampaigns(status?: string) {
  const { workspaceId } = useWorkspace();

  return useQuery<Campaign[]>({
    queryKey: ["campaigns", workspaceId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.set("workspaceId", workspaceId);
      if (status) params.set("status", status);
      const res = await fetch(`/api/campaigns${params.toString() ? `?${params.toString()}` : ""}`);
      if (!res.ok) throw new Error("Failed to load campaigns");
      const data = (await res.json()) as { campaigns: Campaign[] };
      return data.campaigns ?? [];
    },
  });
}

export function useCampaign(id: string) {
  const { workspaceId } = useWorkspace();

  return useQuery<CampaignDetail>({
    queryKey: ["campaign", id, workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.set("workspaceId", workspaceId);
      const res = await fetch(`/api/campaigns/${id}${params.toString() ? `?${params.toString()}` : ""}`);
      if (!res.ok) throw new Error("Failed to load campaign detail");
      return res.json() as Promise<CampaignDetail>;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      sequenceId?: string;
      senderAccountId?: string;
      leadIds?: string[];
    }) => {
      const res = await fetch(`/api/campaigns${workspaceId ? `?workspaceId=${workspaceId}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, workspaceId }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateCampaignStatus() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/campaigns/${id}${workspaceId ? `?workspaceId=${workspaceId}` : ""}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSendCampaign() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await fetch(
        `/api/campaigns/${campaignId}/send${workspaceId ? `?workspaceId=${workspaceId}` : ""}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to send campaign");
      return res.json();
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
