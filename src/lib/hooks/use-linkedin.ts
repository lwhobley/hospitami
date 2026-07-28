"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface LinkedInLead {
  leadId?: string;
  businessName: string;
  contactName: string;
  contactTitle?: string;
  category?: string;
  warmSignals?: string[];
  linkedinUrl?: string;
}

export function useGenerateLinkedInMessage() {
  const { workspaceId } = useWorkspace();

  return useMutation<
    { message: string; charCount: number; charLimit: number },
    Error,
    { lead: LinkedInLead; type: "connection" | "inmail" }
  >({
    mutationFn: async ({ lead, type }) => {
      const res = await fetch(`/api/linkedin/compose?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.leadId,
          type,
          businessName: lead.businessName,
          contactName: lead.contactName,
          contactTitle: lead.contactTitle,
          category: lead.category,
          warmSignals: lead.warmSignals ?? [],
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to generate message");
      }
      return res.json() as Promise<{ message: string; charCount: number; charLimit: number }>;
    },
  });
}

export function useMarkLinkedInSent() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      contactName,
      type,
      message,
    }: {
      leadId: string;
      contactName: string;
      type: "connection" | "inmail";
      message: string;
    }) => {
      const res = await fetch(`/api/linkedin/mark-sent?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, contactName, type, message }),
      });
      if (!res.ok) throw new Error("Failed to record activity");
      return res.json();
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["list"] });
    },
  });
}
