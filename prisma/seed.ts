import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, LeadStatus, CampaignStatus, SenderStatus, MessageDirection, SequenceStepType } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // Clean
  await prisma.auditLog.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.searchJob.deleteMany();
  await prisma.enrichmentJob.deleteMany();
  await prisma.aiRun.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tagAssignment.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.inboxMessage.deleteMany();
  await prisma.inboxThread.deleteMany();
  await prisma.campaignLead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.sequenceStep.deleteMany();
  await prisma.sequence.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.listMember.deleteMany();
  await prisma.leadList.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.leadSource.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.senderDomain.deleteMany();
  await prisma.senderAccount.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // User
  const user = await prisma.user.create({
    data: {
      email: "sarah@hospitami.com",
      name: "Sarah Mitchell",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "mike@hospitami.com",
      name: "Mike Thompson",
    },
  });

  // Organization & Workspace
  const org = await prisma.organization.create({
    data: {
      name: "Hospitami",
      slug: "hospitami",
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Hospitami Sales",
      slug: "sales",
      organizationId: org.id,
    },
  });

  await prisma.workspaceMember.createMany({
    data: [
      { userId: user.id, workspaceId: workspace.id, role: "ADMIN" },
      { userId: user2.id, workspaceId: workspace.id, role: "MANAGER" },
    ],
  });

  // Companies & Contacts & Leads
  const hospitality = [
    {
      company: {
        name: "Underbelly Hospitality",
        category: "Restaurant",
        subcategory: "Fine Dining Group",
        website: "underbellyhospitality.com",
        city: "Houston",
        state: "TX",
        hospitalitySegment: "Upscale",
        locationCount: 5,
      },
      contact: {
        name: "Chris Shepherd",
        title: "Executive Chef & Founder",
        email: "chris@underbellyhospitality.com",
      },
      lead: {
        qualificationScore: 94,
        warmSignals: ["Multi-location expansion", "Active event programming", "James Beard recognition", "Private dining rooms"],
        aiSummary: "Award-winning hospitality group with multiple concepts. Known for community-focused dining with private event capabilities.",
        personalizationAngle: "Multi-venue expansion creates complexity in managing events and guest engagement across locations.",
        status: LeadStatus.NEW,
      },
    },
    {
      company: {
        name: "Hotel Granduca Houston",
        category: "Hotel",
        subcategory: "Boutique Luxury Hotel",
        website: "granducahouston.com",
        city: "Houston",
        state: "TX",
        hospitalitySegment: "Luxury",
        locationCount: 1,
      },
      contact: {
        name: "Roberto Brancaccio",
        title: "General Manager",
        email: "rbrancaccio@granducahouston.com",
      },
      lead: {
        qualificationScore: 91,
        warmSignals: ["Active wedding/event venue", "Recently renovated spaces", "Corporate event packages"],
        aiSummary: "Tuscan-inspired luxury boutique hotel with 122 suites. Strong event business including weddings and corporate gatherings.",
        personalizationAngle: "Dual focus on luxury lodging and event hosting needs seamless guest engagement across both.",
        status: LeadStatus.CONTACTED,
      },
    },
    {
      company: {
        name: "The Astorian",
        category: "Event Venue",
        subcategory: "Historic Event Space",
        website: "theastorian.com",
        city: "Houston",
        state: "TX",
        hospitalitySegment: "Premium Casual",
        locationCount: 1,
      },
      contact: {
        name: "Jennifer Chen",
        title: "Director of Events",
        email: "events@theastorian.com",
      },
      lead: {
        qualificationScore: 88,
        warmSignals: ["High-volume event bookings", "Corporate and social events", "Active social media presence"],
        aiSummary: "Premier industrial-chic event venue hosting 200+ events annually.",
        personalizationAngle: "200+ annual events means they likely struggle with manual follow-up at scale.",
        status: LeadStatus.NEW,
      },
    },
    {
      company: {
        name: "Brennan's of Houston",
        category: "Restaurant",
        subcategory: "Fine Dining / Events",
        website: "brennanshouston.com",
        city: "Houston",
        state: "TX",
        hospitalitySegment: "Upscale",
        locationCount: 1,
      },
      contact: {
        name: "Alex Brennan-Martin",
        title: "Owner",
        email: "info@brennanshouston.com",
      },
      lead: {
        qualificationScore: 86,
        warmSignals: ["45+ years in operation", "Private dining for 300+", "Jazz brunch institution"],
        aiSummary: "Iconic Creole restaurant with extensive private dining and event capabilities.",
        personalizationAngle: "Legacy brand and large event capacity could benefit from modern engagement tools.",
        status: LeadStatus.QUALIFIED,
      },
    },
    {
      company: {
        name: "The Houstonian Hotel",
        category: "Hotel",
        subcategory: "Resort-Style Hotel",
        website: "houstonian.com",
        city: "Houston",
        state: "TX",
        hospitalitySegment: "Luxury",
        locationCount: 1,
      },
      contact: {
        name: "Mark Lindsey",
        title: "VP of Sales & Marketing",
        email: "mlindsey@houstonian.com",
      },
      lead: {
        qualificationScore: 90,
        warmSignals: ["Full-service resort amenities", "Multiple event spaces", "Club membership model"],
        aiSummary: "Luxury 27-acre resort-style hotel with spa, fitness, and extensive event facilities.",
        personalizationAngle: "Integrated hotel-club-spa model needs unified guest engagement across touchpoints.",
        status: LeadStatus.NEW,
      },
    },
    {
      company: {
        name: "Common Bond Bistro & Bakery",
        category: "Restaurant",
        subcategory: "Fast Casual / Bakery",
        website: "commonbondcafe.com",
        city: "Houston",
        state: "TX",
        hospitalitySegment: "Premium Casual",
        locationCount: 6,
      },
      contact: {
        name: "George Joseph",
        title: "Co-Founder",
        email: "george@commonbondcafe.com",
      },
      lead: {
        qualificationScore: 78,
        warmSignals: ["6+ location expansion", "Catering services growing", "Tech-forward ordering"],
        aiSummary: "Rapidly growing bakery-cafe chain with expanding catering business.",
        personalizationAngle: "Multi-location growth and catering expansion signal a need for scalable engagement tools.",
        status: LeadStatus.NEW,
      },
    },
  ];

  const createdLeads = [];
  for (const item of hospitality) {
    const company = await prisma.company.create({
      data: { workspaceId: workspace.id, ...item.company },
    });
    const contact = await prisma.contact.create({
      data: { workspaceId: workspace.id, companyId: company.id, ...item.contact },
    });
    const lead = await prisma.lead.create({
      data: {
        workspaceId: workspace.id,
        companyId: company.id,
        contactId: contact.id,
        ...item.lead,
      },
    });
    await prisma.leadSource.create({
      data: {
        leadId: lead.id,
        provider: "gemini-ai-search",
        sourceUrl: item.company.website,
        confidenceScore: 0.85,
        reasoning: "AI-discovered via hospitality business research",
      },
    });
    createdLeads.push(lead);
  }

  // Lists
  const list1 = await prisma.leadList.create({
    data: {
      workspaceId: workspace.id,
      name: "Houston Fine Dining",
      description: "Upscale restaurants in Houston with event capabilities",
      color: "#3b82f6",
    },
  });

  for (const lead of createdLeads.filter((_, i) => [0, 3, 5].includes(i))) {
    await prisma.listMember.create({
      data: { listId: list1.id, leadId: lead.id },
    });
  }

  const list2 = await prisma.leadList.create({
    data: {
      workspaceId: workspace.id,
      name: "Texas Boutique Hotels",
      description: "Independent boutique hotels across Texas",
      color: "#8b5cf6",
    },
  });

  for (const lead of createdLeads.filter((_, i) => [1, 4].includes(i))) {
    await prisma.listMember.create({
      data: { listId: list2.id, leadId: lead.id },
    });
  }

  // Tags
  const tags = await Promise.all(
    ["High Priority", "Decision Maker", "Event Focus", "Multi-Location"].map((name) =>
      prisma.tag.create({ data: { workspaceId: workspace.id, name } })
    )
  );

  await prisma.tagAssignment.create({
    data: { tagId: tags[0].id, leadId: createdLeads[0].id },
  });
  await prisma.tagAssignment.create({
    data: { tagId: tags[1].id, leadId: createdLeads[0].id },
  });

  // Sequences
  const seq1 = await prisma.sequence.create({
    data: {
      workspaceId: workspace.id,
      name: "Fine Dining Outreach",
      description: "3-step sequence for upscale restaurant prospects",
    },
  });

  await prisma.sequenceStep.createMany({
    data: [
      {
        sequenceId: seq1.id,
        order: 0,
        type: SequenceStepType.EMAIL,
        subject: "Helping {{business_name}} elevate guest experiences",
        body: "Hi {{contact_name}}, I noticed {{business_name}}'s growing event programming...",
      },
      { sequenceId: seq1.id, order: 1, type: SequenceStepType.WAIT, waitDays: 3 },
      {
        sequenceId: seq1.id,
        order: 2,
        type: SequenceStepType.EMAIL,
        subject: "Quick follow-up on guest engagement",
        body: "{{contact_name}}, wanted to share a quick case study...",
      },
      { sequenceId: seq1.id, order: 3, type: SequenceStepType.WAIT, waitDays: 5 },
      {
        sequenceId: seq1.id,
        order: 4,
        type: SequenceStepType.EMAIL,
        subject: "One more thought for {{business_name}}",
        body: "Hi {{contact_name}}, just wanted to leave you with this...",
      },
    ],
  });

  // Senders
  const sender1 = await prisma.senderAccount.create({
    data: {
      workspaceId: workspace.id,
      email: "outreach@venuewrangler.com",
      name: "VenueWrangler Outreach",
      status: SenderStatus.ACTIVE,
      dailyLimit: 50,
      sentToday: 23,
      warmupDay: 30,
    },
  });

  await prisma.senderAccount.create({
    data: {
      workspaceId: workspace.id,
      email: "team@venuewrangler.com",
      name: "VenueWrangler Team",
      status: SenderStatus.ACTIVE,
      dailyLimit: 40,
      sentToday: 18,
      warmupDay: 25,
    },
  });

  await prisma.senderDomain.create({
    data: {
      workspaceId: workspace.id,
      domain: "venuewrangler.com",
      verified: true,
      spfRecord: "v=spf1 include:_spf.resend.com ~all",
      dkimRecord: "v=DKIM1; k=rsa; p=MIIBIjANBg...",
      dmarcRecord: "v=DMARC1; p=quarantine; rua=mailto:dmarc@venuewrangler.com",
    },
  });

  // Campaign
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: "Q3 Houston Fine Dining",
      status: CampaignStatus.ACTIVE,
      sequenceId: seq1.id,
      senderAccountId: sender1.id,
      startedAt: new Date("2024-07-05"),
    },
  });

  for (const lead of createdLeads.slice(0, 4)) {
    await prisma.campaignLead.create({
      data: { campaignId: campaign.id, leadId: lead.id, status: "sent" },
    });
  }

  // Inbox threads
  const thread1 = await prisma.inboxThread.create({
    data: {
      workspaceId: workspace.id,
      subject: "Re: Helping Underbelly Hospitality elevate guest experiences",
      contactEmail: "chris@underbellyhospitality.com",
      contactName: "Chris Shepherd",
      isRead: false,
      isStarred: true,
      lastMessageAt: new Date("2024-07-26T14:30:00Z"),
    },
  });

  await prisma.inboxMessage.createMany({
    data: [
      {
        threadId: thread1.id,
        direction: MessageDirection.OUTBOUND,
        fromEmail: "outreach@venuewrangler.com",
        fromName: "VenueWrangler Outreach",
        toEmail: "chris@underbellyhospitality.com",
        subject: "Helping Underbelly Hospitality elevate guest experiences",
        body: "Hi Chris, I noticed Underbelly Hospitality's growing event programming and multi-location expansion...",
        sentAt: new Date("2024-07-20T09:00:00Z"),
      },
      {
        threadId: thread1.id,
        direction: MessageDirection.INBOUND,
        fromEmail: "chris@underbellyhospitality.com",
        fromName: "Chris Shepherd",
        toEmail: "outreach@venuewrangler.com",
        subject: "Re: Helping Underbelly Hospitality elevate guest experiences",
        body: "Thanks for reaching out! We've been looking into better tools for our events. Can you share more about what you offer?",
        sentAt: new Date("2024-07-26T14:30:00Z"),
      },
    ],
  });

  // Saved search
  await prisma.savedSearch.create({
    data: {
      workspaceId: workspace.id,
      name: "Houston Fine Dining Prospects",
      prompt:
        "Find independent upscale restaurants in Houston with private dining, active event programming, and signs they may need better guest engagement tools.",
      resultCount: 6,
    },
  });

  console.log("Seed complete.");
  console.log(`  Organization: ${org.name}`);
  console.log(`  Workspace: ${workspace.name}`);
  console.log(`  Users: ${user.email}, ${user2.email}`);
  console.log(`  Companies: ${hospitality.length}`);
  console.log(`  Leads: ${createdLeads.length}`);
  console.log(`  Lists: 2`);
  console.log(`  Sequences: 1`);
  console.log(`  Campaigns: 1`);
  console.log(`  Inbox threads: 1`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
