import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";
import { sendTemplate } from "@/lib/email";
import { bodyToHtml, buildUnsubscribeUrl } from "@/lib/email/templates";
import { generateOutreach, generateFollowUp } from "@/lib/ai/kimi";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      sequence: { include: { steps: { orderBy: { order: "asc" } } } },
      senderAccount: true,
      leads: {
        where: { status: "pending" },
        include: {
          lead: {
            include: {
              company: true,
              contact: true,
            },
          },
        },
        take: 50, // batch limit
      },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (!campaign.senderAccount) {
    return NextResponse.json({ error: "No sender account configured" }, { status: 400 });
  }
  if (!campaign.sequence || campaign.sequence.steps.length === 0) {
    return NextResponse.json({ error: "No sequence steps configured" }, { status: 400 });
  }

  const sender = campaign.senderAccount;
  const emailSteps = campaign.sequence.steps.filter((s) => s.type === "EMAIL");
  const results: { leadId: string; status: string; error?: string }[] = [];

  for (const cl of campaign.leads) {
    const stepIndex = cl.currentStep;
    const step = emailSteps[stepIndex];
    if (!step) {
      results.push({ leadId: cl.leadId, status: "no_step" });
      continue;
    }

    const lead = cl.lead;
    const leadContext = {
      businessName: lead.company?.name ?? "",
      contactName: lead.contact?.name ?? "",
      contactTitle: lead.contact?.title ?? "",
      city: lead.company?.city ?? "",
      category: lead.company?.category ?? "",
      warmSignals: (lead.warmSignals as string[]) ?? [],
      personalizationAngle: "",
    };

    try {
      // Generate personalized content if no body template
      let subject = step.subject ?? "";
      let body = step.body ?? "";

      if (!body) {
        const generated =
          stepIndex === 0
            ? await generateOutreach(leadContext)
            : await generateFollowUp(
                { subject, body: "" },
                stepIndex + 1,
                leadContext
              );
        subject = generated.subject;
        body = generated.body;
      }

      const contactEmail = lead.contact?.email;
      if (!contactEmail) {
        results.push({ leadId: cl.leadId, status: "no_email" });
        continue;
      }

      // Send email with tracking
      await sendTemplate({
        from: sender.email,
        fromName: sender.name,
        to: contactEmail,
        subjectTemplate: subject,
        bodyTemplate: bodyToHtml(body),
        variables: {
          business_name: leadContext.businessName,
          contact_name: leadContext.contactName,
          contact_first_name: leadContext.contactName.split(" ")[0],
          city: leadContext.city,
          category: leadContext.category,
          sender_name: sender.name,
          sender_email: sender.email,
          unsubscribe_url: buildUnsubscribeUrl(cl.id),
        },
        campaignLeadId: cl.id,
      });

      // Update campaign lead record
      await prisma.campaignLead.update({
        where: { id: cl.id },
        data: {
          sentAt: new Date(),
          currentStep: stepIndex + 1,
          status: "sent",
        },
      });

      // Increment sender daily count
      await prisma.senderAccount.update({
        where: { id: sender.id },
        data: { sentToday: { increment: 1 } },
      });

      results.push({ leadId: cl.leadId, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      await prisma.campaignLead.update({
        where: { id: cl.id },
        data: { status: "error" },
      });
      results.push({ leadId: cl.leadId, status: "error", error: message });
    }
  }

  // Activate campaign if it was draft
  if (campaign.status === "DRAFT") {
    await prisma.campaign.update({
      where: { id },
      data: { status: "ACTIVE", startedAt: new Date() },
    });
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const errors = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ sent, errors, results });
}
