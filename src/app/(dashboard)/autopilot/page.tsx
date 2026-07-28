"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Globe,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Target,
  Send,
  Users,
  Building2,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface TargetGroup {
  id: string;
  name: string;
  description: string;
  targetTitles: string[];
  companyCriteria: string;
  recommendedPrompt: string;
}

interface AnalysisResult {
  productName: string;
  oneLiner: string;
  valueProposition: string;
  keyCapabilities: string[];
  targetOutreachGroups: TargetGroup[];
}

interface GenerationResult {
  success: boolean;
  campaignId: string;
  listId: string;
  sequenceId: string;
  leadCount: number;
  sampleOutreach: { subject: string; body: string };
}

export default function AutopilotPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [urlOrText, setUrlOrText] = useState("https://venuewrangler.com");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  async function handleAnalyze() {
    if (!urlOrText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/autopilot/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlOrText }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to analyze website");
      }

      const data = (await res.json()) as AnalysisResult;
      setAnalysis(data);
      setSelectedGroupIds(new Set(data.targetOutreachGroups.map((g) => g.id)));
      setStep(2);
      toast.success("Product analyzed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerateCampaign() {
    if (!analysis || selectedGroupIds.size === 0) return;
    setIsGenerating(true);
    setStep(3);

    try {
      const selectedGroups = analysis.targetOutreachGroups.filter((g) => selectedGroupIds.has(g.id));
      const prompts = selectedGroups.map((g) => g.recommendedPrompt);

      const res = await fetch("/api/autopilot/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGroupPrompts: prompts,
          productInfo: {
            productName: analysis.productName,
            valueProposition: analysis.valueProposition,
            keyCapabilities: analysis.keyCapabilities,
          },
          campaignName: `${analysis.productName} Growth Campaign`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Campaign generation failed");
      }

      const data = (await res.json()) as GenerationResult;
      setGenerationResult(data);
      setStep(4);
      toast.success(`Generated campaign with ${data.leadCount} qualified prospects`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleGroup(id: string) {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <PageHeader
        title="AI Campaign Autopilot"
        description="Analyze your product website, identify target buyer groups, and generate campaigns automatically"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <span className={`text-xs font-medium ${step === 1 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Analyze Product
            </span>
          </div>
          <div className="h-0.5 flex-1 max-w-[40px] bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span className={`text-xs font-medium ${step === 2 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Target Outreach Groups
            </span>
          </div>
          <div className="h-0.5 flex-1 max-w-[40px] bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </div>
            <span className={`text-xs font-medium ${step === 3 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Lead Sourcing & Copy
            </span>
          </div>
          <div className="h-0.5 flex-1 max-w-[40px] bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= 4 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              4
            </div>
            <span className={`text-xs font-medium ${step === 4 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Launch Campaign
            </span>
          </div>
        </div>

        {/* Step 1: Website Input */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Step 1: Analyze Your Product Website</CardTitle>
              <CardDescription className="text-xs">
                Enter your website URL or paste a product description. Gemini & Kimi will analyze your value proposition and generate target outreach groups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Product Website URL or Description</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={urlOrText}
                      onChange={(e) => setUrlOrText(e.target.value)}
                      placeholder="https://venuewrangler.com"
                      className="pl-9 text-sm"
                    />
                  </div>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing || !urlOrText.trim()}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 h-4 w-4 text-amber-400" />
                        Analyze Product
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs font-semibold">Quick Examples:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setUrlOrText("https://venuewrangler.com")}
                    className="rounded border bg-background px-2.5 py-1 text-xs transition-colors hover:bg-muted"
                  >
                    https://venuewrangler.com (Venue Operations & Event Platform)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Target Outreach Groups Picker */}
        {step === 2 && analysis && (
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">Product Identified</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="h-7 text-xs">
                    Re-analyze
                  </Button>
                </div>
                <CardTitle className="text-base">{analysis.productName}</CardTitle>
                <CardDescription className="text-xs font-medium text-foreground">
                  {analysis.oneLiner}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-muted-foreground">{analysis.valueProposition}</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.keyCapabilities.map((cap, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      ✓ {cap}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Step 2: Pick Target Outreach Groups</CardTitle>
                <CardDescription className="text-xs">
                  AI identified the following target buyer personas as ideal fits for your product. Select the groups you want to source and qualify.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {analysis.targetOutreachGroups.map((group) => {
                    const isSelected = selectedGroupIds.has(group.id);
                    return (
                      <Card
                        key={group.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-border"
                        }`}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              {group.name}
                            </CardTitle>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleGroup(group.id)} />
                          </div>
                          <CardDescription className="text-xs mt-1">
                            {group.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-foreground">Target Titles: </span>
                            <span className="text-muted-foreground">{group.targetTitles.join(", ")}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Criteria: </span>
                            <span className="text-muted-foreground">{group.companyCriteria}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end pt-4">
                  <Button
                    onClick={handleGenerateCampaign}
                    disabled={selectedGroupIds.size === 0}
                  >
                    Generate Leads & Product Outreach
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Loading / Autopilot Processing */}
        {step === 3 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-base font-bold">Autopilot Executing...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sourcing prospects, scoring fit metrics, and drafting Kimi product outreach copy
              </p>
              <div className="mt-8 grid max-w-md gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 rounded border bg-muted/20 p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Product positioning & value props extracted</span>
                </div>
                <div className="flex items-center gap-2 rounded border bg-muted/20 p-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  <span>Searching and scoring hospitality leads...</span>
                </div>
                <div className="flex items-center gap-2 rounded border bg-muted/20 p-2.5">
                  <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Drafting Kimi cold outreach copy pitching {analysis?.productName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Campaign Ready & Launch */}
        {step === 4 && generationResult && (
          <div className="space-y-6">
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base">Campaign Successfully Generated!</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Autopilot sourced {generationResult.leadCount} qualified leads and drafted custom product outreach copy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="bg-background">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Leads Sourced</p>
                        <p className="text-xl font-bold">{generationResult.leadCount}</p>
                      </div>
                      <Users className="h-5 w-5 text-primary/60" />
                    </CardContent>
                  </Card>
                  <Card className="bg-background">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Product Pitched</p>
                        <p className="text-sm font-bold truncate max-w-[120px]">{analysis?.productName}</p>
                      </div>
                      <Building2 className="h-5 w-5 text-emerald-600/60" />
                    </CardContent>
                  </Card>
                  <Card className="bg-background">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Outreach Engine</p>
                        <p className="text-sm font-bold">Kimi + Gemini</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-amber-500/60" />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generated Product Outreach Sample</CardTitle>
                <CardDescription className="text-xs">
                  Preview of the personalized email copy created for your target prospect group.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/20 p-4 space-y-2 text-xs">
                  <p className="font-bold text-foreground">
                    Subject: {generationResult.sampleOutreach.subject}
                  </p>
                  <div className="whitespace-pre-line text-muted-foreground pt-2 border-t">
                    {generationResult.sampleOutreach.body}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Start Another Autopilot
                  </Button>
                  <Button render={<Link href={`/campaigns/${generationResult.campaignId}`} />}>
                    <Send className="mr-1.5 h-4 w-4" />
                    View & Launch Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
