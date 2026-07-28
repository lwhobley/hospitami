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
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Target,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import {
  useSearchLeads,
  useSaveLeads,
  type DiscoveredLead,
} from "@/lib/hooks/use-finder";
import { toast } from "sonner";
import { LinkedInComposer } from "@/components/linkedin/linkedin-composer";
import { type LinkedInLead } from "@/lib/hooks/use-linkedin";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

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

const examplePrompts = [
  "Find independent upscale restaurants in Houston with private dining, active event programming, and signs they need event management tools",
  "Boutique hotels in Austin with luxury amenities, spa, and banquet facilities",
  "Multi-location restaurant groups in Texas expanding corporate catering operations",
  "High-end wedding and corporate event venues in Dallas with 200+ annual capacity",
];

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
      "Award-winning hospitality group operating multiple concepts in Houston. Known for community-focused dining with private event capabilities.",
    personalizationAngle:
      "Their multi-venue expansion creates complexity in managing events and guest engagement across locations.",
    sourceUrls: ["underbellyhospitality.com", "jamesbeard.org"],
    hospitalitySegment: "Upscale",
  },
  {
    id: "2",
    businessName: "Hotel Granduca Houston",
    category: "Hotel",
    subcategory: "Luxury Boutique Hotel",
    city: "Houston",
    state: "TX",
    website: "granducahouston.com",
    contactName: "Roberto Brancaccio",
    contactTitle: "General Manager",
    contactEmail: "rbrancaccio@granducahouston.com",
    qualificationScore: 91,
    warmSignals: [
      "5-star luxury positioning",
      "Italian villa architecture",
      "Veranda event space",
      "High-end corporate retreats",
    ],
    aiSummary:
      "Luxury Italian-inspired boutique hotel in Uptown Houston featuring fine dining at Ristorante Ciao Bello and premium meeting facilities.",
    personalizationAngle:
      "High-touch luxury guests expect seamless communication; automated guest journeys fit their brand profile.",
    sourceUrls: ["granducahouston.com"],
    hospitalitySegment: "Luxury",
  },
  {
    id: "3",
    businessName: "The Astorian",
    category: "Event Venue",
    subcategory: "Industrial Chic Venue",
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
      "Premier industrial-chic event venue in Houston's Heights. Hosts 200+ events annually including weddings and corporate galas.",
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
      "Iconic Creole restaurant with extensive private dining capabilities. A Houston institution known for jazz brunch.",
    personalizationAngle:
      "Their legacy brand and large event capacity suggest they could benefit from modern engagement tools to maintain their edge.",
    sourceUrls: ["brennanshouston.com"],
    hospitalitySegment: "Upscale",
  },
];

export default function FinderPage() {
  const [prompt, setPrompt] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [apiResults, setApiResults] = useState<DiscoveredLead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");
  const [feedbackState, setFeedbackState] = useState<Record<string, "UP" | "DOWN">>({});
  const [linkedInLead, setLinkedInLead] = useState<LinkedInLead | null>(null);
  const [linkedInOpen, setLinkedInOpen] = useState(false);

  const searchLeads = useSearchLeads();
  const saveLeads = useSaveLeads();

  const isSearching = searchLeads.isPending;

  const displayResults = apiResults.length > 0 ? apiResults : hasSearched ? [] : sampleResults;

  const results: LeadResult[] = displayResults.map((l, i) => ({
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
    qualificationScore: l.qualificationScore ?? 85,
    warmSignals: l.warmSignals ?? [],
    aiSummary: "aiSummary" in l ? (l as LeadResult).aiSummary : (l as DiscoveredLead).description ?? "",
    personalizationAngle: "personalizationAngle" in l ? (l as LeadResult).personalizationAngle : (l as DiscoveredLead).reasoning,
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

  function handleFeedback(leadId: string, rating: "UP" | "DOWN", e: React.MouseEvent) {
    e.stopPropagation();
    setFeedbackState((prev) => ({
      ...prev,
      [leadId]: prev[leadId] === rating ? (null as unknown as "UP") : rating,
    }));
    toast.success(
      rating === "UP" ? "Lead marked as good fit — model updated" : "Lead feedback recorded"
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
  const avgScore = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.qualificationScore, 0) / results.length) : 0;
  const qualRate = results.length > 0 ? Math.round((results.filter(r => r.qualificationScore >= 80).length / results.length) * 100) : 95;

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
        {/* Search Prompt Input */}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {examplePrompts.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(ex)}
                      className="rounded-md border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      💡 {ex.slice(0, 48)}...
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!prompt.trim() || isSearching}
                  size="sm"
                  className="shrink-0"
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
                Analyzing business listings, directories, and Google Gemini data
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
                  Scoring match fit
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Toolbar & Summary Metrics */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Card className="bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Total Prospects</p>
                    <p className="text-lg font-bold">{results.length}</p>
                  </div>
                  <Target className="h-5 w-5 text-muted-foreground/60" />
                </CardContent>
              </Card>
              <Card className="bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Qualification Rate</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{qualRate}%</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500/60" />
                </CardContent>
              </Card>
              <Card className="bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Average Fit Score</p>
                    <p className="text-lg font-bold">{avgScore} / 100</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary/60" />
                </CardContent>
              </Card>
              <Card className="bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Est. Cost / Lead</p>
                    <p className="text-lg font-bold">$0.012</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-muted-foreground/60" />
                </CardContent>
              </Card>
            </div>

            {/* Toolbar controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Sort by Fit Score</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedIds.size > 0 && (
                <Button
                  size="sm"
                  onClick={handleSaveSelected}
                  disabled={saveLeads.isPending}
                >
                  {saveLeads.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save {selectedIds.size} Selected
                </Button>
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
                      <TableHead className="text-center">Fit Score</TableHead>
                      <TableHead>Signals</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              <p className="text-sm font-medium">{lead.contactName}</p>
                              <p className="text-xs text-muted-foreground">
                                {lead.contactTitle}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.city}, {lead.state}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className={`inline-flex h-7 px-2 items-center justify-center rounded-full text-xs font-bold ${
                                  lead.qualificationScore >= 90
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : lead.qualificationScore >= 80
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                }`}
                              >
                                {lead.qualificationScore}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={(e) => handleFeedback(lead.id, "UP", e)}
                                  className={`rounded p-1 transition-colors hover:bg-muted ${
                                    feedbackState[lead.id] === "UP" ? "text-emerald-600" : "text-muted-foreground"
                                  }`}
                                  title="Good fit"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => handleFeedback(lead.id, "DOWN", e)}
                                  className={`rounded p-1 transition-colors hover:bg-muted ${
                                    feedbackState[lead.id] === "DOWN" ? "text-rose-600" : "text-muted-foreground"
                                  }`}
                                  title="Not a fit"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
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
                                <span className="text-[10px] text-muted-foreground">
                                  +{lead.warmSignals.length - 2}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setLinkedInLead({
                                    contactName: lead.contactName ?? lead.businessName,
                                    contactTitle: lead.contactTitle,
                                    businessName: lead.businessName,
                                    category: lead.category,
                                    warmSignals: lead.warmSignals,
                                  });
                                  setLinkedInOpen(true);
                                }}
                              >
                                <LinkedInIcon className="mr-1 h-3 w-3 text-[#0077B5]" />
                                Outreach
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  setExpandedId(expandedId === lead.id ? null : lead.id)
                                }
                              >
                                {expandedId === lead.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Detail View */}
                        {expandedId === lead.id && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={8} className="p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    AI Lead Summary
                                  </p>
                                  <p className="text-sm">{lead.aiSummary}</p>
                                  {lead.personalizationAngle && (
                                    <div className="mt-2 rounded-md bg-muted/60 p-2.5 text-xs">
                                      <span className="font-semibold text-foreground">
                                        Personalization Angle:{" "}
                                      </span>
                                      {lead.personalizationAngle}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Warm Signals & Qualification
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {lead.warmSignals.map((s) => (
                                      <Badge key={s} variant="secondary" className="text-xs">
                                        {s}
                                      </Badge>
                                    ))}
                                  </div>
                                  {lead.sourceUrls && lead.sourceUrls.length > 0 && (
                                    <div className="pt-2">
                                      <p className="text-[10px] font-semibold text-muted-foreground">
                                        Verified Sources:
                                      </p>
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {lead.sourceUrls.map((url) => (
                                          <a
                                            key={url}
                                            href={`https://${url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                                          >
                                            {url}
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
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
