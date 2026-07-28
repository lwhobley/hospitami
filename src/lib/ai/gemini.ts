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

function getModel(modelName = "gemini-2.0-flash"): GenerativeModel {
  return getClient().getGenerativeModel({ model: modelName });
}

export interface GeminiRunResult {
  text: string;
  tokenCount?: number;
  model: string;
}

export async function generateWithGemini(
  prompt: string,
  options?: { model?: string; systemInstruction?: string }
): Promise<GeminiRunResult> {
  const modelName = options?.model ?? "gemini-2.0-flash";
  const model = getModel(modelName);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(options?.systemInstruction && {
      systemInstruction: { role: "system", parts: [{ text: options.systemInstruction }] },
    }),
  });

  const response = result.response;
  const text = response.text();

  return {
    text,
    tokenCount: response.usageMetadata?.totalTokenCount,
    model: modelName,
  };
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

  return generateWithGemini(prompt, { systemInstruction });
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

  return generateWithGemini(prompt, {
    systemInstruction: "You are a business intelligence researcher for the hospitality industry.",
  });
}
