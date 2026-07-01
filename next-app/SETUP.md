# MixedMakerShop — Setup & Deploy

## Environment variables

Create `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- **NEXT_PUBLIC_SUPABASE_URL** — Project URL (Supabase dashboard → Settings → API).
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** — Anonymous (public) key for browser and server auth.
- **SUPABASE_SERVICE_ROLE_KEY** — Service role key (server-only). Used by form API routes to create leads from public form submissions. Never expose in the client.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migration(s) in order:
   - `supabase/migrations/20250128000000_schema_v2.sql`
3. In Authentication → Users, create your first user (email + password). This user becomes the “owner”; RLS limits data to this user.
4. The trigger in the migration creates a row in `profiles` when a user signs up. If you created the user manually, ensure a row exists in `profiles` with `id` = that user’s UUID (you can insert it manually if needed).
5. (Optional) Run `supabase/seed.sql` in the SQL Editor **after** at least one profile exists. Seed uses `(select id from public.profiles limit 1)` as `owner_id`.

## Local run

```bash
cd next-app
npm install
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (redirects to login if not authenticated)
- Login: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)

## Production deploy (Vercel)

**mixedmakershop.com runs on Vercel.** Netlify Forms notifications do **not** apply — form submissions hit Next.js API routes and email goes through **Resend**.

### Required Vercel environment variables

In Vercel → Project → Settings → Environment Variables (Production):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (free preview, contact, print quotes, lead alerts)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=MixedMakerShop <notifications@yourdomain.com>
LEAD_NOTIFY_EMAIL=Topher@mixedmakershop.com
```

- **RESEND_API_KEY** — from [resend.com](https://resend.com). A historical typo `RESEND_AQPI_KEY` is also accepted as fallback.
- **RESEND_FROM_EMAIL** — must use a **verified domain** in Resend (not an unverified address).
- **LEAD_NOTIFY_EMAIL** — where you receive new lead / free-preview alerts.

### How free preview submissions work

| Step | What happens |
|------|----------------|
| User submits `/free-mockup` | `POST /api/public/website-mockup` |
| Data saved | Supabase `mockup_submissions`, `leads`, `crm_mockups` |
| Email to submitter | Resend confirmation (`sendMockupRequestConfirmationEmail`) |
| Email to you | Resend lead notification (`sendLeadNotificationEmail` → `LEAD_NOTIFY_EMAIL`) |

No `data-netlify` attributes — this is not Netlify Forms.

### Supabase auth URLs (Vercel)

In Supabase → Authentication → URL configuration, set Site URL to `https://mixedmakershop.com` and add your Vercel preview URLs to Redirect URLs if needed.

## Netlify deploy (legacy)

The repo still contains `netlify.toml` for an older deploy path. **Production is Vercel.** If you use Netlify for a preview branch only, copy the same environment variables there — Netlify Forms will still not power the Next.js funnel.

## Next upgrades after MVP

- **Profile edit** — Allow owner to update name/email in `/admin/settings`.
- **Quote request form** — Public page + API route for `/api/forms/quote` (route exists; add a `/quote` or `/request-quote` page if desired).
- **Connect success** — After “Contact Topher” or “Request a Website” from `/connect`, show a thank-you or redirect to contact success.
- **Filter by client on projects/payments** — Use `?client=uuid` on admin projects/payments to pre-filter (links from client detail already use this; ensure query is applied in the page).
- **Dashboard date range** — Filter “revenue this month” and “tasks due today” by custom range.
- **Export** — CSV export for leads, clients, or payments.
