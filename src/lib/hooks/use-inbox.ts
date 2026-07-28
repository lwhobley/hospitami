"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/lib/workspace-context";

export interface InboxMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  fromEmail: string;
  fromName: string | null;
  toEmail: string;
  subject: string | null;
  body: string;
  sentAt: string;
}

export interface InboxThread {
  id: string;
  subject: string;
  contactEmail: string;
  contactName: string | null;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  lastMessageAt: string;
  campaignId: string | null;
  messages: InboxMessage[];
}

export function useInbox(unreadOnly = false) {
  const { workspaceId } = useWorkspace();

  return useQuery<InboxThread[]>({
    queryKey: ["inbox", workspaceId, unreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.set("workspaceId", workspaceId);
      if (unreadOnly) params.set("unreadOnly", "true");
      const res = await fetch(`/api/inbox${params.toString() ? `?${params.toString()}` : ""}`);
      if (!res.ok) throw new Error("Failed to load inbox");
      const data = await res.json();
      return Array.isArray(data) ? data : data.threads ?? [];
    },
    refetchInterval: 60 * 1000,
  });
}

export function useMarkRead() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      // Optimistically update
      return threadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", workspaceId] });
    },
  });
}

export function useSendReply() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      body,
      senderAccountId,
    }: {
      threadId: string;
      body: string;
      senderAccountId: string;
    }) => {
      const res = await fetch(
        `/api/inbox/${threadId}/reply?workspaceId=${workspaceId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body, senderAccountId }),
        }
      );
      if (!res.ok) throw new Error("Failed to send reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", workspaceId] });
    },
  });
}
