"use client";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { useState } from "react";

const senderAccounts = [
  {
    id: "1",
    name: "Sarah Mitchell",
    email: "sarah@hospitami.com",
    status: "active" as const,
    dailyLimit: 50,
    sentToday: 23,
    warmupDay: 30,
    reputation: "excellent",
    activeCampaigns: 2,
  },
  {
    id: "2",
    name: "Mike Thompson",
    email: "mike@hospitami.com",
    status: "active" as const,
    dailyLimit: 40,
    sentToday: 18,
    warmupDay: 25,
    reputation: "good",
    activeCampaigns: 1,
  },
  {
    id: "3",
    name: "Lisa Rodriguez",
    email: "lisa@hospitami.com",
    status: "warming" as const,
    dailyLimit: 15,
    sentToday: 8,
    warmupDay: 7,
    reputation: "building",
    activeCampaigns: 0,
  },
  {
    id: "4",
    name: "James Park",
    email: "james@hospitami.com",
    status: "paused" as const,
    dailyLimit: 50,
    sentToday: 0,
    warmupDay: 20,
    reputation: "good",
    activeCampaigns: 0,
  },
];

const senderDomains = [
  {
    domain: "hospitami.com",
    verified: true,
    spf: true,
    dkim: true,
    dmarc: true,
    accounts: 4,
  },
  {
    domain: "outreach.hospitami.com",
    verified: true,
    spf: true,
    dkim: true,
    dmarc: false,
    accounts: 0,
  },
];

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  warming: {
    label: "Warming",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  paused: {
    label: "Paused",
    className: "bg-muted text-muted-foreground",
  },
  disabled: {
    label: "Disabled",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

export default function SendersPage() {
  const [tab, setTab] = useState("accounts");

  return (
    <>
      <PageHeader
        title="Senders"
        description="Manage sender accounts and domains"
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Sender
          </Button>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Active Senders
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {senderAccounts.filter((s) => s.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">of {senderAccounts.length} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Sent Today
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {senderAccounts.reduce((a, s) => a + s.sentToday, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                of {senderAccounts.reduce((a, s) => a + s.dailyLimit, 0)} daily limit
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Domains
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{senderDomains.length}</div>
              <p className="text-xs text-muted-foreground">
                {senderDomains.filter((d) => d.verified).length} verified
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Health
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">Good</div>
              <p className="text-xs text-muted-foreground">All systems healthy</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="accounts">Sender Accounts</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "accounts" && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Warmup Day</TableHead>
                  <TableHead>Daily Usage</TableHead>
                  <TableHead>Reputation</TableHead>
                  <TableHead className="text-right">Campaigns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {senderAccounts.map((sender) => (
                  <TableRow key={sender.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{sender.name}</p>
                        <p className="text-xs text-muted-foreground">{sender.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[sender.status].className}`}
                      >
                        {statusConfig[sender.status].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">Day {sender.warmupDay}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>
                            {sender.sentToday}/{sender.dailyLimit}
                          </span>
                        </div>
                        <div className="h-1.5 w-24 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-primary"
                            style={{
                              width: `${(sender.sentToday / sender.dailyLimit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium capitalize ${
                          sender.reputation === "excellent"
                            ? "text-emerald-600"
                            : sender.reputation === "good"
                              ? "text-blue-600"
                              : "text-amber-600"
                        }`}
                      >
                        {sender.reputation}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {sender.activeCampaigns}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {tab === "domains" && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SPF</TableHead>
                  <TableHead>DKIM</TableHead>
                  <TableHead>DMARC</TableHead>
                  <TableHead className="text-right">Accounts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {senderDomains.map((domain) => (
                  <TableRow key={domain.domain}>
                    <TableCell className="text-sm font-medium">{domain.domain}</TableCell>
                    <TableCell>
                      {domain.verified ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {domain.spf ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {domain.dkim ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {domain.dmarc ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">{domain.accounts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
