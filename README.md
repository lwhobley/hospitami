# Hospitami AI

AI-powered sales outreach platform for the hospitality industry. Discover restaurants, hotels, event venues, and catering companies, then engage them with personalized multi-step email campaigns.

## Features

- **AI Lead Discovery** - Natural language search powered by Google Gemini to find hospitality businesses
- **Lead Management** - Organize prospects into lists with scoring, tagging, and filtering
- **Sequence Builder** - Multi-step outreach templates with email and wait steps
- **Campaign Engine** - Launch targeted campaigns against lead lists with tracking
- **AI Copywriting** - Kimi-powered personalized email generation and follow-ups
- **Unified Inbox** - Manage all replies in one place with AI-suggested responses
- **Sender Management** - Multiple sender accounts with domain verification
- **Analytics** - Track open rates, click rates, reply rates, and campaign performance

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **TypeScript** in strict mode
- **Tailwind CSS v4** with shadcn/ui components
- **PostgreSQL** via Supabase
- **Prisma 7.9** ORM with `@prisma/adapter-pg`
- **Supabase Auth** with SSR helpers
- **Google Gemini** for AI search and enrichment
- **Kimi (Moonshot)** for outreach copy generation
- **React Query** for client-side data fetching

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase recommended)
- API keys for Gemini and Kimi

### Setup

1. Install dependencies:

```bash
cd hospitami
npm install
```

2. Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GEMINI_API_KEY` - Google Gemini API key
- `KIMI_API_KEY` - Moonshot Kimi API key

3. Generate the Prisma client:

```bash
npx prisma generate
```

4. Run database migrations:

```bash
npx prisma db push
```

5. (Optional) Seed the database with sample data:

```bash
npx tsx prisma/seed.ts
```

6. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
  components/    # UI components (shadcn/ui + custom)
  lib/           # Core libraries (AI, sources, auth, database)
  generated/     # Prisma generated client
  hooks/         # React hooks
prisma/
  schema.prisma  # Database schema
  seed.ts        # Seed data script
```

See [architecture.md](./architecture.md) for detailed architecture documentation and [todo.md](./todo.md) for the development roadmap.
