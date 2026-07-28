"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface LeadList {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  isSmartList: boolean;
  createdAt: string;
  _count: { members: number; leads?: number };
}

export interface ListDetail {
  list: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    isSmartList: boolean;
    leadCount: number;
  };
  leads: Array<{
    id: string;
    businessName: string;
    category: string;
    contactName: string;
    contactTitle: string;
    contactEmail: string;
    city: string;
    state: string;
    score: number;
    status: string;
    warmSignals: string[];
    addedAt: string;
  }>;
}

export function useLists() {
  const { workspaceId } = useWorkspace();

  return useQuery<LeadList[]>({
    queryKey: ["lists", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId! });
      const res = await fetch(`/api/lists?${params}`);
      if (!res.ok) throw new Error("Failed to load lists");
      const data = await res.json() as { lists: LeadList[] };
      return data.lists;
    },
    enabled: !!workspaceId,
  });
}

export function useList(id: string) {
  const { workspaceId } = useWorkspace();

  return useQuery<ListDetail>({
    queryKey: ["list", id, workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId! });
      const res = await fetch(`/api/lists/${id}?${params}`);
      if (!res.ok) throw new Error("Failed to load list");
      return res.json() as Promise<ListDetail>;
    },
    enabled: !!workspaceId && !!id,
  });
}

export function useCreateList() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string; leadIds?: string[] }) => {
      const res = await fetch(`/api/lists?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, workspaceId }),
      });
      if (!res.ok) throw new Error("Failed to create list");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", workspaceId] });
    },
  });
}

export function useUpdateList() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; addLeadIds?: string[]; removeLeadIds?: string[] }) => {
      const res = await fetch(`/api/lists/${id}?workspaceId=${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update list");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["list", id, workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["lists", workspaceId] });
    },
  });
}
