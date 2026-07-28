import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const queryWs = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(queryWs);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = ctx.workspace.id;
  const status = request.nextUrl.searchParams.get("status");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") ?? "0");

  const leads = await prisma.lead.findMany({
    where: {
      workspaceId,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      company: true,
      contact: true,
      sources: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.lead.count({
    where: {
      workspaceId,
      ...(status ? { status: status as never } : {}),
    },
  });

  return NextResponse.json({ leads, total, limit, offset });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { workspaceId: bodyWs, leads: leadsData } = body;

    const queryWs = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
    const ctx = await getWorkspaceContext(queryWs || bodyWs);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspaceId = ctx.workspace.id;

    if (!leadsData || !Array.isArray(leadsData)) {
      return NextResponse.json(
        { error: "leads array is required" },
        { status: 400 }
      );
    }

    const created = [];
    for (const leadData of leadsData) {
      const company = await prisma.company.create({
        data: {
          workspaceId,
          name: leadData.company?.name ?? leadData.businessName,
          category: leadData.company?.category ?? leadData.category,
          subcategory: leadData.company?.subcategory ?? leadData.subcategory,
          website: leadData.company?.website ?? leadData.website,
          city: leadData.company?.city ?? leadData.city,
          state: leadData.company?.state ?? leadData.state,
          description: leadData.company?.description ?? leadData.description,
        },
      });

      let contact = null;
      const contactInfo = leadData.contact ?? (leadData.contactName ? {
        name: leadData.contactName,
        title: leadData.contactTitle,
        email: leadData.contactEmail,
        phone: leadData.contactPhone,
      } : null);

      if (contactInfo) {
        contact = await prisma.contact.create({
          data: {
            workspaceId,
            companyId: company.id,
            name: contactInfo.name,
            title: contactInfo.title,
            email: contactInfo.email,
            phone: contactInfo.phone,
          },
        });
      }

      const lead = await prisma.lead.create({
        data: {
          workspaceId,
          companyId: company.id,
          contactId: contact?.id,
          qualificationScore: leadData.qualificationScore,
          warmSignals: leadData.warmSignals,
          aiSummary: leadData.aiSummary,
          personalizationAngle: leadData.personalizationAngle,
          idealFor: leadData.idealFor,
        },
      });

      created.push(lead);
    }

    return NextResponse.json({ created: created.length, leads: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
