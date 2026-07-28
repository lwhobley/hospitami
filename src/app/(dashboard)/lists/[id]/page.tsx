"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Search,
  Download,
  ArrowLeft,
  Filter,
} from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}
import Link from "next/link";
import { useList } from "@/lib/hooks/use-lists";
import { LinkedInComposer } from "@/components/linkedin/linkedin-composer";
import { type LinkedInLead } from "@/lib/hooks/use-linkedin";

const statusColors: Record<string, string> = {
  New: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Contacted: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Qualified: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Nurturing: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

export default function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useList(id);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [linkedInLead, setLinkedInLead] = useState<LinkedInLead | null>(null);
  const [linkedInOpen, setLinkedInOpen] = useState(false);

  const leads = data?.leads ?? [];

  const filtered = leads
    .filter(
      (l) =>
        l.businessName.toLowerCase().includes(search.toLowerCase()) ||
        l.contactName.toLowerCase().includes(search.toLowerCase())
    )
    .filter((l) => filterStatus === "all" || l.status === filterStatus);

  function toggleSelect(leadId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  }

  function openLinkedIn(lead: typeof leads[number]) {
    setLinkedInLead({
      leadId: lead.id,
      businessName: lead.businessName,
      contactName: lead.contactName,
      contactTitle: lead.contactTitle,
      category: lead.category,
      warmSignals: lead.warmSignals,
      linkedinUrl: lead.linkedinUrl ?? undefined,
    });
    setLinkedInOpen(true);
  }

  return (
    <>
      <PageHeader
        title={isLoading ? "Loading…" : (data?.list.name ?? "List")}
        description={isLoading ? "" : `${data?.list.leadCount ?? 0} leads`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/lists" />}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              All Lists
            </Button>
            {selectedIds.size > 0 && (
              <Button size="sm">
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Create Campaign ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <Filter className="mr-1.5 h-3 w-3" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      selectedIds.size === filtered.length && filtered.length > 0
                    }
                    onCheckedChange={() => {
                      if (selectedIds.size === filtered.length) {
                        setSelectedIds(new Set());
                      } else {
                        setSelectedIds(new Set(filtered.map((l) => l.id)));
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signals</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : filtered.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(lead.id)}
                          onCheckedChange={() => toggleSelect(lead.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{lead.businessName}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{lead.contactName}</p>
                          <p className="text-xs text-muted-foreground">{lead.contactTitle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {lead.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.city}, {lead.state}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            lead.score >= 90
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : lead.score >= 80
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {lead.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[lead.status] ?? ""}`}
                        >
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lead.warmSignals.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] font-normal">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-[#0077B5] hover:bg-[#0077B5]/10"
                          title="LinkedIn Outreach"
                          onClick={() => openLinkedIn(lead)}
                        >
                          <LinkedInIcon className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <LinkedInComposer
        lead={linkedInLead}
        open={linkedInOpen}
        onOpenChange={setLinkedInOpen}
      />
    </>
  );
}
