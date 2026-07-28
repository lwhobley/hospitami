"use client";

import { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  Sparkles,
  ArrowLeft,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sampleLeads = [
  {
    id: "1",
    businessName: "Underbelly Hospitality",
    category: "Restaurant",
    contactName: "Chris Shepherd",
    contactTitle: "Executive Chef & Founder",
    contactEmail: "chris@underbellyhospitality.com",
    city: "Houston",
    state: "TX",
    score: 94,
    status: "New" as const,
    warmSignals: ["Multi-location expansion", "Active event programming"],
  },
  {
    id: "2",
    businessName: "Hotel Granduca Houston",
    category: "Hotel",
    contactName: "Roberto Brancaccio",
    contactTitle: "General Manager",
    contactEmail: "rbrancaccio@granducahouston.com",
    city: "Houston",
    state: "TX",
    score: 91,
    status: "Contacted" as const,
    warmSignals: ["Active wedding/event venue", "Recently renovated"],
  },
  {
    id: "3",
    businessName: "The Astorian",
    category: "Event Venue",
    contactName: "Jennifer Chen",
    contactTitle: "Director of Events",
    contactEmail: "events@theastorian.com",
    city: "Houston",
    state: "TX",
    score: 88,
    status: "New" as const,
    warmSignals: ["High-volume event bookings", "Corporate and social events"],
  },
  {
    id: "4",
    businessName: "Brennan's of Houston",
    category: "Restaurant",
    contactName: "Alex Brennan-Martin",
    contactTitle: "Owner",
    contactEmail: "info@brennanshouston.com",
    city: "Houston",
    state: "TX",
    score: 86,
    status: "Qualified" as const,
    warmSignals: ["Private dining for 300+", "Corporate event packages"],
  },
  {
    id: "5",
    businessName: "The Houstonian Hotel",
    category: "Hotel",
    contactName: "Mark Lindsey",
    contactTitle: "VP of Sales & Marketing",
    contactEmail: "mlindsey@houstonian.com",
    city: "Houston",
    state: "TX",
    score: 90,
    status: "New" as const,
    warmSignals: ["Multiple event spaces", "Club membership model"],
  },
];

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = sampleLeads
    .filter(
      (l) =>
        l.businessName.toLowerCase().includes(search.toLowerCase()) ||
        l.contactName.toLowerCase().includes(search.toLowerCase())
    )
    .filter((l) => filterStatus === "all" || l.status === filterStatus);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <PageHeader
        title="Houston Fine Dining"
        description={`${sampleLeads.length} leads`}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
