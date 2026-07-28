"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Send,
  UserPlus,
  Mail,
} from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}
import { useGenerateLinkedInMessage, useMarkLinkedInSent, type LinkedInLead } from "@/lib/hooks/use-linkedin";
import { toast } from "sonner";

interface LinkedInComposerProps {
  lead: LinkedInLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONNECTION_LIMIT = 300;
const INMAIL_LIMIT = 8000;

export function LinkedInComposer({ lead, open, onOpenChange }: LinkedInComposerProps) {
  const [type, setType] = useState<"connection" | "inmail">("connection");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [markedSent, setMarkedSent] = useState(false);

  const generate = useGenerateLinkedInMessage();
  const markSent = useMarkLinkedInSent();

  const limit = type === "connection" ? CONNECTION_LIMIT : INMAIL_LIMIT;
  const charCount = message.length;
  const overLimit = charCount > limit;

  function handleGenerate() {
    if (!lead) return;
    generate.mutate(
      { lead, type },
      {
        onSuccess: (data) => {
          setMessage(data.message);
          setMarkedSent(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMarkSent() {
    if (!lead?.leadId || !message.trim()) return;
    markSent.mutate(
      {
        leadId: lead.leadId,
        contactName: lead.contactName,
        type,
        message,
      },
      {
        onSuccess: () => {
          setMarkedSent(true);
          toast.success("Recorded as sent in activity log");
        },
        onError: () => toast.error("Failed to record activity"),
      }
    );
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      setMessage("");
      setMarkedSent(false);
    }
    onOpenChange(val);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0077B5]/10">
              <LinkedInIcon className="h-4 w-4 text-[#0077B5]" />
            </div>
            <div>
              <SheetTitle className="text-sm">LinkedIn Outreach</SheetTitle>
              <SheetDescription className="text-xs">
                {lead?.contactName} · {lead?.businessName}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* LinkedIn profile link */}
          {lead?.linkedinUrl && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-2 text-xs">
                <LinkedInIcon className="h-3.5 w-3.5 text-[#0077B5]" />
                <span className="text-muted-foreground">LinkedIn profile</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => window.open(lead.linkedinUrl, "_blank")}
              >
                Open
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Contact info */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Contact</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{lead?.contactName}</span>
              {lead?.contactTitle && (
                <span className="text-xs text-muted-foreground">{lead.contactTitle}</span>
              )}
              {lead?.category && (
                <Badge variant="secondary" className="text-[10px]">
                  {lead.category}
                </Badge>
              )}
            </div>
            {lead?.warmSignals && lead.warmSignals.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {lead.warmSignals.slice(0, 3).map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px] font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Message type toggle */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Message type</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setType("connection");
                  setMessage("");
                  setMarkedSent(false);
                }}
                className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                  type === "connection"
                    ? "border-[#0077B5] bg-[#0077B5]/5 text-[#0077B5]"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Connection Request</p>
                  <p className="text-[10px] text-muted-foreground">Max 300 chars</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setType("inmail");
                  setMessage("");
                  setMarkedSent(false);
                }}
                className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                  type === "inmail"
                    ? "border-[#0077B5] bg-[#0077B5]/5 text-[#0077B5]"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <Mail className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs font-medium">InMail</p>
                  <p className="text-[10px] text-muted-foreground">Up to 8,000 chars</p>
                </div>
              </button>
            </div>
          </div>

          {/* Message editor */}
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Message</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleGenerate}
                disabled={generate.isPending || !lead}
              >
                {generate.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                )}
                {generate.isPending ? "Generating..." : message ? "Regenerate" : "AI Draft"}
              </Button>
            </div>
            <Textarea
              placeholder={
                type === "connection"
                  ? "Write a connection request (max 300 characters)…"
                  : "Write an InMail message…"
              }
              className="min-h-[160px] resize-none text-sm"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setMarkedSent(false);
              }}
            />
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] tabular-nums ${
                  overLimit
                    ? "text-destructive font-semibold"
                    : charCount > limit * 0.9
                      ? "text-amber-600"
                      : "text-muted-foreground"
                }`}
              >
                {charCount.toLocaleString()} / {limit.toLocaleString()} chars
                {overLimit && " — over limit"}
              </span>
              {type === "connection" && charCount > 0 && (
                <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      overLimit ? "bg-destructive" : "bg-[#0077B5]"
                    }`}
                    style={{ width: `${Math.min((charCount / limit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={!message.trim()}
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy message"}
            </Button>

            {lead?.leadId && (
              <Button
                size="sm"
                className="flex-1"
                disabled={!message.trim() || markedSent || markSent.isPending || overLimit}
                onClick={handleMarkSent}
              >
                {markSent.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : markedSent ? (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                )}
                {markedSent ? "Marked sent" : "Mark as sent"}
              </Button>
            )}
          </div>
          {!lead?.linkedinUrl && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              No LinkedIn URL stored for this contact. Copy and find them manually.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
