"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface SequenceStep {
  id: string;
  type: "EMAIL" | "WAIT" | "CONDITION";
  subject: string | null;
  body: string | null;
  waitDays: number | null;
  order: number;
}

export interface Sequence {
  id: string;
  name: string;
  description: string | null;
  steps: SequenceStep[];
  _count: { campaigns: number };
  createdAt: string;
}

export function useSequences() {
  const { workspaceId } = useWorkspace();

  return useQuery<Sequence[]>({
    queryKey: ["sequences", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId! });
      const res = await fetch(`/api/sequences?${params}`);
      if (!res.ok) throw new Error("Failed to load sequences");
      return res.json() as Promise<Sequence[]>;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateSequence() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      steps?: Array<{ type: string; subject?: string; body?: string; waitDays?: number }>;
    }) => {
      const res = await fetch(`/api/sequences?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, workspaceId }),
      });
      if (!res.ok) throw new Error("Failed to create sequence");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences", workspaceId] });
    },
  });
}
