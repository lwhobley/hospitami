import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const status = request.nextUrl.searchParams.get("status");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") ?? "0");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

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
    const body = await request.json();
    const { workspaceId, leads: leadsData } = body;

    if (!workspaceId || !leadsData || !Array.isArray(leadsData)) {
      return NextResponse.json(
        { error: "workspaceId and leads array are required" },
        { status: 400 }
      );
    }

    const created = [];
    for (const leadData of leadsData) {
      const company = await prisma.company.create({
        data: {
          workspaceId,
          name: leadData.businessName,
          category: leadData.category,
          subcategory: leadData.subcategory,
          website: leadData.website,
          city: leadData.city,
          state: leadData.state,
          hospitalitySegment: leadData.hospitalitySegment,
        },
      });

      let contact = null;
      if (leadData.contactName) {
        contact = await prisma.contact.create({
          data: {
            workspaceId,
            companyId: company.id,
            name: leadData.contactName,
            title: leadData.contactTitle,
            email: leadData.contactEmail,
            phone: leadData.contactPhone,
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

      if (leadData.sourceUrls) {
        for (const url of leadData.sourceUrls) {
          await prisma.leadSource.create({
            data: {
              leadId: lead.id,
              provider: leadData.sourceProvider ?? "gemini-ai-search",
              sourceUrl: url,
              confidenceScore: leadData.confidence,
            },
          });
        }
      }

      created.push(lead);
    }

    return NextResponse.json({ created: created.length, leads: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
