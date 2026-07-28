"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Send,
  Users,
  Mail,
  MousePointerClick,
  MessageSquare,
  Pause,
  Play,
  Settings,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useCampaign, useUpdateCampaignStatus, useSendCampaign } from "@/lib/hooks/use-campaigns";
import { LinkedInComposer } from "@/components/linkedin/linkedin-composer";
import { type LinkedInLead } from "@/lib/hooks/use-linkedin";
import { toast } from "sonner";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

const leadStatusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  sent: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  opened: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  clicked: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  replied: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useCampaign(id);
  const updateStatus = useUpdateCampaignStatus();
  const sendCampaign = useSendCampaign();

  const [linkedInLead, setLinkedInLead] = useState<LinkedInLead | null>(null);
  const [linkedInOpen, setLinkedInOpen] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { campaign, stats, leads } = data;

  const campaignStats = [
    { label: "Total Leads", value: String(stats.total), icon: Users },
    { label: "Emails Sent", value: String(stats.sent), icon: Send },
    {
      label: "Opened Rate",
      value: stats.sent > 0 ? `${stats.opened} (${Math.round((stats.opened / stats.sent) * 100)}%)` : "0 (0%)",
      icon: Mail,
    },
    {
      label: "Reply Rate",
      value: stats.sent > 0 ? `${stats.replied} (${Math.round((stats.replied / stats.sent) * 100)}%)` : "0 (0%)",
      icon: MessageSquare,
    },
  ];

  function handleToggleStatus() {
    const nextStatus = campaign.status.toLowerCase() === "active" ? "PAUSED" : "ACTIVE";
    updateStatus.mutate(
      { id, status: nextStatus },
      {
        onSuccess: () => toast.success(`Campaign status updated to ${nextStatus}`),
        onError: () => toast.error("Failed to update status"),
      }
    );
  }

  function handleExecuteSend() {
    sendCampaign.mutate(id, {
      onSuccess: () => toast.success("Outreach batch execution triggered"),
      onError: (err) => toast.error(err.message || "Failed to trigger batch send"),
    });
  }

  return (
    <>
      <PageHeader
        title={campaign.name}
        description={`Status: ${campaign.status} • ${leads.length} prospect leads`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/campaigns" />}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              All Campaigns
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={updateStatus.isPending}
            >
              {campaign.status.toLowerCase() === "active" ? (
                <>
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  Activate
                </>
              )}
            </Button>

            <Button size="sm" onClick={handleExecuteSend} disabled={sendCampaign.isPending}>
              {sendCampaign.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-3.5 w-3.5" />
              )}
              Send Batch
            </Button>
          </div>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Campaign Stats Bar */}
        <div className="grid gap-4 md:grid-cols-4">
          {campaignStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Outreach Sequence</p>
                <p className="font-medium">{campaign.sequence?.name ?? "Default Hospitality Outreach"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sending Email</p>
                <p className="font-medium">{campaign.sender?.email ?? "outreach@venuewrangler.com"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Channel Strategy</p>
                <p className="font-medium">Email (SMTP) + LinkedIn Multi-channel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads" className="text-xs">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Campaign Prospects ({leads.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="text-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              Pre-Flight Sequence Review
            </TabsTrigger>
          </TabsList>

          {/* Prospects Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Prospect Leads & Status</CardTitle>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No leads added to this campaign yet. Add leads from the AI Lead Finder.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-center">Sequence Step</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            <p className="text-sm font-semibold">{lead.businessName}</p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>
                              <p className="font-medium">{lead.contactName || "—"}</p>
                              <p className="text-xs text-muted-foreground">{lead.contactTitle}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            Step {lead.currentStep} / {lead.totalSteps || 3}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                                leadStatusColors[lead.status] ?? "bg-muted text-muted-foreground"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(lead.lastActivity).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setLinkedInLead({
                                    contactName: lead.contactName || lead.businessName,
                                    contactTitle: lead.contactTitle,
                                    businessName: lead.businessName,
                                    category: "Hospitality",
                                    warmSignals: [],
                                  });
                                  setLinkedInOpen(true);
                                }}
                              >
                                <LinkedInIcon className="mr-1 h-3 w-3 text-[#0077B5]" />
                                LinkedIn
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pre-Flight Sequence Review Tab */}
          <TabsContent value="drafts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Sequence Steps & Copy Preview</CardTitle>
                <CardDescription className="text-xs">
                  Inspect the email sequence steps configured for this campaign.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaign.sequence?.steps && campaign.sequence.steps.length > 0 ? (
                  <div className="space-y-4">
                    {campaign.sequence.steps.map((step, i) => (
                      <Card key={i} className="border bg-muted/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Step {step.order}: Email Outreach
                            </p>
                            <Badge variant="secondary" className="text-[10px]">
                              <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                              Ready
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                          <div className="rounded border bg-background p-3">
                            <p className="font-semibold text-foreground">
                              Subject: {step.subject || "No subject set"}
                            </p>
                            <div className="mt-2 whitespace-pre-line text-muted-foreground">
                              {step.body || "No body text set"}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No sequence steps found for this campaign.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* LinkedIn Outreach Drawer */}
      <LinkedInComposer
        open={linkedInOpen}
        onOpenChange={setLinkedInOpen}
        lead={linkedInLead}
      />
    </>
  );
}
