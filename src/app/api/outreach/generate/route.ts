import { NextResponse, type NextRequest } from "next/server";
import { getWorkspaceContext } from "@/lib/auth";
import { generateOutreach, generateFollowUp } from "@/lib/ai/kimi";
import { prisma } from "@/lib/prisma";
import { AiProvider, JobStatus } from "@/generated/prisma/client";
import { type Prisma } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    leadId: string;
    type: "initial" | "followup";
    stepNumber?: number;
    originalSubject?: string;
    tone?: string;
  };

  const lead = await prisma.lead.findFirst({
    where: { id: body.leadId, workspaceId: ctx.workspace.id },
    include: {
      company: true,
      contact: true,
    },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const leadContext = {
    businessName: lead.company?.name ?? "",
    contactName: lead.contact?.name ?? "",
    contactTitle: lead.contact?.title ?? "",
    city: lead.company?.city ?? "",
    category: lead.company?.category ?? "",
    warmSignals: (lead.warmSignals as string[]) ?? [],
    aiSummary: lead.aiSummary ?? "",
    personalizationAngle: lead.personalizationAngle ?? "",
  };

  const start = Date.now();

  let result: { subject: string; body: string };
  try {
    if (body.type === "followup" && body.stepNumber) {
      const followUp = await generateFollowUp(
        { subject: body.originalSubject ?? "", body: "" },
        body.stepNumber,
        leadContext
      );
      result = followUp;
    } else {
      result = await generateOutreach(leadContext, { tone: body.tone });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }

  const durationMs = Date.now() - start;

  await prisma.aiRun.create({
    data: {
      workspaceId: ctx.workspace.id,
      provider: AiProvider.KIMI,
      model: "kimi",
      purpose: body.type === "followup" ? "follow_up_generation" : "outreach_generation",
      prompt: JSON.stringify(leadContext),
      rawResponse: result as unknown as Prisma.InputJsonValue,
      parsedOutput: result as unknown as Prisma.InputJsonValue,
      status: JobStatus.COMPLETED,
      durationMs,
    },
  });

  return NextResponse.json(result);
}
