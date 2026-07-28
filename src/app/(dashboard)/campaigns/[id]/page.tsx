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
  Settings,
  Sparkles,
  Eye,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { LinkedInComposer } from "@/components/linkedin/linkedin-composer";
import { type LinkedInLead } from "@/lib/hooks/use-linkedin";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

const campaignStats = [
  { label: "Total Sent", value: "245", icon: Send },
  { label: "Opened", value: "98 (40%)", icon: Mail },
  { label: "Clicked", value: "34 (14%)", icon: MousePointerClick },
  { label: "Replied", value: "21 (8.6%)", icon: MessageSquare },
];

const campaignLeads = [
  {
    id: "cl-1",
    name: "Underbelly Hospitality",
    category: "Restaurant",
    contact: "Chris Shepherd",
    title: "Executive Chef & Founder",
    email: "chris@underbellyhospitality.com",
    step: 3,
    status: "replied",
    lastActivity: "2024-07-24",
    draftSubject: "Helping Underbelly Hospitality elevate guest experiences",
    draftBody: "Hi Chris,\n\nI noticed Underbelly Hospitality's recent expansion in Houston. Operating multiple venues creates complex event coordination across locations.\n\nOur platform helps fine dining groups streamline private events and drive repeat bookings.\n\nWould you be open to a 10-minute chat next Tuesday?\n\nBest,\nVenueWrangler Outreach",
    warmSignals: ["Multi-location expansion", "James Beard Award Winner"],
  },
  {
    id: "cl-2",
    name: "Hotel Granduca Houston",
    category: "Hotel",
    contact: "Roberto Brancaccio",
    title: "General Manager",
    email: "rbrancaccio@granducahouston.com",
    step: 2,
    status: "opened",
    lastActivity: "2024-07-25",
    draftSubject: "Elevating corporate retreats at Hotel Granduca",
    draftBody: "Hi Roberto,\n\nHotel Granduca's Italian villa aesthetic and luxury corporate retreat capabilities stand out in Houston.\n\nWe provide automated guest engagement tailored for 5-star hospitality brands.\n\nWould you be open to exploring how this fits your corporate event strategy?\n\nBest,\nVenueWrangler Outreach",
    warmSignals: ["Luxury Positioning", "Veranda Event Space"],
  },
  {
    id: "cl-3",
    name: "The Astorian",
    category: "Event Venue",
    contact: "Jennifer Chen",
    title: "Director of Events",
    email: "events@theastorian.com",
    step: 3,
    status: "clicked",
    lastActivity: "2024-07-23",
    draftSubject: "Streamlining 200+ annual events at The Astorian",
    draftBody: "Hi Jennifer,\n\nHosting 200+ events annually at The Astorian is impressive. Managing high-volume bookings often means manual follow-up drops through the cracks.\n\nOur tool automates post-inquiry follow-ups specifically for premier event venues.\n\nWorth a quick look this week?\n\nBest,\nVenueWrangler Outreach",
    warmSignals: ["200+ Annual Events", "Industrial Chic Landmark"],
  },
  {
    id: "cl-4",
    name: "Brennan's of Houston",
    category: "Restaurant",
    contact: "Alex Brennan-Martin",
    title: "Owner",
    email: "info@brennanshouston.com",
    step: 1,
    status: "sent",
    lastActivity: "2024-07-26",
    draftSubject: "Private dining engagement for Brennan's of Houston",
    draftBody: "Hi Alex,\n\nBrennan's Creole jazz brunch is a Houston institution. With private dining rooms for 300+ guests, driving private event bookings is key.\n\nWe'd love to share how modern engagement tools help iconic dining brands keep event calendars full.\n\nBest,\nVenueWrangler Outreach",
    warmSignals: ["45+ Years Legacy", "300+ Capacity Private Dining"],
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
  const [selectedDraftLead, setSelectedDraftLead] = useState<(typeof campaignLeads)[0] | null>(null);
  const [linkedInLead, setLinkedInLead] = useState<LinkedInLead | null>(null);
  const [linkedInOpen, setLinkedInOpen] = useState(false);

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
        {/* Campaign Stats */}
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
                <p className="font-medium">Fine Dining & Venue Outreach</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sending Email</p>
                <p className="font-medium">outreach@venuewrangler.com</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Channel Strategy</p>
                <p className="font-medium">Email + LinkedIn Multi-channel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads" className="text-xs">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Campaign Leads ({campaignLeads.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="text-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              Pre-Flight Draft Review
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lead Progress & Execution</CardTitle>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignLeads.map((lead) => (
                      <TableRow key={lead.name}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="text-sm font-medium">{lead.name}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {lead.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <p className="font-medium">{lead.contact}</p>
                            <p className="text-xs text-muted-foreground">{lead.title}</p>
                          </div>
                        </TableCell>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setLinkedInLead({
                                  contactName: lead.contact,
                                  contactTitle: lead.title,
                                  businessName: lead.name,
                                  category: lead.category,
                                  warmSignals: lead.warmSignals,
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pre-Flight Draft Review Tab */}
          <TabsContent value="drafts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Personalized Draft Previews</CardTitle>
                <CardDescription className="text-xs">
                  Inspect generated outreach email copy before sending batch messages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {campaignLeads.map((lead) => (
                    <Card key={lead.id} className="border bg-muted/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {lead.contact} ({lead.title})
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                            Draft Ready
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="rounded border bg-background p-2.5">
                          <p className="font-semibold text-foreground">
                            Subject: {lead.draftSubject}
                          </p>
                          <div className="mt-2 whitespace-pre-line text-muted-foreground">
                            {lead.draftBody}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-wrap gap-1">
                            {lead.warmSignals.map((s) => (
                              <Badge key={s} variant="outline" className="text-[10px]">
                                {s}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setLinkedInLead({
                                contactName: lead.contact,
                                contactTitle: lead.title,
                                businessName: lead.name,
                                category: lead.category,
                                warmSignals: lead.warmSignals,
                              });
                              setLinkedInOpen(true);
                            }}
                          >
                            <LinkedInIcon className="mr-1 h-3 w-3 text-[#0077B5]" />
                            Open LinkedIn
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
