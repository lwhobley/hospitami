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
    if (!ctx) return NextResponse.json({ error: "Unauthorized or no active workspace" }, { status: 401 });

    const workspaceId = ctx.workspace.id;

    if (!leadsData || !Array.isArray(leadsData) || leadsData.length === 0) {
      return NextResponse.json(
        { error: "leads array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const created = [];
    for (const leadData of leadsData) {
      try {
        const companyName =
          leadData.company?.name || leadData.businessName || "Unknown Company";
        const category = leadData.company?.category || leadData.category || "Hospitality";
        const subcategory = leadData.company?.subcategory || leadData.subcategory;
        const website = leadData.company?.website || leadData.website;
        const city = leadData.company?.city || leadData.city;
        const state = leadData.company?.state || leadData.state;
        const description =
          leadData.company?.description || leadData.description || leadData.aiSummary;

        const company = await prisma.company.create({
          data: {
            workspaceId,
            name: companyName,
            category,
            subcategory: subcategory ?? null,
            website: website ?? null,
            city: city ?? null,
            state: state ?? null,
            description: description ?? null,
          },
        });

        let contact = null;
        const contactInfo = leadData.contact ?? (leadData.contactName ? {
          name: leadData.contactName,
          title: leadData.contactTitle,
          email: leadData.contactEmail,
          phone: leadData.contactPhone,
          linkedinUrl: leadData.linkedinUrl,
        } : null);

        if (contactInfo && contactInfo.name) {
          contact = await prisma.contact.create({
            data: {
              workspaceId,
              companyId: company.id,
              name: contactInfo.name,
              title: contactInfo.title ?? null,
              email: contactInfo.email ?? null,
              phone: contactInfo.phone ?? null,
              linkedinUrl: contactInfo.linkedinUrl ?? null,
            },
          });
        }

        const lead = await prisma.lead.create({
          data: {
            workspaceId,
            companyId: company.id,
            contactId: contact?.id ?? null,
            qualificationScore: leadData.qualificationScore ?? 85,
            warmSignals: leadData.warmSignals ? leadData.warmSignals : [],
            aiSummary: leadData.aiSummary || description || null,
            personalizationAngle: leadData.personalizationAngle || leadData.reasoning || null,
            idealFor: leadData.idealFor ?? null,
          },
        });

        created.push(lead);
      } catch (itemErr) {
        console.error("Failed to create lead item:", itemErr);
      }
    }

    return NextResponse.json({ created: created.length, leads: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
