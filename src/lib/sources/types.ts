export interface DiscoveredLead {
  businessName: string;
  category: string;
  subcategory?: string;
  city: string;
  state: string;
  website?: string;
  linkedinUrl?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  locationCount?: number;
  hospitalitySegment?: string;
  warmSignals?: string[];
  aiSummary?: string;
  personalizationAngle?: string;
  qualificationScore?: number;
  sourceUrls?: string[];
  sourceProvider: string;
  confidence: number;
  reasoning?: string;
  rawData?: Record<string, unknown>;
}

export interface SourceAdapter {
  name: string;
  search(query: string): Promise<DiscoveredLead[]>;
  enrich?(businessName: string, existingData: Record<string, unknown>): Promise<Partial<DiscoveredLead>>;
}
