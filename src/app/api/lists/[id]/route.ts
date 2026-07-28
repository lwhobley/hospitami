import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.leadList.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      members: {
        include: {
          lead: {
            include: {
              company: true,
              contact: true,
              tags: { include: { tag: true } },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const leads = list.members.map((m) => ({
    id: m.lead.id,
    businessName: m.lead.company?.name ?? "Unknown",
    category: m.lead.company?.category ?? "",
    contactName: m.lead.contact?.name ?? "",
    contactTitle: m.lead.contact?.title ?? "",
    contactEmail: m.lead.contact?.email ?? "",
    linkedinUrl: m.lead.contact?.linkedinUrl ?? null,
    city: m.lead.company?.city ?? "",
    state: m.lead.company?.state ?? "",
    score: m.lead.qualificationScore ?? 0,
    status: m.lead.status,
    warmSignals: (m.lead.warmSignals as string[]) ?? [],
    addedAt: m.addedAt,
  }));

  return NextResponse.json({
    list: {
      id: list.id,
      name: list.name,
      description: list.description,
      color: list.color,
      isSmartList: list.isSmartList,
      leadCount: list.members.length,
    },
    leads,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    color?: string;
    addLeadIds?: string[];
    removeLeadIds?: string[];
  };

  const [list] = await prisma.$transaction([
    prisma.leadList.update({
      where: { id, workspaceId: ctx.workspace.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.color && { color: body.color }),
      },
    }),
    ...(body.addLeadIds?.map((leadId) =>
      prisma.listMember.upsert({
        where: { listId_leadId: { listId: id, leadId } },
        create: { listId: id, leadId },
        update: {},
      })
    ) ?? []),
    ...(body.removeLeadIds?.map((leadId) =>
      prisma.listMember.delete({
        where: { listId_leadId: { listId: id, leadId } },
      })
    ) ?? []),
  ]);

  return NextResponse.json(list);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.leadList.delete({ where: { id, workspaceId: ctx.workspace.id } });
  return NextResponse.json({ ok: true });
}
