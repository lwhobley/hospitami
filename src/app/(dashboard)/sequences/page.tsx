"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Workflow,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
  Copy,
} from "lucide-react";

interface SequenceData {
  id: string;
  name: string;
  description: string;
  steps: {
    type: "email" | "wait";
    subject?: string;
    waitDays?: number;
    preview?: string;
  }[];
  campaignCount: number;
  avgOpenRate?: number;
  avgReplyRate?: number;
}

const sampleSequences: SequenceData[] = [
  {
    id: "1",
    name: "Fine Dining Outreach",
    description: "3-step sequence for upscale restaurant prospects",
    steps: [
      {
        type: "email",
        subject: "Helping {{business_name}} elevate guest experiences",
        preview:
          "Hi {{contact_name}}, I noticed {{business_name}}'s growing event programming...",
      },
      { type: "wait", waitDays: 3 },
      {
        type: "email",
        subject: "Quick follow-up on guest engagement",
        preview:
          "{{contact_name}}, wanted to share a quick case study from a similar restaurant...",
      },
      { type: "wait", waitDays: 5 },
      {
        type: "email",
        subject: "One more thought for {{business_name}}",
        preview:
          "Hi {{contact_name}}, I realize you're busy - just wanted to leave you with this...",
      },
    ],
    campaignCount: 3,
    avgOpenRate: 38.5,
    avgReplyRate: 9.2,
  },
  {
    id: "2",
    name: "Hotel Event Sales",
    description: "4-step sequence for hotel event sales managers",
    steps: [
      {
        type: "email",
        subject: "Streamlining event bookings at {{business_name}}",
        preview: "Hi {{contact_name}}, I noticed your hotel hosts a range of events...",
      },
      { type: "wait", waitDays: 2 },
      {
        type: "email",
        subject: "Re: Event bookings at {{business_name}}",
        preview: "Just wanted to share how similar hotels are handling event engagement...",
      },
      { type: "wait", waitDays: 4 },
      {
        type: "email",
        subject: "A quick win for {{business_name}} events",
        preview: "{{contact_name}}, one idea that might resonate...",
      },
      { type: "wait", waitDays: 7 },
      {
        type: "email",
        subject: "Closing the loop",
        preview: "Hi {{contact_name}}, wanted to close the loop on my previous messages...",
      },
    ],
    campaignCount: 2,
    avgOpenRate: 34.1,
    avgReplyRate: 7.8,
  },
  {
    id: "3",
    name: "Venue Introduction",
    description: "Short 2-step sequence for event venue prospects",
    steps: [
      {
        type: "email",
        subject: "Guest engagement for {{business_name}}",
        preview: "Hi {{contact_name}}, with {{business_name}} hosting 200+ events...",
      },
      { type: "wait", waitDays: 4 },
      {
        type: "email",
        subject: "Quick thought on event follow-up",
        preview: "{{contact_name}}, one thing I keep hearing from venue operators...",
      },
    ],
    campaignCount: 1,
    avgOpenRate: 41.2,
    avgReplyRate: 11.5,
  },
];

export default function SequencesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Sequences"
        description="Multi-step outreach templates"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Generate
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Sequence
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Sequence</DialogTitle>
                  <DialogDescription>
                    Build a multi-step outreach sequence.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="e.g., Fine Dining Outreach" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the target audience and goals..."
                      className="resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        {sampleSequences.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Workflow className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No sequences yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first outreach sequence
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sampleSequences.map((seq) => (
              <Card key={seq.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">{seq.name}</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {seq.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Clone
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {seq.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {step.type === "email" ? (
                          <div className="flex min-w-[200px] items-start gap-2 rounded-lg border p-3">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">
                                {step.subject}
                              </p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                                {step.preview}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Wait {step.waitDays}d
                            </span>
                          </div>
                        )}
                        {i < seq.steps.length - 1 && (
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
                    <span>{seq.campaignCount} campaigns</span>
                    {seq.avgOpenRate && <span>Avg open: {seq.avgOpenRate}%</span>}
                    {seq.avgReplyRate && <span>Avg reply: {seq.avgReplyRate}%</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
