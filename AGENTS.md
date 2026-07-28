# Hospitami AI - Independent Project Guidelines

This project is an independent B2B AI sales outreach platform for the hospitality industry.
It is built as a standalone Next.js 16 App Router application with Tailwind CSS v4, Prisma 7, PostgreSQL (Supabase), and Supabase Auth.

- **Stack**: Next.js 16, TypeScript (strict), Tailwind CSS v4, Prisma 7, Supabase Auth & PostgreSQL, Google Gemini API, Moonshot Kimi API, Nodemailer (SMTP), ImapFlow (IMAP).
- **Standalone Repository**: [lwhobley/hospitami](https://github.com/lwhobley/hospitami)
- **Zero External Monorepo Dependencies**: Do not reference `packages/api`, NestJS, Expo, or `venueflow-app`.

<!-- BEGIN:nextjs-agent-rules -->
# Next.js App Router Rules

Follow Next.js 16 App Router conventions. Place API routes in `src/app/api/` and UI components in `src/components/`.
<!-- END:nextjs-agent-rules -->
