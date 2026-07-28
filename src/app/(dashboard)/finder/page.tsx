"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Search,
  Sparkles,
  Loader2,
  Save,
  Download,
  ExternalLink,
  BookmarkPlus,
  ListPlus,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import {
  useSearchLeads,
  useSaveLeads,
  type DiscoveredLead,
} from "@/lib/hooks/use-finder";
import { toast } from "sonner";

interface LeadResult {
  id: string;
  businessName: string;
  category: string;
  subcategory?: string;
  city: string;
  state: string;
  website?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  qualificationScore: number;
  warmSignals: string[];
  aiSummary: string;
  personalizationAngle?: string;
  sourceUrls?: string[];
  hospitalitySegment?: string;
}

const sampleResults: LeadResult[] = [
  {
    id: "1",
    businessName: "Underbelly Hospitality",
    category: "Restaurant",
    subcategory: "Fine Dining Group",
    city: "Houston",
    state: "TX",
    website: "underbellyhospitality.com",
    contactName: "Chris Shepherd",
    contactTitle: "Executive Chef & Founder",
    contactEmail: "chris@underbellyhospitality.com",
    qualificationScore: 94,
    warmSignals: [
      "Multi-location expansion",
      "Active event programming",
      "Recent James Beard recognition",
      "Private dining rooms",
    ],
    aiSummary:
      "Award-winning hospitality group operating multiple concepts in Houston. Known for community-focused dining with private event capabilities. Recently expanded with new concepts.",
    personalizationAngle:
      "Their multi-venue expansion creates complexity in managing events and guest engagement across locations.",
    sourceUrls: ["underbellyhospitality.com", "jamesbeard.org"],
    hospitalitySegment: "Upscale",
  },
  {
    id: "2",
    businessName: "Hotel Granduca Houston",
    category: "Hotel",
    subcategory: "Boutique Luxury Hotel",
    city: "Houston",
    state: "TX",
    website: "granducahouston.com",
    contactName: "Roberto Brancaccio",
    contactTitle: "General Manager",
    contactEmail: "rbrancaccio@granducahouston.com",
    qualificationScore: 91,
    warmSignals: [
      "Italian-themed luxury positioning",
      "Active wedding/event venue",
      "Recently renovated spaces",
      "Corporate event packages",
    ],
    aiSummary:
      "Tuscan-inspired luxury boutique hotel with 122 suites. Strong event business including weddings, corporate gatherings, and fine dining at Ristorante Cavour.",
    personalizationAngle:
      "Their dual focus on luxury lodging and event hosting means they need seamless guest engagement across both experiences.",
    sourceUrls: ["granducahouston.com"],
    hospitalitySegment: "Luxury",
  },
  {
    id: "3",
    businessName: "The Astorian",
    category: "Event Venue",
    subcategory: "Historic Event Space",
    city: "Houston",
    state: "TX",
    website: "theastorian.com",
    contactName: "Jennifer Chen",
    contactTitle: "Director of Events",
    contactEmail: "events@theastorian.com",
    qualificationScore: 88,
    warmSignals: [
      "High-volume event bookings",
      "Corporate and social events",
      "Unique industrial aesthetic",
      "Active social media presence",
    ],
    aiSummary:
      "Premier industrial-chic event venue in Houston's Heights. Hosts 200+ events annually including weddings, corporate galas, and product launches.",
    personalizationAngle:
      "With 200+ annual events, they likely struggle with manual follow-up and guest engagement at scale.",
    sourceUrls: ["theastorian.com"],
    hospitalitySegment: "Premium Casual",
  },
  {
    id: "4",
    businessName: "Brennan's of Houston",
    category: "Restaurant",
    subcategory: "Fine Dining / Events",
    city: "Houston",
    state: "TX",
    website: "brennanshouston.com",
    contactName: "Alex Brennan-Martin",
    contactTitle: "Owner",
    contactEmail: "info@brennanshouston.com",
    qualificationScore: 86,
    warmSignals: [
      "45+ years in operation",
      "Private dining for 300+",
      "Jazz brunch institution",
      "Corporate event packages",
    ],
    aiSummary:
      "Iconic Creole restaurant with extensive private dining and event capabilities. A Houston institution known for jazz brunch and fine dining experiences.",
    personalizationAngle:
      "Their legacy brand and large event capacity suggest they could benefit from modern engagement tools to maintain their competitive edge.",
    sourceUrls: ["brennanshouston.com"],
    hospitalitySegment: "Upscale",
  },
  {
    id: "5",
    businessName: "The Houstonian Hotel",
    category: "Hotel",
    subcategory: "Resort-Style Hotel",
    city: "Houston",
    state: "TX",
    website: "houstonian.com",
    contactName: "Mark Lindsey",
    contactTitle: "VP of Sales & Marketing",
    contactEmail: "mlindsey@houstonian.com",
    qualificationScore: 90,
    warmSignals: [
      "Full-service resort amenities",
      "Spa and wellness center",
      "Multiple event spaces",
      "Club membership model",
    ],
    aiSummary:
      "Luxury 27-acre resort-style hotel with spa, fitness center, and extensive meeting/event facilities. Combines hotel, club, and spa into an integrated hospitality experience.",
    personalizationAngle:
      "Their integrated hotel-club-spa model means they manage multiple guest touchpoints that could benefit from unified engagement.",
    sourceUrls: ["houstonian.com"],
    hospitalitySegment: "Luxury",
  },
  {
    id: "6",
    businessName: "Common Bond Bistro & Bakery",
    category: "Restaurant",
    subcategory: "Fast Casual / Bakery",
    city: "Houston",
    state: "TX",
    website: "commonbondcafe.com",
    contactName: "George Joseph",
    contactTitle: "Co-Founder",
    contactEmail: "george@commonbondcafe.com",
    qualificationScore: 78,
    warmSignals: [
      "6+ location expansion",
      "Catering services growing",
      "Active loyalty program",
      "Tech-forward ordering",
    ],
    aiSummary:
      "Rapidly growing bakery-cafe chain with 6+ Houston locations. Known for artisan pastries and expanding catering business. Uses tech-forward ordering systems.",
    personalizationAngle:
      "Multi-location growth and catering expansion signal a need for scalable guest engagement and event booking tools.",
    sourceUrls: ["commonbondcafe.com"],
    hospitalitySegment: "Premium Casual",
  },
];

const examplePrompts = [
  "Find independent upscale restaurants in Houston with private dining, active event programming, and signs they may need better guest engagement tools.",
  "Discover boutique hotels in Austin, TX that host corporate events and show signs of digital marketing investment.",
  "Find high-volume event venues in Dallas that are expanding or recently renovated.",
];

export default function FinderPage() {
  const [prompt, setPrompt] = useState("");
  const [apiResults, setApiResults] = useState<DiscoveredLead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");

  const searchLeads = useSearchLeads();
  const saveLeads = useSaveLeads();

  const isSearching = searchLeads.isPending;

  // Map DiscoveredLead to the local LeadResult shape for the UI
  const results: LeadResult[] = apiResults.map((l, i) => ({
    id: String(i),
    businessName: l.businessName,
    category: l.category,
    subcategory: l.subcategory,
    city: l.city,
    state: l.state,
    website: l.website,
    contactName: l.contactName,
    contactTitle: l.contactTitle,
    contactEmail: l.contactEmail,
    qualificationScore: l.qualificationScore ?? 0,
    warmSignals: l.warmSignals ?? [],
    aiSummary: l.description ?? "",
    personalizationAngle: l.reasoning,
  }));

  function handleSearch() {
    if (!prompt.trim()) return;
    setApiResults([]);
    setSelectedIds(new Set());
    setHasSearched(true);
    searchLeads.mutate(
      { prompt },
      {
        onSuccess: (data) => setApiResults(data.leads),
        onError: (err) => toast.error(err.message ?? "Search failed"),
      }
    );
  }

  function handleSaveSelected() {
    const toSave = apiResults.filter((_, i) => selectedIds.has(String(i)));
    saveLeads.mutate(toSave, {
      onSuccess: () => {
        toast.success(`Saved ${toSave.length} lead${toSave.length !== 1 ? "s" : ""}`);
        setSelectedIds(new Set());
      },
      onError: () => toast.error("Failed to save leads"),
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResults.map((r) => r.id)));
    }
  }

  const filteredResults = results
    .filter((r) => filterCategory === "all" || r.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "score") return b.qualificationScore - a.qualificationScore;
      if (sortBy === "name") return a.businessName.localeCompare(b.businessName);
      return 0;
    });

  const categories = [...new Set(results.map((r) => r.category))];

  return (
    <>
      <PageHeader
        title="AI Lead Finder"
        description="Describe your ideal hospitality prospect"
        actions={
          results.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />
                Save Search
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          ) : undefined
        }
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Search Input */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  placeholder="Describe your ideal hospitality prospect..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px] resize-none pr-4 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSearch();
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {examplePrompts.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(ex)}
                      className="rounded-md border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted"
                    >
                      {ex.slice(0, 60)}...
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!prompt.trim() || isSearching}
                  size="sm"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Find Leads
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isSearching && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Researching hospitality prospects...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Analyzing business listings, directories, and public data
              </p>
              <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Scanning sources
                </span>
                <span className="flex items-center gap-1.5">
                  <Search className="h-3 w-3" />
                  Qualifying leads
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Generating insights
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isSearching && hasSearched && results.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No results found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try broadening your search criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredResults.length}</span>{" "}
                  leads found
                </p>
                <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score (High-Low)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSaveSelected}
                    disabled={saveLeads.isPending}
                  >
                    <ListPlus className="mr-1.5 h-3.5 w-3.5" />
                    {saveLeads.isPending ? "Saving..." : "Save to List"}
                  </Button>
                </div>
              )}
            </div>

            {/* Results Table */}
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            selectedIds.size === filteredResults.length &&
                            filteredResults.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead>Signals</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((lead) => (
                      <>
                        <TableRow
                          key={lead.id}
                          className="cursor-pointer"
                          onClick={() =>
                            setExpandedId(expandedId === lead.id ? null : lead.id)
                          }
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(lead.id)}
                              onCheckedChange={() => toggleSelect(lead.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{lead.businessName}</p>
                              {lead.website && (
                                <p className="text-xs text-muted-foreground">
                                  {lead.website}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="secondary" className="text-[10px]">
                                {lead.category}
                              </Badge>
                              {lead.subcategory && (
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  {lead.subcategory}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{lead.contactName}</p>
                              <p className="text-xs text-muted-foreground">
                                {lead.contactTitle}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.city}, {lead.state}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                lead.qualificationScore >= 90
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : lead.qualificationScore >= 80
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {lead.qualificationScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {lead.warmSignals.slice(0, 2).map((s) => (
                                <Badge
                                  key={s}
                                  variant="outline"
                                  className="text-[10px] font-normal"
                                >
                                  {s}
                                </Badge>
                              ))}
                              {lead.warmSignals.length > 2 && (
                                <Badge variant="outline" className="text-[10px]">
                                  +{lead.warmSignals.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {expandedId === lead.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedId === lead.id && (
                          <TableRow key={`${lead.id}-detail`}>
                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      AI Summary
                                    </p>
                                    <p className="mt-1 text-sm">{lead.aiSummary}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Personalization Angle
                                    </p>
                                    <p className="mt-1 text-sm">
                                      {lead.personalizationAngle}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      All Warm Signals
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {lead.warmSignals.map((s) => (
                                        <Badge
                                          key={s}
                                          variant="outline"
                                          className="text-[10px]"
                                        >
                                          {s}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Sources
                                    </p>
                                    <div className="mt-1 flex flex-col gap-0.5">
                                      {lead.sourceUrls?.map((url) => (
                                        <span
                                          key={url}
                                          className="flex items-center gap-1 text-xs text-primary"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          {url}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Contact
                                    </p>
                                    <p className="text-sm">
                                      {lead.contactEmail}
                                    </p>
                                  </div>
                                  {lead.hospitalitySegment && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">
                                        Segment
                                      </p>
                                      <Badge variant="secondary" className="mt-0.5 text-[10px]">
                                        {lead.hospitalitySegment}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={saveLeads.isPending}
                                  onClick={() => {
                                    const src = apiResults[Number(lead.id)];
                                    if (src) saveLeads.mutate([src], {
                                      onSuccess: () => toast.success("Lead saved"),
                                      onError: () => toast.error("Failed to save lead"),
                                    });
                                  }}
                                >
                                  <Save className="mr-1.5 h-3.5 w-3.5" />
                                  Save Lead
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                  Generate Outreach
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !isSearching && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">AI-Powered Lead Discovery</h3>
              <p className="mt-1 max-w-md text-center text-xs text-muted-foreground">
                Describe your ideal hospitality prospect in natural language. Our AI will
                research businesses, qualify leads, and return a structured list with
                source-backed evidence.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { icon: Search, label: "Multi-source research" },
                  { icon: Sparkles, label: "AI qualification" },
                  { icon: Save, label: "Evidence-backed leads" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
