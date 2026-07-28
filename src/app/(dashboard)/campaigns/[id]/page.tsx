"use client";

import { use } from "react";
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
import {
  ArrowLeft,
  Send,
  Users,
  Mail,
  MousePointerClick,
  MessageSquare,
  Pause,
  Settings,
} from "lucide-react";
import Link from "next/link";

const campaignStats = [
  { label: "Total Sent", value: "245", icon: Send },
  { label: "Opened", value: "98 (40%)", icon: Mail },
  { label: "Clicked", value: "34 (14%)", icon: MousePointerClick },
  { label: "Replied", value: "21 (8.6%)", icon: MessageSquare },
];

const campaignLeads = [
  {
    name: "Underbelly Hospitality",
    contact: "Chris Shepherd",
    step: 3,
    status: "replied",
    lastActivity: "2024-07-24",
  },
  {
    name: "Hotel Granduca Houston",
    contact: "Roberto Brancaccio",
    step: 2,
    status: "opened",
    lastActivity: "2024-07-25",
  },
  {
    name: "The Astorian",
    contact: "Jennifer Chen",
    step: 3,
    status: "clicked",
    lastActivity: "2024-07-23",
  },
  {
    name: "Brennan's of Houston",
    contact: "Alex Brennan-Martin",
    step: 1,
    status: "sent",
    lastActivity: "2024-07-26",
  },
  {
    name: "The Houstonian Hotel",
    contact: "Mark Lindsey",
    step: 2,
    status: "replied",
    lastActivity: "2024-07-22",
  },
];

const leadStatusColors: Record<string, string> = {
  sent: "bg-muted text-muted-foreground",
  opened: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  clicked: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  replied: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <>
      <PageHeader
        title="Q3 Houston Fine Dining"
        description="Active campaign with 47 leads"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/campaigns" />}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                All Campaigns
            </Button>
            <Button variant="outline" size="sm">
              <Pause className="mr-1.5 h-3.5 w-3.5" />
              Pause
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              Settings
            </Button>
          </div>
        }
      />
      <div className="flex-1 space-y-6 p-6">
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Campaign Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Sequence</p>
                <p className="font-medium">Fine Dining Outreach</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sender</p>
                <p className="font-medium">sarah@hospitami.com</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="font-medium">July 5, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campaign Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignLeads.map((lead) => (
                  <TableRow key={lead.name}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-sm">{lead.contact}</TableCell>
                    <TableCell className="text-center text-sm">
                      Step {lead.step}/3
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${leadStatusColors[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(lead.lastActivity).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
