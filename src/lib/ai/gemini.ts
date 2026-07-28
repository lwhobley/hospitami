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

const FALLBACK_MODELS = ["gemini-2.5-pro", "gemini-1.5-pro", "gemini-1.5-flash"];

export async function generateWithGemini(
  prompt: string,
  options?: { model?: string; systemInstruction?: string }
): Promise<GeminiRunResult> {
  const primaryModel = options?.model ?? process.env.GEMINI_MODEL ?? "gemini-2.5-pro";
  const candidateModels = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

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

      return {
        text,
        tokenCount: response.usageMetadata?.totalTokenCount,
        model: modelName,
      };
    } catch (err) {
      console.warn(`Gemini model ${modelName} failed, attempting fallback...`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("All Gemini model fallbacks failed");
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
  return generateWithGemini(prompt, { systemInstruction });
}
