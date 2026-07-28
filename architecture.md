# Hospitami AI - Architecture

## Overview

Hospitami AI is a B2B SaaS platform for AI-powered hospitality sales outreach. It enables sales teams to discover, qualify, and engage hospitality businesses (restaurants, hotels, event venues, catering companies) through automated multi-step email campaigns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.12 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (base-ui-react primitives) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7.9.1 with `@prisma/adapter-pg` driver |
| Auth | Supabase Auth with SSR (`@supabase/ssr`) |
| AI - Search/Enrichment | Google Gemini API |
| AI - Outreach Copy | Kimi (Moonshot) API |
| Email Delivery | Resend |
| Client State | React Query (TanStack Query) |
| Analytics | PostHog |

## Directory Structure

```
hospitami/
  prisma/
    schema.prisma          # 25+ models, enums, relations
    seed.ts                # Development seed data
  prisma.config.ts         # Prisma datasource config
  src/
    app/
      (auth)/
        login/page.tsx     # Auth flow
      (dashboard)/
        layout.tsx         # Sidebar + providers wrapper
        dashboard/         # Overview with stats + quick actions
        finder/            # AI-powered lead discovery
        lists/             # Lead list management
        lists/[id]/        # List detail with lead table
        sequences/         # Multi-step outreach templates
        campaigns/         # Campaign management
        campaigns/[id]/    # Campaign detail + leads
        inbox/             # Unified reply inbox
        senders/           # Sender account management
        analytics/         # Performance dashboards
        settings/          # Workspace settings
        settings/integrations/  # Third-party connections
      api/
        finder/route.ts    # AI search endpoint
        leads/route.ts     # Lead CRUD
        lists/route.ts     # List CRUD
        campaigns/route.ts # Campaign CRUD
        sequences/route.ts # Sequence CRUD
        inbox/route.ts     # Inbox messages
    components/
      layout/
        app-sidebar.tsx    # Navigation sidebar
        page-header.tsx    # Page header with breadcrumbs
      providers.tsx        # QueryClient + UI providers
      ui/                  # shadcn/ui components
    generated/
      prisma/              # Prisma generated client
    hooks/
      use-mobile.ts        # Responsive hook
    lib/
      ai/
        gemini.ts          # Gemini adapter (search, enrich, qualify)
        kimi.ts            # Kimi adapter (outreach, follow-up, reply)
      sources/
        types.ts           # SourceAdapter interface
        gemini-adapter.ts  # AI-based lead discovery
        csv-adapter.ts     # CSV import adapter
        registry.ts        # Adapter registry
      supabase/
        client.ts          # Browser Supabase client
        server.ts          # Server Supabase client
        middleware.ts       # Auth session middleware
      prisma.ts            # Prisma singleton
      utils.ts             # Utility functions
    middleware.ts           # Next.js auth middleware
```

## Database Schema

### Core Entities

- **Organization** - Top-level account (company/agency)
- **Workspace** - Isolated environment within an org
- **User / WorkspaceMember** - Users with role-based access (ADMIN, MANAGER, REP)

### Lead Management

- **Company** - Business entity (restaurant, hotel, venue, etc.)
- **Contact** - Individual at a company
- **Lead** - Qualified prospect linking company + contact + workspace
- **LeadSource** - Tracks origin of each lead (AI discovery, CSV, manual)
- **LeadList / ListMember** - Organize leads into lists
- **Tag / TagAssignment** - Flexible tagging system
- **Note** - Free-form notes on leads

### Outreach

- **Sequence** - Multi-step outreach template
- **SequenceStep** - Individual step (email, wait, condition)
- **MessageTemplate** - Reusable email templates with variables
- **Campaign** - Running instance of a sequence against a lead list
- **CampaignLead** - Individual lead's progress through a campaign

### Communication

- **SenderAccount** - Email accounts for sending
- **SenderDomain** - Verified sending domains
- **InboxThread / InboxMessage** - Unified inbox for replies

### AI & Jobs

- **AiRun** - Log of every AI API call (provider, tokens, duration)
- **SearchJob** - Background search job tracking
- **EnrichmentJob** - Background enrichment job tracking
- **SavedSearch** - Saved AI search prompts

### Analytics & Audit

- **AnalyticsEvent** - Granular event tracking
- **Activity** - User activity log
- **AuditLog** - Security audit trail

## AI Architecture

### Provider Adapter Pattern

```
SourceAdapter interface
  search(params) -> DiscoveredLead[]
  enrich?(lead) -> EnrichedData

Implementations:
  gemini-adapter  -> Google Gemini API
  csv-adapter     -> CSV file parsing
  (extensible)    -> ZoomInfo, Google Maps, etc.
```

### AI Providers

1. **Gemini** (Google) - Lead discovery, enrichment, qualification scoring
   - Natural language search queries
   - Structured JSON output for lead data
   - Hospitality-specific knowledge

2. **Kimi** (Moonshot) - Outreach content generation
   - Personalized initial emails
   - Context-aware follow-ups
   - Reply drafts based on thread context

### Search Flow

```
User prompt -> SearchJob created -> Gemini API call -> AiRun logged
  -> Leads parsed -> Company/Contact/Lead records created
  -> Results returned to UI
```

## Authentication

- Supabase Auth with email/password
- Server-side session management via `@supabase/ssr`
- Middleware checks auth on all dashboard routes
- Redirects to `/login` for unauthenticated requests

## Multi-Tenancy

- Workspace-scoped data isolation
- All queries filtered by `workspaceId`
- Role-based access: ADMIN (full), MANAGER (team), REP (own data)

## Key Design Decisions

1. **Driver adapter pattern for Prisma** - Prisma 7.x requires explicit driver adapters; using `@prisma/adapter-pg` for direct PostgreSQL connection
2. **base-ui-react primitives** - shadcn/ui uses `@base-ui/react` instead of Radix; composition via `render` prop instead of `asChild`
3. **Server + Client components** - Server components for data fetching, client components for interactivity
4. **Sample data in pages** - UI pages include realistic sample data for development; to be replaced with API calls
5. **Extensible source registry** - New lead sources can be added by implementing the `SourceAdapter` interface
