# CRM simple machine — E2E checklist

Run migration `20260321000000_leads_canonical_simple_crm.sql` on Supabase before relying on new columns/statuses.

## Apply SQL from the CLI

From the **`next-app`** directory.

### Option A — `psql` + `DATABASE_URL` (any Postgres, including Supabase)

1. Copy the **URI** from Supabase → **Project Settings** → **Database** (use **Session mode** pooler or direct connection as you prefer).
2. Export it and run the npm script:

```bash
cd next-app
export DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres'

# CRM canonical migration only:
npm run db:migrate:crm-canonical

# Or any file:
npm run db:apply-sql -- supabase/migrations/SOME_FILE.sql
```

Requires **`psql`** on your PATH (macOS: `brew install libpq && brew link --force libpq`).

### Option B — Supabase CLI (all pending migrations)

```bash
cd next-app
brew install supabase/tap/supabase   # once
supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

`db:push` applies every migration under `supabase/migrations/` that isn’t already recorded on the remote.

## Manual E2E flow

1. **Scout** — Find a priority-category business with no standalone website (or Facebook-only) and phone or email; save as lead.
2. **Save** — Lead row appears in `public.leads` with `scout_intake_reason` / notes; no fake local-only state for normal flow.
3. **New queue** — Open **Admin → Leads**; segment **New** shows `status = new`.
4. **Contact** — Click **Mark Contacted** or **Log message sent** (channel: facebook / email / text).
5. **Follow-up** — Lead is `contacted` with `next_follow_up_at` (+2 days). Segment **Follow-up due** lists contacted leads with a scheduled follow-up that is not completed.
6. **Badges** — `email_sent` / `facebook_sent` / `text_sent` and outreach timestamps update after log-outreach.
7. **Reply** — **Mark replied** → `status = replied`. Segment **Replies waiting** shows them.
8. **Close** — **Won** or **Archive** → leaves active segments.
9. **Dedupe** — Scout/API create again with same name / phone / email / website / Facebook URL → duplicate skipped, not re-inserted.

## API reference

- `POST /api/leads` — Whitelisted insert; canonical statuses only after migration.
- `PATCH /api/leads/[id]` — Whitelisted patch; `status` canonicalized.
- `POST /api/leads/[id]/log-outreach` — Body `{ channel, note?, sent_at? }` — sets channel flag, `last_outreach_*`, `contacted`, follow-up +2d.

## Canonical statuses

`new`, `contacted`, `replied`, `no_response`, `not_interested`, `won`, `archived`

## Dedupe

Normalized match on owner + any of: email, phone, business name, website URL, Facebook URL.
