"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Sparkles, Search, Mail, Database, Upload, Globe } from "lucide-react";

const integrations = [
  {
    name: "Gemini AI",
    description: "AI-powered lead discovery, enrichment, and qualification",
    icon: Sparkles,
    status: "connected" as const,
    category: "AI",
  },
  {
    name: "Kimi AI",
    description: "Personalized outreach and message generation",
    icon: Sparkles,
    status: "connected" as const,
    category: "AI",
  },
  {
    name: "SMTP & IMAP",
    description: "Custom mail server sending and reply syncing",
    icon: Mail,
    status: "connected" as const,
    category: "Email",
  },
  {
    name: "ZoomInfo",
    description: "B2B contact and company data enrichment",
    icon: Database,
    status: "not_connected" as const,
    category: "Data",
  },
  {
    name: "Google Maps",
    description: "Business listing data and location intelligence",
    icon: Globe,
    status: "not_connected" as const,
    category: "Data",
  },
  {
    name: "CSV Import",
    description: "Import leads from CSV files",
    icon: Upload,
    status: "available" as const,
    category: "Import",
  },
  {
    name: "PostHog",
    description: "Product analytics and usage tracking",
    icon: Search,
    status: "connected" as const,
    category: "Analytics",
  },
];

const statusConfig = {
  connected: {
    label: "Connected",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  not_connected: {
    label: "Not Connected",
    className: "bg-muted text-muted-foreground",
  },
  available: {
    label: "Available",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
};

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect services and data sources"
        actions={
          <Button variant="ghost" size="sm" render={<Link href="/settings" />}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Settings
          </Button>
        }
      />
      <div className="flex-1 space-y-6 p-6 max-w-3xl">
        {["AI", "Email", "Data", "Import", "Analytics"].map((category) => {
          const items = integrations.filter((i) => i.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map((integration) => (
                  <Card key={integration.name}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <integration.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[integration.status].className}`}
                        >
                          {statusConfig[integration.status].label}
                        </span>
                        <Button
                          variant={
                            integration.status === "connected" ? "outline" : "default"
                          }
                          size="sm"
                        >
                          {integration.status === "connected" ? "Configure" : "Connect"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
