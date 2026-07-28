import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const lists = await prisma.leadList.findMany({
    where: { workspaceId },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ lists });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, description, color, leadIds } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    const list = await prisma.leadList.create({
      data: {
        workspaceId,
        name,
        description,
        color,
      },
    });

    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      await prisma.listMember.createMany({
        data: leadIds.map((leadId: string) => ({
          listId: list.id,
          leadId,
        })),
      });
    }

    return NextResponse.json({ list });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
