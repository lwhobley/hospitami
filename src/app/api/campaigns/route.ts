import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const status = request.nextUrl.searchParams.get("status");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      workspaceId,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      sequence: true,
      senderAccount: true,
      _count: { select: { leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, sequenceId, senderAccountId, leadIds } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        name,
        sequenceId,
        senderAccountId,
      },
    });

    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      await prisma.campaignLead.createMany({
        data: leadIds.map((leadId: string) => ({
          campaignId: campaign.id,
          leadId,
        })),
      });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
