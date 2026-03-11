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

## Netlify deploy

1. Connect the repo to Netlify and set the base directory to `next-app` (or the folder that contains `package.json` and `next.config.*`).
2. Build command: `npm run build` (or `npx next build`).
3. Publish directory: `.next` is not used as publish dir; use **Next.js** runtime so Netlify runs `next build` and serves via Netlify’s Next.js support.
4. In Netlify → Site settings → Environment variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. In Supabase → Authentication → URL configuration, set Site URL to your Netlify URL and add the Netlify deploy URL (e.g. `https://your-site.netlify.app`) to Redirect URLs for auth callbacks.

## Next upgrades after MVP

- **Profile edit** — Allow owner to update name/email in `/admin/settings`.
- **Email notifications** — Notify on new lead or form submission (e.g. Resend, SendGrid).
- **Quote request form** — Public page + API route for `/api/forms/quote` (route exists; add a `/quote` or `/request-quote` page if desired).
- **Connect success** — After “Contact Topher” or “Request a Website” from `/connect`, show a thank-you or redirect to contact success.
- **Filter by client on projects/payments** — Use `?client=uuid` on admin projects/payments to pre-filter (links from client detail already use this; ensure query is applied in the page).
- **Dashboard date range** — Filter “revenue this month” and “tasks due today” by custom range.
- **Export** — CSV export for leads, clients, or payments.
