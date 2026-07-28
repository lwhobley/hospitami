import { NextResponse, type NextRequest } from "next/server";
import { getWorkspaceContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function callKimiLinkedIn(prompt: string): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) throw new Error("KIMI_API_KEY is not set");

  const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "kimi",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at writing personalized LinkedIn outreach messages for hospitality technology sales. Write in a friendly, professional tone that doesn't sound like a template.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Kimi API error: ${res.status}`);
  const data = await res.json();
  return (data.choices[0].message.content as string).trim();
}

export async function POST(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    leadId?: string;
    type: "connection" | "inmail";
    businessName?: string;
    contactName?: string;
    contactTitle?: string;
    category?: string;
    warmSignals?: string[];
  };

  // If we have a leadId, enrich from DB
  let leadContext = {
    businessName: body.businessName ?? "",
    contactName: body.contactName ?? "",
    contactTitle: body.contactTitle ?? "",
    category: body.category ?? "",
    warmSignals: body.warmSignals ?? [],
  };

  if (body.leadId) {
    const lead = await prisma.lead.findFirst({
      where: { id: body.leadId, workspaceId: ctx.workspace.id },
      include: { company: true, contact: true },
    });
    if (lead) {
      leadContext = {
        businessName: lead.company?.name ?? leadContext.businessName,
        contactName: lead.contact?.name ?? leadContext.contactName,
        contactTitle: lead.contact?.title ?? leadContext.contactTitle,
        category: lead.company?.category ?? leadContext.category,
        warmSignals: (lead.warmSignals as string[]) ?? leadContext.warmSignals,
      };
    }
  }

  const isConnection = body.type === "connection";
  const charLimit = isConnection ? 300 : 8000;

  const prompt = isConnection
    ? `Write a LinkedIn connection request message for a hospitality tech platform.

Target:
- Name: ${leadContext.contactName} (${leadContext.contactTitle})
- Business: ${leadContext.businessName} (${leadContext.category})
- Warm signals: ${leadContext.warmSignals.join(", ")}

Requirements:
- Strictly under ${charLimit} characters (connection requests are limited)
- First name only, no formalities
- Mention one specific warm signal naturally
- Soft ask — invite to connect, not to buy
- No attachments, no links
- Sound human, not templated

Return only the message text, no subject line or extra formatting.`
    : `Write a LinkedIn InMail message for a hospitality tech platform.

Target:
- Name: ${leadContext.contactName} (${leadContext.contactTitle})
- Business: ${leadContext.businessName} (${leadContext.category})
- Warm signals: ${leadContext.warmSignals.join(", ")}

Requirements:
- Under ${charLimit} characters
- Professional but conversational
- Reference 1-2 specific warm signals
- One clear, low-friction CTA (e.g., "open to a quick chat?")
- No attachments or external links in the body

Return only the message text, no subject line.`;

  try {
    const message = await callKimiLinkedIn(prompt);
    return NextResponse.json({ message, charCount: message.length, charLimit });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
