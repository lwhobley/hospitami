import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchLeadsWithGemini } from "@/lib/ai/gemini";
import { AiProvider, JobStatus, Prisma } from "@/generated/prisma/client";
import { getWorkspaceContext } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { prompt, workspaceId: bodyWorkspaceId } = body;

    const queryWorkspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
    const ctx = await getWorkspaceContext(queryWorkspaceId || bodyWorkspaceId);

    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized or no active workspace" }, { status: 401 });
    }

    const workspaceId = ctx.workspace.id;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A valid search prompt is required" },
        { status: 400 }
      );
    }

    const searchJob = await prisma.searchJob.create({
      data: {
        workspaceId,
        prompt,
        providers: ["gemini-ai-search"],
        status: JobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    const startTime = Date.now();
    const result = await searchLeadsWithGemini(prompt);
    const durationMs = Date.now() - startTime;

    let leads: Record<string, unknown>[] = [];
    try {
      const text = result.text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      leads = JSON.parse(text);
    } catch {
      await prisma.searchJob.update({
        where: { id: searchJob.id },
        data: {
          status: JobStatus.FAILED,
          error: "Failed to parse AI response",
          completedAt: new Date(),
        },
      });
      return NextResponse.json(
        { error: "Failed to parse search results" },
        { status: 500 }
      );
    }

    await prisma.aiRun.create({
      data: {
        workspaceId,
        provider: AiProvider.GEMINI,
        model: result.model,
        purpose: "lead_search",
        prompt,
        rawResponse: leads as unknown as Prisma.InputJsonValue,
        parsedOutput: leads as unknown as Prisma.InputJsonValue,
        tokenCount: result.tokenCount,
        status: JobStatus.COMPLETED,
        durationMs,
      },
    });

    await prisma.searchJob.update({
      where: { id: searchJob.id },
      data: {
        status: JobStatus.COMPLETED,
        resultCount: leads.length,
        results: leads as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ leads, jobId: searchJob.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
