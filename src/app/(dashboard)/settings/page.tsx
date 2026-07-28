"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Settings,
  Building2,
  Users,
  Shield,
  Bell,
  Palette,
  Plug,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your workspace" />
      <div className="flex-1 space-y-6 p-6 max-w-3xl">
        {/* Workspace */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <CardTitle className="text-sm">Workspace</CardTitle>
            </div>
            <CardDescription>Manage workspace details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input id="workspace-name" defaultValue="Hospitami Sales" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-slug">Slug</Label>
                <Input id="workspace-slug" defaultValue="hospitami-sales" disabled />
              </div>
            </div>
            <Button size="sm">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <CardTitle className="text-sm">Team Members</CardTitle>
            </div>
            <CardDescription>Manage who has access to this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sarah Mitchell", email: "sarah@hospitami.com", role: "Admin" },
                { name: "Mike Thompson", email: "mike@hospitami.com", role: "Manager" },
                { name: "Lisa Rodriguez", email: "lisa@hospitami.com", role: "Rep" },
              ].map((member) => (
                <div key={member.email} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{member.role}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3">
              Invite Member
            </Button>
          </CardContent>
        </Card>

        {/* Sending */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <CardTitle className="text-sm">Sending Safety</CardTitle>
            </div>
            <CardDescription>Configure sending limits and safety windows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Safe Sending Window</p>
                <p className="text-xs text-muted-foreground">
                  Only send during business hours (9am-5pm recipient time)
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Campaign Approval Gate</p>
                <p className="text-xs text-muted-foreground">
                  Require admin approval before launching campaigns
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Unsubscribe Footer</p>
                <p className="text-xs text-muted-foreground">
                  Automatically include unsubscribe link in outbound emails
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Max Emails per Sender per Day</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label>Delay Between Sends (seconds)</Label>
                <Input type="number" defaultValue="60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <CardTitle className="text-sm">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">New Reply Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when a lead replies
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Campaign Completion</p>
                <p className="text-xs text-muted-foreground">
                  Notify when a campaign finishes all steps
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Integrations Link */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <CardTitle className="text-sm">Integrations</CardTitle>
            </div>
            <CardDescription>
              Connect third-party services and data sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" render={<Link href="/settings/integrations" />}>
              Manage Integrations
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
