"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pause, Play, BarChart3 } from "lucide-react";
import { useCampaigns, useUpdateCampaignStatus } from "@/lib/hooks/use-campaigns";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
};

export default function CampaignsPage() {
  const [tab, setTab] = useState("all");
  const { data: campaigns = [], isLoading } = useCampaigns();
  const updateStatus = useUpdateCampaignStatus();

  const filtered =
    tab === "all" ? campaigns : campaigns.filter((c) => c.status === tab);

  function handleToggle(id: string, status: string) {
    const next = status === "active" ? "paused" : "active";
    updateStatus.mutate(
      { id, status: next },
      { onError: () => toast.error("Failed to update campaign status") }
    );
  }

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Manage your outreach campaigns"
        actions={
          <Button size="sm" render={<Link href="/campaigns/new" />}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Campaign
          </Button>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({campaigns.filter((c) => c.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Paused ({campaigns.filter((c) => c.status === "paused").length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft ({campaigns.filter((c) => c.status === "draft").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sequence</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead className="text-right">Replied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-8 animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {campaign._count?.leads ?? 0} leads
                      </p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[campaign.status]?.className}`}
                      >
                        {statusConfig[campaign.status]?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {campaign.sequence?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {campaign.senderAccount?.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">—</TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm">—</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm">—</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {campaign.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(campaign.id, campaign.status)}
                            disabled={updateStatus.isPending}
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {campaign.status === "paused" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(campaign.id, campaign.status)}
                            disabled={updateStatus.isPending}
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          render={<Link href={`/campaigns/${campaign.id}`} />}
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
