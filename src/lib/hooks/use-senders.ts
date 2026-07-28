"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface SenderAccount {
  id: string;
  email: string;
  name: string;
  status: string;
  dailyLimit: number;
  sentToday: number;
  warmupDay: number | null;
  createdAt: string;
}

export interface SenderDomain {
  id: string;
  domain: string;
  verified: boolean;
  dkimRecord: string | null;
  spfRecord: string | null;
  dmarcRecord: string | null;
  createdAt: string;
}

export function useSenders() {
  const { workspaceId } = useWorkspace();

  return useQuery<{ accounts: SenderAccount[]; domains: SenderDomain[] }>({
    queryKey: ["senders", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId! });
      const res = await fetch(`/api/senders?${params}`);
      if (!res.ok) throw new Error("Failed to load senders");
      return res.json() as Promise<{ accounts: SenderAccount[]; domains: SenderDomain[] }>;
    },
    enabled: !!workspaceId,
  });
}

export function useAddSenderAccount() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; name?: string; dailyLimit?: number }) => {
      const res = await fetch(`/api/senders?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "account", ...data }),
      });
      if (!res.ok) throw new Error("Failed to add sender account");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senders", workspaceId] });
    },
  });
}

export function useAddSenderDomain() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: string) => {
      const res = await fetch(`/api/senders?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "domain", domain }),
      });
      if (!res.ok) throw new Error("Failed to add domain");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senders", workspaceId] });
    },
  });
}

export function useUpdateSender() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; dailyLimit?: number }) => {
      const res = await fetch(`/api/senders/${id}?workspaceId=${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update sender");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senders", workspaceId] });
    },
  });
}

export function useDeleteSender() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/senders/${id}?workspaceId=${workspaceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete sender");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senders", workspaceId] });
    },
  });
}
