import { searchLeadsWithGemini } from "@/lib/ai/gemini";
import type { DiscoveredLead, SourceAdapter } from "./types";

export const geminiAdapter: SourceAdapter = {
  name: "gemini-ai-search",

  async search(query: string): Promise<DiscoveredLead[]> {
    const result = await searchLeadsWithGemini(query);

    try {
      const parsed = JSON.parse(result.text);
      if (!Array.isArray(parsed)) return [];

      return parsed.map(
        (item: Record<string, unknown>): DiscoveredLead => ({
          businessName: String(item.business_name ?? ""),
          category: String(item.category ?? ""),
          subcategory: item.subcategory ? String(item.subcategory) : undefined,
          city: String(item.city ?? ""),
          state: String(item.state ?? ""),
          website: item.website ? String(item.website) : undefined,
          contactName: item.contact_name ? String(item.contact_name) : undefined,
          contactTitle: item.contact_title ? String(item.contact_title) : undefined,
          contactEmail: item.contact_email ? String(item.contact_email) : undefined,
          locationCount: item.location_count ? Number(item.location_count) : undefined,
          hospitalitySegment: item.hospitality_segment
            ? String(item.hospitality_segment)
            : undefined,
          warmSignals: Array.isArray(item.warm_signals)
            ? item.warm_signals.map(String)
            : undefined,
          aiSummary: item.ai_summary ? String(item.ai_summary) : undefined,
          personalizationAngle: item.personalization_angle
            ? String(item.personalization_angle)
            : undefined,
          qualificationScore: item.qualification_score
            ? Number(item.qualification_score)
            : undefined,
          sourceUrls: Array.isArray(item.source_urls)
            ? item.source_urls.map(String)
            : undefined,
          sourceProvider: "gemini-ai-search",
          confidence: 0.7,
        })
      );
    } catch {
      return [];
    }
  },
};
