"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Send, Pause, Play, BarChart3 } from "lucide-react";

interface CampaignData {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  sequence: string;
  sender: string;
  totalLeads: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  createdAt: string;
  startedAt?: string;
}

const sampleCampaigns: CampaignData[] = [
  {
    id: "1",
    name: "Q3 Houston Fine Dining",
    status: "active",
    sequence: "Fine Dining Outreach",
    sender: "sarah@hospitami.com",
    totalLeads: 47,
    sent: 245,
    opened: 98,
    clicked: 34,
    replied: 21,
    createdAt: "2024-07-01",
    startedAt: "2024-07-05",
  },
  {
    id: "2",
    name: "Boutique Hotels - TX",
    status: "active",
    sequence: "Hotel Event Sales",
    sender: "mike@hospitami.com",
    totalLeads: 32,
    sent: 180,
    opened: 72,
    clicked: 25,
    replied: 15,
    createdAt: "2024-07-03",
    startedAt: "2024-07-07",
  },
  {
    id: "3",
    name: "Event Venues Outreach",
    status: "active",
    sequence: "Venue Introduction",
    sender: "sarah@hospitami.com",
    totalLeads: 23,
    sent: 320,
    opened: 134,
    clicked: 48,
    replied: 28,
    createdAt: "2024-06-25",
    startedAt: "2024-06-28",
  },
  {
    id: "4",
    name: "Catering Companies Q3",
    status: "paused",
    sequence: "Fine Dining Outreach",
    sender: "mike@hospitami.com",
    totalLeads: 18,
    sent: 150,
    opened: 45,
    clicked: 12,
    replied: 8,
    createdAt: "2024-07-10",
    startedAt: "2024-07-12",
  },
  {
    id: "5",
    name: "Luxury Hotels Draft",
    status: "draft",
    sequence: "Hotel Event Sales",
    sender: "sarah@hospitami.com",
    totalLeads: 15,
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    createdAt: "2024-07-20",
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
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

  const filtered =
    tab === "all"
      ? sampleCampaigns
      : sampleCampaigns.filter((c) => c.status === tab);

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
            <TabsTrigger value="all">
              All ({sampleCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({sampleCampaigns.filter((c) => c.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Paused ({sampleCampaigns.filter((c) => c.status === "paused").length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft ({sampleCampaigns.filter((c) => c.status === "draft").length})
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
              {filtered.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {campaign.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {campaign.totalLeads} leads
                    </p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[campaign.status]?.className}`}
                    >
                      {statusConfig[campaign.status]?.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{campaign.sequence}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {campaign.sender}
                  </TableCell>
                  <TableCell className="text-right text-sm">{campaign.sent}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm">{campaign.opened}</span>
                    {campaign.sent > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({Math.round((campaign.opened / campaign.sent) * 100)}%)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm">{campaign.replied}</span>
                    {campaign.sent > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({Math.round((campaign.replied / campaign.sent) * 100)}%)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {campaign.status === "active" && (
                        <Button variant="ghost" size="sm">
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {campaign.status === "paused" && (
                        <Button variant="ghost" size="sm">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" render={<Link href={`/campaigns/${campaign.id}`} />}>
                          <BarChart3 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
