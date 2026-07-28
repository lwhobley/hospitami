export interface KimiRunResult {
  text: string;
  model: string;
  tokenCount?: number;
}

async function callKimi(
  prompt: string,
  systemPrompt?: string,
  model = "kimi"
): Promise<KimiRunResult> {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) throw new Error("KIMI_API_KEY is not set");

  const messages = [
    ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
    { role: "user" as const, content: prompt },
  ];

  const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });

  if (!response.ok) {
    throw new Error(`Kimi API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    model,
    tokenCount: data.usage?.total_tokens,
  };
}

export async function generateOutreach(
  leadContext: {
    businessName: string;
    contactName: string;
    contactTitle: string;
    category: string;
    warmSignals: string[];
    personalizationAngle: string;
  },
  options?: { tone?: string; length?: "short" | "medium" | "long" }
): Promise<KimiRunResult> {
  const tone = options?.tone ?? "professional and warm";
  const length = options?.length ?? "medium";

  const prompt = `Write a personalized cold outreach email for a hospitality technology platform.

Target:
- Business: ${leadContext.businessName}
- Contact: ${leadContext.contactName}, ${leadContext.contactTitle}
- Category: ${leadContext.category}
- Warm signals: ${leadContext.warmSignals.join(", ")}
- Personalization angle: ${leadContext.personalizationAngle}

Requirements:
- Tone: ${tone}
- Length: ${length}
- Include a compelling subject line
- Reference specific warm signals
- Natural personalization, not templated
- Clear but soft CTA

Return JSON: { "subject": "...", "body": "..." }`;

  return callKimi(prompt, "You are an expert B2B sales copywriter for hospitality technology.");
}

export async function generateFollowUp(
  originalEmail: { subject: string; body: string },
  stepNumber: number,
  context: { businessName: string; contactName: string }
): Promise<KimiRunResult> {
  const prompt = `Write follow-up email #${stepNumber} for this outreach thread.

Original email subject: ${originalEmail.subject}
Original email body: ${originalEmail.body}
Business: ${context.businessName}
Contact: ${context.contactName}

The follow-up should:
- Reference the previous email naturally
- Add new value or angle
- Be shorter than the original
- Have a different CTA

Return JSON: { "subject": "...", "body": "..." }`;

  return callKimi(prompt, "You are an expert B2B sales copywriter. Write concise, non-pushy follow-ups.");
}

export async function generateReplyDraft(
  thread: { subject: string; messages: { direction: string; body: string }[] },
  intent: string
): Promise<KimiRunResult> {
  const conversation = thread.messages
    .map((m) => `${m.direction === "INBOUND" ? "Them" : "Us"}: ${m.body}`)
    .join("\n\n");

  const prompt = `Draft a reply for this email conversation.

Subject: ${thread.subject}
Conversation:
${conversation}

Intent: ${intent}

Write a natural, professional reply. Return JSON: { "body": "..." }`;

  return callKimi(prompt, "You are an expert sales communicator.");
}
