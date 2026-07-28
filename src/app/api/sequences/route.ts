import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const sequences = await prisma.sequence.findMany({
    where: { workspaceId },
    include: {
      steps: { orderBy: { order: "asc" } },
      _count: { select: { campaigns: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sequences });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, description, steps } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    const sequence = await prisma.sequence.create({
      data: {
        workspaceId,
        name,
        description,
        steps: steps
          ? {
              create: steps.map(
                (
                  step: { type: string; subject?: string; body?: string; waitDays?: number },
                  index: number
                ) => ({
                  order: index,
                  type: step.type === "wait" ? "WAIT" : "EMAIL",
                  subject: step.subject,
                  body: step.body,
                  waitDays: step.waitDays,
                })
              ),
            }
          : undefined,
      },
      include: { steps: true },
    });

    return NextResponse.json({ sequence });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
