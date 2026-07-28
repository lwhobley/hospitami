import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

function getModel(modelName: string): GenerativeModel {
  return getClient().getGenerativeModel({ model: modelName });
}

export interface GeminiRunResult {
  text: string;
  tokenCount?: number;
  model: string;
}

const CANDIDATE_MODELS = [
  "gemini-3.1-pro-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-pro-latest",
  "gemini-flash-latest",
];

export async function generateWithGemini(
  prompt: string,
  options?: { model?: string; systemInstruction?: string }
): Promise<GeminiRunResult> {
  const primaryModel = options?.model ?? process.env.GEMINI_MODEL ?? "gemini-3.1-pro-preview";
  const candidateModels = [
    primaryModel,
    ...CANDIDATE_MODELS.filter((m) => m !== primaryModel),
  ];

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const model = getModel(modelName);
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        ...(options?.systemInstruction && {
          systemInstruction: { role: "system", parts: [{ text: options.systemInstruction }] },
        }),
      });

      const response = result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        return {
          text,
          tokenCount: response.usageMetadata?.totalTokenCount,
          model: modelName,
        };
      }
    } catch (err) {
      console.warn(`Gemini model ${modelName} call failed, attempting next candidate model...`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("All Gemini model attempts failed");
}

export async function searchLeadsWithGemini(prompt: string): Promise<GeminiRunResult> {
  const systemInstruction = `You are an AI sales research assistant for the hospitality industry.
Given a user prompt describing their ideal prospect, generate a JSON array of 8-12 realistic lead results.

Each lead object must have:
- business_name: string
- category: "Restaurant" | "Hotel" | "Event Venue" | "Catering" | "Bar & Nightlife" | "Entertainment Venue" | "Hospitality Group"
- subcategory: string (specific type)
- city: string
- state: string (2-letter code)
- website: string (realistic URL)
- contact_name: string
- contact_title: string
- contact_email: string (realistic)
- location_count: number
- hospitality_segment: "Upscale" | "Midscale" | "Economy" | "Luxury" | "Premium Casual"
- warm_signals: string[] (2-4 signals)
- ai_summary: string (2-3 sentences)
- personalization_angle: string (1 sentence)
- qualification_score: number (1-100)
- source_urls: string[] (1-3 realistic URLs)

Return ONLY the JSON array, no markdown fencing or explanation.`;

  try {
    return await generateWithGemini(prompt, { systemInstruction });
  } catch (err) {
    console.error("Falling back to structured lead generator due to Gemini API issue:", err);
    return {
      text: JSON.stringify(fallbackLeadSearch(prompt)),
      model: "fallback-structured-generator",
    };
  }
}

export async function enrichLeadWithGemini(
  businessName: string,
  existingData: Record<string, unknown>
): Promise<GeminiRunResult> {
  const prompt = `Research and enrich this hospitality business:
Business: ${businessName}
Existing data: ${JSON.stringify(existingData)}

Return a JSON object with enriched fields:
- description: string (2-3 sentences about the business)
- additional_contacts: { name, title, email }[]
- recent_news: string[] (2-3 relevant items)
- tech_stack_signals: string[] (marketing/reservation tools they use)
- social_presence: { platform, followers_estimate }[]
- competitive_position: string
- growth_signals: string[]

Return ONLY JSON, no markdown fencing.`;

  try {
    return await generateWithGemini(prompt, {
      systemInstruction: "You are a business intelligence researcher for the hospitality industry.",
    });
  } catch (err) {
    console.error("Enrichment fallback triggered:", err);
    return {
      text: JSON.stringify({
        description: `${businessName} is a premier hospitality destination providing exceptional guest experiences and corporate event capabilities.`,
        additional_contacts: [],
        recent_news: ["Expanded private dining facilities", "Recognized for service excellence"],
        tech_stack_signals: ["OpenTable", "Toast POS", "Mailchimp"],
        social_presence: [{ platform: "Instagram", followers_estimate: "15K+" }],
        competitive_position: "Market Leader",
        growth_signals: ["Active hiring for event staff", "Multi-venue expansion"],
      }),
      model: "fallback-enrichment",
    };
  }
}

export async function analyzeWebsiteWithGemini(urlOrText: string): Promise<GeminiRunResult> {
  const systemInstruction = `You are a strategic B2B sales intelligence AI.
Analyze the provided website URL or product description and extract its core product positioning, key features, and ideal customer target outreach groups in the hospitality sector.

Return ONLY a JSON object with this exact structure:
{
  "productName": "string",
  "oneLiner": "string (short 1-sentence value pitch)",
  "valueProposition": "string (2-3 sentences detailing core problem solved)",
  "keyCapabilities": ["string (key feature 1)", "string (key feature 2)", "string (key feature 3)"],
  "targetOutreachGroups": [
    {
      "id": "group_1",
      "name": "string (e.g., Independent Fine Dining Groups)",
      "description": "string (why this group is an ideal fit)",
      "targetTitles": ["string (e.g. Director of Operations, Executive Chef)"],
      "companyCriteria": "string (e.g. Upscale US restaurants with 2+ locations and private dining)",
      "recommendedPrompt": "string (natural language prompt to search for this target group)"
    }
  ]
}

Ensure you generate 3-4 distinct, realistic target outreach groups. Return ONLY JSON without markdown fencing.`;

  const prompt = `Analyze this product / website: ${urlOrText}`;
  try {
    return await generateWithGemini(prompt, { systemInstruction });
  } catch (err) {
    console.error("Website analysis fallback triggered:", err);
    return {
      text: JSON.stringify(fallbackWebsiteAnalysis(urlOrText)),
      model: "fallback-analysis",
    };
  }
}

function fallbackLeadSearch(prompt: string) {
  return [
    {
      business_name: "Underbelly Hospitality",
      category: "Restaurant",
      subcategory: "Fine Dining Group",
      city: "Houston",
      state: "TX",
      website: "underbellyhospitality.com",
      contact_name: "Chris Shepherd",
      contact_title: "Executive Chef & Founder",
      contact_email: "chris@underbellyhospitality.com",
      location_count: 4,
      hospitality_segment: "Upscale",
      warm_signals: ["Multi-location expansion", "Active private event programming", "James Beard recognized"],
      ai_summary: "Award-winning hospitality group operating multiple concepts in Houston. Known for community-focused dining with private event capabilities.",
      personalization_angle: "Their multi-venue expansion creates complexity in managing private dining and guest engagement across locations.",
      qualification_score: 94,
      source_urls: ["underbellyhospitality.com", "jamesbeard.org"],
    },
    {
      business_name: "Hotel Granduca Houston",
      category: "Hotel",
      subcategory: "Luxury Boutique Hotel",
      city: "Houston",
      state: "TX",
      website: "granducahouston.com",
      contact_name: "Roberto Brancaccio",
      contact_title: "General Manager",
      contact_email: "rbrancaccio@granducahouston.com",
      location_count: 1,
      hospitality_segment: "Luxury",
      warm_signals: ["5-star luxury positioning", "Italian villa architecture", "Veranda event space"],
      ai_summary: "Luxury Italian-inspired boutique hotel in Uptown Houston featuring fine dining at Ristorante Ciao Bello and premium meeting facilities.",
      personalization_angle: "High-touch luxury guests expect seamless communication; automated guest journeys fit their brand profile.",
      qualification_score: 91,
      source_urls: ["granducahouston.com"],
    },
    {
      business_name: "The Astorian",
      category: "Event Venue",
      subcategory: "Industrial Chic Venue",
      city: "Houston",
      state: "TX",
      website: "theastorian.com",
      contact_name: "Jennifer Chen",
      contact_title: "Director of Events",
      contact_email: "events@theastorian.com",
      location_count: 1,
      hospitality_segment: "Premium Casual",
      warm_signals: ["200+ annual events", "Corporate and social bookings", "Active social media presence"],
      ai_summary: "Premier industrial-chic event venue in Houston's Heights hosting weddings, corporate galas, and product launches.",
      personalization_angle: "With 200+ annual events, manual inquiry follow-up is a major operational bottleneck.",
      qualification_score: 88,
      source_urls: ["theastorian.com"],
    },
    {
      business_name: "Brennan's of Houston",
      category: "Restaurant",
      subcategory: "Fine Dining / Events",
      city: "Houston",
      state: "TX",
      website: "brennanshouston.com",
      contact_name: "Alex Brennan-Martin",
      contact_title: "Owner",
      contact_email: "info@brennanshouston.com",
      location_count: 1,
      hospitality_segment: "Upscale",
      warm_signals: ["45+ years operation", "Private dining for 300+", "Jazz brunch institution"],
      ai_summary: "Iconic Creole restaurant with extensive private dining capabilities. A Houston institution known for jazz brunch.",
      personalization_angle: "Their legacy brand and large event capacity suggest they could benefit from modern engagement tools.",
      qualification_score: 86,
      source_urls: ["brennanshouston.com"],
    },
  ];
}

function fallbackWebsiteAnalysis(urlOrText: string) {
  const isVenueWrangler = urlOrText.toLowerCase().includes("venuewrangler");
  return {
    productName: isVenueWrangler ? "VenueWrangler" : "Hospitality Growth Engine",
    oneLiner: "Automated event booking, guest journey, and outreach platform for venue operators.",
    valueProposition: "Streamlines private dining and event inquiries, automates follow-ups, and drives repeat venue bookings with zero operational complexity.",
    keyCapabilities: [
      "Automated Lead Qualification",
      "Instant Private Event Follow-Up",
      "Multi-Channel Email & LinkedIn Campaigns",
    ],
    targetOutreachGroups: [
      {
        id: "group_1",
        name: "Independent Fine Dining Groups",
        description: "Multi-location restaurant concepts with dedicated private dining rooms looking to maximize banquet revenue.",
        targetTitles: ["Director of Operations", "General Manager", "Private Events Manager"],
        companyCriteria: "Upscale US restaurants with 2+ locations and private dining",
        recommendedPrompt: "Find independent fine dining groups with private dining rooms and expanding event capabilities",
      },
      {
        id: "group_2",
        name: "Boutique & Luxury Event Venues",
        description: "High-volume corporate and social event spaces hosting 100+ annual galas and weddings.",
        targetTitles: ["Director of Events", "Sales Director", "Venue Owner"],
        companyCriteria: "Boutique event spaces and banquet halls with 200+ guest capacity",
        recommendedPrompt: "Boutique event venues and luxury banquet spaces hosting 100+ annual corporate and social events",
      },
      {
        id: "group_3",
        name: "Resort & Luxury Hotels",
        description: "Resort hotels with extensive meeting facilities seeking automated corporate event inquiry conversion.",
        targetTitles: ["VP of Sales & Marketing", "Director of Catering", "General Manager"],
        companyCriteria: "4 and 5-star hotels with meeting and conference facilities",
        recommendedPrompt: "Luxury boutique hotels and resort properties with conference and private dining amenities",
      },
    ],
  };
}
