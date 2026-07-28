"use client";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  Users,
  Send,
  Inbox,
  TrendingUp,
  ArrowRight,
  Target,
  Mail,
} from "lucide-react";
import { useDashboard } from "@/lib/hooks/use-dashboard";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const stats = [
    { label: "Total Leads", value: data?.stats.totalLeads ?? "—", icon: Users },
    { label: "Active Campaigns", value: data?.stats.activeCampaigns ?? "—", icon: Send },
    {
      label: "Open Rate",
      value: data?.stats.openRate != null ? `${data.stats.openRate.toFixed(1)}%` : "—",
      icon: Mail,
    },
    {
      label: "Reply Rate",
      value: data?.stats.replyRate != null ? `${data.stats.replyRate.toFixed(1)}%` : "—",
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your outreach activity"
        actions={
          <Button size="sm" render={<Link href="/finder" />}>
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Find Leads
          </Button>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-7 w-16 animate-pulse rounded bg-muted" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Recent Leads</CardTitle>
                  <CardDescription>Latest leads from AI discovery</CardDescription>
                </div>
                <Button variant="ghost" size="sm" render={<Link href="/lists" />}>
                  View all
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
                    ))
                  : (data?.recentLeads ?? []).map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                            <Target className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {lead.category} &middot; {lead.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {lead.score != null && (
                            <div className="text-right">
                              <p className="text-sm font-semibold">{lead.score}</p>
                              <p className="text-[10px] text-muted-foreground">Score</p>
                            </div>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              lead.status === "new"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                : lead.status === "contacted"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Campaign Performance</CardTitle>
                  <CardDescription>Active campaign metrics</CardDescription>
                </div>
                <Button variant="ghost" size="sm" render={<Link href="/analytics" />}>
                  Details
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                    ))
                  : (data?.campaignPerformance ?? []).map((campaign) => (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{campaign.name}</p>
                          <span
                            className={`text-[10px] font-medium capitalize ${
                              campaign.status === "active"
                                ? "text-emerald-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Sent: {campaign.sent}</span>
                          <span>
                            Opened: {campaign.opened}
                            {campaign.sent > 0 && (
                              <span>
                                {" "}
                                ({Math.round((campaign.opened / campaign.sent) * 100)}%)
                              </span>
                            )}
                          </span>
                          <span>
                            Replied: {campaign.replied}
                            {campaign.sent > 0 && (
                              <span>
                                {" "}
                                ({Math.round((campaign.replied / campaign.sent) * 100)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        {campaign.sent > 0 && (
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{
                                width: `${Math.round((campaign.opened / campaign.sent) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Find New Leads",
                  desc: "Use AI to discover prospects",
                  href: "/finder",
                  icon: Search,
                },
                {
                  title: "Create Campaign",
                  desc: "Launch a new outreach campaign",
                  href: "/campaigns",
                  icon: Send,
                },
                {
                  title: "Check Inbox",
                  desc: "View and respond to replies",
                  href: "/inbox",
                  icon: Inbox,
                },
                {
                  title: "View Analytics",
                  desc: "Track outreach performance",
                  href: "/analytics",
                  icon: TrendingUp,
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
