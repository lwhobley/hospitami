"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Inbox,
  Search,
  Star,
  StarOff,
  Archive,
  Sparkles,
  Send,
} from "lucide-react";
import { useInbox, useSendReply, type InboxThread } from "@/lib/hooks/use-inbox";
import { useSenders } from "@/lib/hooks/use-senders";
import { toast } from "sonner";

export default function InboxPage() {
  const { data: threads = [], isLoading } = useInbox();
  const { data: senderData } = useSenders();
  const sendReply = useSendReply();

  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");

  const selectedFull =
    threads.find((t) => t.id === selectedThread?.id) ?? selectedThread;

  const filtered = threads.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.contactName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = threads.filter((t) => !t.isRead).length;

  function handleSend() {
    if (!selectedFull || !replyText.trim()) return;
    const accountId = senderData?.accounts[0]?.id;
    if (!accountId) {
      toast.error("No sender account configured");
      return;
    }
    sendReply.mutate(
      { threadId: selectedFull.id, body: replyText, senderAccountId: accountId },
      {
        onSuccess: () => {
          setReplyText("");
          toast.success("Reply sent");
        },
        onError: () => toast.error("Failed to send reply"),
      }
    );
  }

  return (
    <>
      <PageHeader
        title="Inbox"
        description={`${unreadCount} unread conversation${unreadCount !== 1 ? "s" : ""}`}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Thread List */}
        <div className="w-80 shrink-0 border-r">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="h-8 pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-8.5rem)]">
            {isLoading ? (
              <div className="space-y-px p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16">
                <Inbox className="mb-3 h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No conversations</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedFull?.id === thread.id ? "bg-muted" : ""
                    } ${!thread.isRead ? "bg-primary/[0.02]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-sm ${!thread.isRead ? "font-semibold" : "font-medium"}`}
                      >
                        {thread.contactName ?? thread.contactEmail}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {new Date(thread.lastMessageAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {thread.subject}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {!thread.isRead && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Thread Detail */}
        {selectedFull ? (
          <div className="flex flex-1 flex-col">
            <div className="border-b px-6 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{selectedFull.subject}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedFull.contactName} &lt;{selectedFull.contactEmail}&gt;
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    {selectedFull.isStarred ? (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {selectedFull.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${
                      msg.direction === "INBOUND"
                        ? "ml-0 mr-12 bg-muted/50"
                        : "ml-12 mr-0 bg-background"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium">
                          {msg.fromName ?? msg.fromEmail}
                        </span>
                        <span className="ml-1.5 text-[10px] text-muted-foreground">
                          &lt;{msg.fromEmail}&gt;
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.sentAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your reply..."
                  className="min-h-[80px] resize-none text-sm"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" disabled>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    AI Draft
                  </Button>
                  <Button
                    size="sm"
                    disabled={!replyText.trim() || sendReply.isPending}
                    onClick={handleSend}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    {sendReply.isPending ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs text-muted-foreground">
                Choose a thread from the list to view
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
