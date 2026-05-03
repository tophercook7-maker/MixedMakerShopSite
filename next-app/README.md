# MixedMakerShop Admin

Next.js App Router app with public marketing pages and a protected `/admin` area. Uses Supabase for auth and data.

## Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only; used for form API routes) |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run migrations in the Supabase SQL editor (Dashboard → SQL Editor), in order:
   - `supabase/migrations/20250101000000_initial_schema.sql`
   - Optionally `supabase/migrations/20250101000001_seed_data.sql` for sample data.
3. In Authentication → Providers, enable Email and set any redirect URLs (e.g. `http://localhost:3000/**`).
4. Create a user (Authentication → Users → Add user) for admin login.

## Run locally

```bash
cd next-app
npm install
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin (redirects to login if not signed in)
- Login: http://localhost:3000/auth/login

## Structure

- `app/(public)` — Public pages: /, /services, /portfolio, /contact, /free-website-check, /connect
- `app/admin` — Protected admin: dashboard, leads, clients, projects, tasks, payments, settings
- `app/auth` — Login at /auth/login
- `app/api/leads` — Shared lead endpoint for public forms, Captain Maker leads, and admin-created leads
- `components/admin` — Sidebar, tables, pipeline, modals
- `lib/supabase` — Server/client/middleware Supabase helpers
- `supabase/migrations` — SQL schema and RLS

## Forms

Contact, Free Website Check, Idea Lab, and quote forms POST to `/api/leads`. Public submissions save to `leads` and `form_submissions`, then the front end shows the shared on-screen confirmation message.
