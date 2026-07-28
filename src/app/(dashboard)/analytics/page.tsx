"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Send,
  Mail,
  MousePointerClick,
  MessageSquare,
  TrendingUp,
  Calendar,
  Users,
  Target,
} from "lucide-react";
import { useState } from "react";

const overviewStats = [
  {
    label: "Emails Sent",
    value: "2,847",
    change: "+18%",
    icon: Send,
    trend: "up",
  },
  {
    label: "Open Rate",
    value: "34.2%",
    change: "+2.1%",
    icon: Mail,
    trend: "up",
  },
  {
    label: "Click Rate",
    value: "12.8%",
    change: "+1.4%",
    icon: MousePointerClick,
    trend: "up",
  },
  {
    label: "Reply Rate",
    value: "8.7%",
    change: "+0.9%",
    icon: MessageSquare,
    trend: "up",
  },
  {
    label: "Positive Replies",
    value: "64",
    change: "+12",
    icon: TrendingUp,
    trend: "up",
  },
  {
    label: "Meetings Booked",
    value: "23",
    change: "+5",
    icon: Calendar,
    trend: "up",
  },
];

const campaignComparison = [
  {
    name: "Q3 Houston Fine Dining",
    sent: 245,
    openRate: 40.0,
    clickRate: 13.9,
    replyRate: 8.6,
  },
  {
    name: "Boutique Hotels - TX",
    sent: 180,
    openRate: 40.0,
    clickRate: 13.9,
    replyRate: 8.3,
  },
  {
    name: "Event Venues Outreach",
    sent: 320,
    openRate: 41.9,
    clickRate: 15.0,
    replyRate: 8.8,
  },
  {
    name: "Catering Companies",
    sent: 150,
    openRate: 30.0,
    clickRate: 8.0,
    replyRate: 5.3,
  },
];

const senderPerformance = [
  {
    name: "Sarah Mitchell",
    email: "sarah@hospitami.com",
    sent: 1547,
    openRate: 36.2,
    replyRate: 9.1,
    reputation: "Excellent",
  },
  {
    name: "Mike Thompson",
    email: "mike@hospitami.com",
    sent: 1142,
    openRate: 32.8,
    replyRate: 7.9,
    reputation: "Good",
  },
  {
    name: "Lisa Rodriguez",
    email: "lisa@hospitami.com",
    sent: 158,
    openRate: 29.1,
    replyRate: 6.3,
    reputation: "Building",
  },
];

const weeklyData = [
  { week: "Jul 1-7", sent: 412, opened: 148, replied: 32 },
  { week: "Jul 8-14", sent: 458, opened: 172, replied: 41 },
  { week: "Jul 15-21", sent: 521, opened: 195, replied: 48 },
  { week: "Jul 22-28", sent: 489, opened: 178, replied: 43 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Track outreach performance"
        actions={
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {overviewStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stat.value}</div>
                <p className="text-[10px] text-emerald-600">{stat.change} vs prev period</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Outreach Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Sent", value: 2847, color: "bg-primary" },
                { label: "Delivered", value: 2789, color: "bg-blue-500" },
                { label: "Opened", value: 974, color: "bg-violet-500" },
                { label: "Clicked", value: 365, color: "bg-amber-500" },
                { label: "Replied", value: 248, color: "bg-emerald-500" },
                { label: "Positive", value: 64, color: "bg-emerald-600" },
                { label: "Meeting Booked", value: 23, color: "bg-emerald-700" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-muted-foreground">{step.label}</span>
                  <div className="flex-1">
                    <div className="h-6 rounded bg-muted">
                      <div
                        className={`h-6 rounded ${step.color} flex items-center px-2`}
                        style={{ width: `${(step.value / 2847) * 100}%` }}
                      >
                        <span className="text-[10px] font-medium text-white">
                          {step.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {((step.value / 2847) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((week) => (
                  <div key={week.week} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{week.week}</span>
                      <span className="text-muted-foreground">
                        {week.sent} sent &middot; {week.opened} opened &middot;{" "}
                        {week.replied} replied
                      </span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div
                        className="rounded-sm bg-primary/20"
                        style={{ width: `${(week.sent / 600) * 100}%` }}
                      />
                      <div
                        className="rounded-sm bg-primary/50"
                        style={{ width: `${(week.opened / 600) * 100}%` }}
                      />
                      <div
                        className="rounded-sm bg-primary"
                        style={{ width: `${(week.replied / 600) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Campaign Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaignComparison.map((campaign) => (
                  <div
                    key={campaign.name}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.sent} emails sent
                      </p>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="text-center">
                        <p className="font-semibold">{campaign.openRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Open</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{campaign.clickRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Click</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{campaign.replyRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Reply</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sender Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sender Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {senderPerformance.map((sender) => (
                <div
                  key={sender.email}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {sender.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sender.name}</p>
                      <p className="text-xs text-muted-foreground">{sender.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center">
                      <p className="font-semibold">{sender.sent.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{sender.openRate}%</p>
                      <p className="text-[10px] text-muted-foreground">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{sender.replyRate}%</p>
                      <p className="text-[10px] text-muted-foreground">Reply Rate</p>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        sender.reputation === "Excellent"
                          ? "text-emerald-600"
                          : sender.reputation === "Good"
                            ? "text-blue-600"
                            : "text-amber-600"
                      }`}
                    >
                      {sender.reputation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
