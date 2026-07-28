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
  Reply,
  ChevronRight,
} from "lucide-react";

interface Thread {
  id: string;
  subject: string;
  contactName: string;
  contactEmail: string;
  campaign?: string;
  isRead: boolean;
  isStarred: boolean;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  messages: {
    id: string;
    direction: "inbound" | "outbound";
    fromName: string;
    fromEmail: string;
    body: string;
    sentAt: string;
  }[];
}

const sampleThreads: Thread[] = [
  {
    id: "1",
    subject: "Re: Helping Underbelly Hospitality elevate guest experiences",
    contactName: "Chris Shepherd",
    contactEmail: "chris@underbellyhospitality.com",
    campaign: "Q3 Houston Fine Dining",
    isRead: false,
    isStarred: true,
    lastMessage:
      "Thanks for reaching out! We've been looking into better tools for our events. Can you share more about what you offer?",
    lastMessageAt: "2024-07-26T14:30:00Z",
    messageCount: 3,
    messages: [
      {
        id: "m1",
        direction: "outbound",
        fromName: "Sarah Mitchell",
        fromEmail: "sarah@hospitami.com",
        body: "Hi Chris, I noticed Underbelly Hospitality's growing event programming and multi-location expansion. I wanted to reach out because we help hospitality groups like yours streamline guest engagement and event sales.\n\nWould you be open to a quick chat about how we could help?",
        sentAt: "2024-07-20T09:00:00Z",
      },
      {
        id: "m2",
        direction: "outbound",
        fromName: "Sarah Mitchell",
        fromEmail: "sarah@hospitami.com",
        body: "Hi Chris, wanted to follow up on my previous note. I've been working with similar restaurant groups and thought you might find this case study interesting - a James Beard-recognized group saw a 40% increase in event bookings after implementing a modern engagement platform.",
        sentAt: "2024-07-23T10:00:00Z",
      },
      {
        id: "m3",
        direction: "inbound",
        fromName: "Chris Shepherd",
        fromEmail: "chris@underbellyhospitality.com",
        body: "Thanks for reaching out! We've been looking into better tools for our events. Can you share more about what you offer? We're particularly interested in managing private dining and event inquiries across our locations.",
        sentAt: "2024-07-26T14:30:00Z",
      },
    ],
  },
  {
    id: "2",
    subject: "Re: Streamlining event bookings at Hotel Granduca Houston",
    contactName: "Roberto Brancaccio",
    contactEmail: "rbrancaccio@granducahouston.com",
    campaign: "Boutique Hotels - TX",
    isRead: false,
    isStarred: false,
    lastMessage:
      "We're about to start our annual planning. Can we schedule a call next week?",
    lastMessageAt: "2024-07-25T16:45:00Z",
    messageCount: 2,
    messages: [
      {
        id: "m4",
        direction: "outbound",
        fromName: "Mike Thompson",
        fromEmail: "mike@hospitami.com",
        body: "Hi Roberto, I noticed Hotel Granduca's beautiful event spaces and wedding packages. Having worked with similar boutique hotels, I thought you might be interested in how we help hotels streamline their event inquiry-to-booking pipeline.",
        sentAt: "2024-07-22T09:30:00Z",
      },
      {
        id: "m5",
        direction: "inbound",
        fromName: "Roberto Brancaccio",
        fromEmail: "rbrancaccio@granducahouston.com",
        body: "We're about to start our annual planning. Can we schedule a call next week? I'm free Tuesday or Wednesday afternoon.",
        sentAt: "2024-07-25T16:45:00Z",
      },
    ],
  },
  {
    id: "3",
    subject: "Re: Guest engagement for The Astorian",
    contactName: "Jennifer Chen",
    contactEmail: "events@theastorian.com",
    campaign: "Event Venues Outreach",
    isRead: true,
    isStarred: false,
    lastMessage:
      "Interesting approach. We currently use a mix of spreadsheets and email. Send me some info?",
    lastMessageAt: "2024-07-24T11:20:00Z",
    messageCount: 2,
    messages: [
      {
        id: "m6",
        direction: "outbound",
        fromName: "Sarah Mitchell",
        fromEmail: "sarah@hospitami.com",
        body: "Hi Jennifer, with The Astorian hosting 200+ events annually, I imagine managing follow-up and guest engagement at scale is a real challenge. We've been helping event venues streamline this process - would love to share some ideas.",
        sentAt: "2024-07-21T10:15:00Z",
      },
      {
        id: "m7",
        direction: "inbound",
        fromName: "Jennifer Chen",
        fromEmail: "events@theastorian.com",
        body: "Interesting approach. We currently use a mix of spreadsheets and email for event management. We've been looking to modernize. Send me some info?",
        sentAt: "2024-07-24T11:20:00Z",
      },
    ],
  },
  {
    id: "4",
    subject: "Re: One more thought for Brennan's of Houston",
    contactName: "Alex Brennan-Martin",
    contactEmail: "info@brennanshouston.com",
    campaign: "Q3 Houston Fine Dining",
    isRead: true,
    isStarred: false,
    lastMessage: "Not interested at this time, but thanks for thinking of us.",
    lastMessageAt: "2024-07-23T09:00:00Z",
    messageCount: 4,
    messages: [
      {
        id: "m8",
        direction: "outbound",
        fromName: "Sarah Mitchell",
        fromEmail: "sarah@hospitami.com",
        body: "Hi Alex, I noticed Brennan's incredible 45-year legacy and extensive private dining capabilities.",
        sentAt: "2024-07-15T09:00:00Z",
      },
      {
        id: "m9",
        direction: "inbound",
        fromName: "Alex Brennan-Martin",
        fromEmail: "info@brennanshouston.com",
        body: "Not interested at this time, but thanks for thinking of us.",
        sentAt: "2024-07-23T09:00:00Z",
      },
    ],
  },
];

export default function InboxPage() {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(
    sampleThreads[0]
  );
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");

  const filtered = sampleThreads.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = sampleThreads.filter((t) => !t.isRead).length;

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
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
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
                      selectedThread?.id === thread.id ? "bg-muted" : ""
                    } ${!thread.isRead ? "bg-primary/[0.02]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm truncate ${!thread.isRead ? "font-semibold" : "font-medium"}`}
                      >
                        {thread.contactName}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {new Date(thread.lastMessageAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {thread.subject}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {thread.lastMessage}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {thread.campaign && (
                        <Badge variant="outline" className="text-[9px]">
                          {thread.campaign}
                        </Badge>
                      )}
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
        {selectedThread ? (
          <div className="flex flex-1 flex-col">
            <div className="border-b px-6 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{selectedThread.subject}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedThread.contactName} &lt;{selectedThread.contactEmail}&gt;
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    {selectedThread.isStarred ? (
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
                {selectedThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${
                      msg.direction === "inbound"
                        ? "bg-muted/50 ml-0 mr-12"
                        : "bg-background ml-12 mr-0"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium">{msg.fromName}</span>
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply */}
            <div className="border-t p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your reply..."
                  className="min-h-[80px] resize-none text-sm"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    AI Draft
                  </Button>
                  <Button size="sm" disabled={!replyText.trim()}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Send Reply
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
