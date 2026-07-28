import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";
import { searchLeadsWithGemini } from "@/lib/ai/gemini";
import { generateOutreach, generateFollowUp } from "@/lib/ai/kimi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { targetGroupPrompts, productInfo, campaignName } = body;
    const workspaceIdParam = request.nextUrl.searchParams.get("workspaceId") ?? body.workspaceId;

    const ctx = await getWorkspaceContext(workspaceIdParam);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspaceId = ctx.workspace.id;

    if (!targetGroupPrompts || !Array.isArray(targetGroupPrompts) || targetGroupPrompts.length === 0) {
      return NextResponse.json({ error: "Select at least one target outreach group" }, { status: 400 });
    }

    // 1. Search and qualify leads across target groups
    const rawLeads: Array<Record<string, unknown>> = [];
    for (const promptText of targetGroupPrompts) {
      try {
        const searchRes = await searchLeadsWithGemini(promptText);
        const text = searchRes.text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) rawLeads.push(...parsed);
      } catch (err) {
        console.error("Autopilot lead search error for prompt:", promptText, err);
      }
    }

    if (rawLeads.length === 0) {
      return NextResponse.json({ error: "No leads discovered for selected groups" }, { status: 400 });
    }

    // 2. Create LeadList
    const listName = campaignName ? `${campaignName} Leads` : `${productInfo?.productName || "Product"} Autopilot List`;
    const leadList = await prisma.leadList.create({
      data: {
        workspaceId,
        name: listName,
        description: `Target leads generated for ${productInfo?.productName || "Product"}`,
      },
    });

    // 3. Save Companies, Contacts, and Leads
    const savedLeads = [];
    for (const leadData of rawLeads.slice(0, 8)) {
      const companyName = String(leadData.business_name || leadData.businessName || "Hospitality Prospect");
      const category = String(leadData.category || "Restaurant");

      const company = await prisma.company.create({
        data: {
          workspaceId,
          name: companyName,
          category,
          subcategory: (leadData.subcategory as string) || null,
          website: (leadData.website as string) || null,
          city: (leadData.city as string) || null,
          state: (leadData.state as string) || null,
        },
      });

      const contactName = (leadData.contact_name || leadData.contactName) as string;
      const contactTitle = (leadData.contact_title || leadData.contactTitle) as string;
      const contactEmail = (leadData.contact_email || leadData.contactEmail) as string;

      let contact = null;
      if (contactName) {
        contact = await prisma.contact.create({
          data: {
            workspaceId,
            companyId: company.id,
            name: contactName,
            title: contactTitle || null,
            email: contactEmail || null,
          },
        });
      }

      const lead = await prisma.lead.create({
        data: {
          workspaceId,
          companyId: company.id,
          contactId: contact?.id ?? null,
          qualificationScore: Number(leadData.qualification_score || leadData.qualificationScore || 88),
          warmSignals: (leadData.warm_signals || leadData.warmSignals || []) as never,
          aiSummary: String(leadData.ai_summary || leadData.aiSummary || ""),
          personalizationAngle: String(leadData.personalization_angle || leadData.personalizationAngle || ""),
        },
      });

      await prisma.listMember.create({
        data: {
          listId: leadList.id,
          leadId: lead.id,
        },
      });

      savedLeads.push({
        lead,
        company,
        contact,
        warmSignals: (leadData.warm_signals || leadData.warmSignals || []) as string[],
        personalizationAngle: String(leadData.personalization_angle || leadData.personalizationAngle || ""),
      });
    }

    // 4. Create Sequence with custom product outreach
    const sequence = await prisma.sequence.create({
      data: {
        workspaceId,
        name: `${productInfo?.productName || "Product"} Autopilot Sequence`,
        description: `Personalized outreach sequence pitching ${productInfo?.productName || "product"}`,
      },
    });

    // Generate Step 1 Initial Email using Kimi
    const firstLead = savedLeads[0];
    const initialCopy = await generateOutreach({
      businessName: firstLead.company.name,
      contactName: firstLead.contact?.name || firstLead.company.name,
      contactTitle: firstLead.contact?.title || "",
      category: firstLead.company.category || "Hospitality",
      warmSignals: firstLead.warmSignals,
      personalizationAngle: firstLead.personalizationAngle,
      productContext: productInfo,
    });

    await prisma.sequenceStep.create({
      data: {
        sequenceId: sequence.id,
        order: 1,
        type: "EMAIL",
        subject: initialCopy.subject || `Elevating operations at {{business_name}}`,
        body: initialCopy.body || `Hi {{contact_name}}, I noticed {{business_name}}'s recent growth...`,
      },
    });

    // Step 2 Wait Step
    await prisma.sequenceStep.create({
      data: {
        sequenceId: sequence.id,
        order: 2,
        type: "WAIT",
        waitDays: 3,
      },
    });

    // Step 3 Follow Up Email using Kimi
    const followUpCopy = await generateFollowUp(
      initialCopy,
      2,
      { businessName: firstLead.company.name, contactName: firstLead.contact?.name || "there" }
    );

    await prisma.sequenceStep.create({
      data: {
        sequenceId: sequence.id,
        order: 3,
        type: "EMAIL",
        subject: followUpCopy.subject || `Quick follow up for {{business_name}}`,
        body: followUpCopy.body || `Hi {{contact_name}}, wanted to check back on my previous note...`,
      },
    });

    // 5. Find or use default Sender Account
    const sender = await prisma.senderAccount.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });

    // 6. Create Campaign
    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        name: campaignName || `${productInfo?.productName || "Product"} Growth Campaign`,
        status: "DRAFT",
        sequenceId: sequence.id,
        senderAccountId: sender?.id ?? null,
      },
    });

    for (const item of savedLeads) {
      await prisma.campaignLead.create({
        data: {
          campaignId: campaign.id,
          leadId: item.lead.id,
          status: "pending",
        },
      });
    }

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      listId: leadList.id,
      sequenceId: sequence.id,
      leadCount: savedLeads.length,
      sampleOutreach: initialCopy,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Campaign generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
