"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface DiscoveredLead {
  businessName: string;
  category: string;
  subcategory?: string;
  website?: string;
  phone?: string;
  address?: string;
  city: string;
  state: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  linkedinUrl?: string;
  description?: string;
  warmSignals?: string[];
  qualificationScore?: number;
  confidence?: number;
  reasoning?: string;
}

export interface FinderResult {
  leads: DiscoveredLead[];
  jobId: string;
}

export function useSearchLeads() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation<FinderResult, Error, { prompt: string }>({
    mutationFn: async ({ prompt }) => {
      const res = await fetch(`/api/finder?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, workspaceId }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Search failed");
      }
      return res.json() as Promise<FinderResult>;
    },
  });
}

export function useSaveLeads() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leads: DiscoveredLead[]) => {
      const payload = leads.map((l) => ({
        businessName: l.businessName,
        category: l.category,
        subcategory: l.subcategory,
        website: l.website,
        phone: l.phone,
        city: l.city,
        state: l.state,
        description: l.description,
        contactName: l.contactName,
        contactTitle: l.contactTitle,
        contactEmail: l.contactEmail,
        linkedinUrl: l.linkedinUrl,
        warmSignals: l.warmSignals,
        qualificationScore: l.qualificationScore,
        aiSummary: l.description,
        personalizationAngle: l.reasoning,
        source: "gemini-ai-search",
        confidence: l.confidence ?? 0.7,
      }));

      const res = await fetch(`/api/leads${workspaceId ? `?workspaceId=${workspaceId}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: payload, workspaceId }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error ?? "Failed to save leads");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useGenerateOutreach() {
  const { workspaceId } = useWorkspace();

  return useMutation({
    mutationFn: async ({
      leadId,
      type = "initial",
      stepNumber,
      originalSubject,
    }: {
      leadId: string;
      type?: "initial" | "followup";
      stepNumber?: number;
      originalSubject?: string;
    }) => {
      const res = await fetch(`/api/outreach/generate?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, type, stepNumber, originalSubject }),
      });
      if (!res.ok) throw new Error("Outreach generation failed");
      return res.json() as Promise<{ subject: string; body: string }>;
    },
  });
}
