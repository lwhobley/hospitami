"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Mail, MousePointerClick, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAnalytics } from "@/lib/hooks/use-analytics";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useAnalytics();

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
        {/* Campaign Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campaign Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : (data?.campaignComparison ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No campaign data yet
              </p>
            ) : (
              <div className="space-y-3">
                {(data?.campaignComparison ?? []).map((campaign) => (
                  <div
                    key={campaign.id}
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
                        <p className="font-semibold">{campaign.openRate.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground">Open</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{campaign.clickRate.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground">Click</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{campaign.replyRate.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground">Reply</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : (data?.weeklyData ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No data yet
                </p>
              ) : (
                <div className="space-y-4">
                  {(data?.weeklyData ?? []).map((week) => (
                    <div key={week.week} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{week.week}</span>
                        <span className="text-muted-foreground">
                          {week.emails} sent &middot; {week.replies} replied
                        </span>
                      </div>
                      <div className="flex h-2 gap-1">
                        <div
                          className="rounded-sm bg-primary/20"
                          style={{
                            width: `${Math.min((week.emails / 600) * 100, 100)}%`,
                          }}
                        />
                        <div
                          className="rounded-sm bg-primary"
                          style={{
                            width: `${Math.min((week.replies / 600) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sender Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sender Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : (data?.senderPerformance ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No sender data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {(data?.senderPerformance ?? []).map((sender) => (
                    <div
                      key={sender.id}
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
                          <p className="font-semibold">{sender.openRate.toFixed(1)}%</p>
                          <p className="text-[10px] text-muted-foreground">Open</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{sender.replyRate.toFixed(1)}%</p>
                          <p className="text-[10px] text-muted-foreground">Reply</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
