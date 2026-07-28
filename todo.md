# Hospitami AI - TODO

## Completed

- [x] Project scaffolding with Next.js 16, TypeScript, Tailwind v4
- [x] Prisma schema with 25+ models (organizations, workspaces, leads, campaigns, sequences, inbox, AI runs)
- [x] Supabase Auth integration (server + client + middleware)
- [x] Prisma client singleton with `@prisma/adapter-pg` driver
- [x] Gemini AI adapter (search, enrich, qualify)
- [x] Kimi AI adapter (outreach, follow-up, reply generation)
- [x] Source adapter pattern with registry (Gemini, CSV)
- [x] App sidebar with navigation groups
- [x] Dashboard page with stats, recent leads, campaign performance, quick actions
- [x] AI Finder page with prompt input, search results, expandable rows, filters
- [x] Lead Lists page with search, create dialog, list cards
- [x] List Detail page with lead table, bulk selection, filters
- [x] Sequences page with step visualizer, create dialog
- [x] Campaigns page with tab filters, status badges, metrics
- [x] Campaign Detail page with stats, lead progress table
- [x] Inbox page with thread list and message view
- [x] Senders page with account management and domain verification
- [x] Analytics page with metric cards, charts placeholder, date range selector
- [x] Settings page with workspace, team, billing, integrations navigation
- [x] Integrations page with connected services
- [x] Login page with Supabase auth
- [x] API routes (finder, leads, lists, campaigns, sequences, inbox)
- [x] Seed script with sample data
- [x] Environment template (.env.example)
- [x] Clean build passing

## Phase 2 - API Integration

- [ ] Wire dashboard stats to real API data
- [ ] Connect Finder page to `/api/finder` endpoint
- [ ] Wire lead lists to `/api/lists` CRUD
- [ ] Connect sequences to `/api/sequences` CRUD
- [ ] Wire campaigns to `/api/campaigns` CRUD
- [ ] Connect inbox to `/api/inbox` with real-time updates
- [ ] Add React Query hooks for all data fetching
- [ ] Implement optimistic updates for mutations

## Phase 3 - Email Infrastructure

- [x] SMTP outbound email delivery integration (Nodemailer)
- [x] IMAP inbound email reply sync integration (ImapFlow)
- [ ] Sender account verification flow (SPF, DKIM, DMARC)
- [ ] Email sending queue with rate limiting
- [ ] Open/click tracking pixel implementation
- [ ] Bounce and complaint handling
- [ ] Unsubscribe link management

## Phase 4 - Campaign Engine

- [ ] Campaign launch flow (select list + sequence + sender)
- [ ] Sequence step execution engine
- [ ] Wait step scheduling (Trigger.dev or cron)
- [ ] Reply detection and campaign pause
- [ ] A/B testing for subject lines
- [ ] Campaign throttling and daily limits

## Phase 5 - AI Enhancements

- [ ] Real-time AI search with streaming responses
- [ ] Lead enrichment pipeline (multi-source)
- [ ] AI qualification scoring model
- [ ] Personalization variable extraction from lead data
- [ ] AI-generated subject line variants
- [ ] Reply sentiment analysis for inbox prioritization

## Phase 6 - Analytics & Reporting

- [ ] PostHog integration for product analytics
- [ ] Campaign performance charts (open rate, reply rate over time)
- [ ] Lead funnel visualization
- [ ] Sender reputation monitoring
- [ ] Export reports to CSV/PDF
- [ ] Scheduled email reports

## Phase 7 - Production Hardening

- [ ] Rate limiting on all API routes
- [ ] Input validation with Zod on API endpoints
- [ ] CSRF protection
- [ ] Workspace-scoped data access enforcement
- [ ] Audit logging for sensitive operations
- [ ] Error monitoring (Sentry or similar)
- [ ] Database connection pooling
- [ ] Caching layer for frequently accessed data
- [ ] Migrate from deprecated Next.js middleware to proxy convention

## Future Enhancements

- [ ] ZoomInfo data enrichment adapter
- [ ] Google Maps business data adapter
- [ ] LinkedIn integration for contact discovery
- [ ] Calendar integration for meeting scheduling
- [ ] CRM sync (HubSpot, Salesforce)
- [ ] Team collaboration (shared inboxes, assignments)
- [ ] Custom domain support for tracking
- [ ] Webhook notifications for campaign events
- [ ] Mobile-responsive inbox view
- [ ] Bulk import/export improvements
