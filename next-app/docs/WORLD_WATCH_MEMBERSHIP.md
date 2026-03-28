# World Watch membership (Stripe + Deep Well Weekly)

Deep Well Audio **World Watch** is **members-only** for full reflections. Access is enforced **on the server** via Supabase `member_entitlements` (Stripe webhooks) plus an optional signed **`dwa_mem`** cookie after checkout.

## Pricing

| Plan | Amount | Env |
| ---- | ------ | --- |
| Monthly | $9/mo | `STRIPE_PRICE_ID_MONTHLY` (required for checkout) |
| Yearly | $90/yr | `STRIPE_PRICE_ID_YEARLY` |

Yearly copy uses a restrained savings line: *Save the equivalent of two months.*

`lib/membership/pricing.ts` holds display constants aligned with Stripe Prices.

## Environment

### Stripe & site

| Variable | Purpose |
| -------- | ------- |
| `STRIPE_SECRET_KEY` | Checkout + portal |
| `STRIPE_WEBHOOK_SECRET` | Verify webhook signatures |
| `STRIPE_PRICE_ID_MONTHLY` | Monthly subscription price id |
| `STRIPE_PRICE_ID_YEARLY` | Yearly subscription price id |
| `NEXT_PUBLIC_SITE_URL` | Checkout `success_url` / `cancel_url` base |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional; Elements if used |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook, entitlements, weekly sends (service role) |
| `MEMBER_SESSION_SECRET` | Signs `dwa_mem` cookie (recommended) |

### Weekly email (Deep Well Weekly)

| Variable | Purpose |
| -------- | ------- |
| `RESEND_API_KEY` | Send digest |
| `RESEND_FROM_EMAIL` | From address (falls back to `BOOKING_FROM_EMAIL` if set) |
| `DEEP_WELL_WEEKLY_REPLY_TO` | Optional `Reply-To` |
| `DEEP_WELL_WEEKLY_AUTO` | Set `true` so Vercel cron can send when `MANUAL_ONLY_MODE` is on |
| `DEEP_WELL_WEEKLY_CRON_SECRET` | Optional; if set, must match cron request (see below) |
| `CRON_SECRET` | Vercel cron auth (`Authorization: Bearer …`); used if weekly secret unset |
| `DEEP_WELL_WEEKLY_SKIP_TIME_GUARD` | `1` = allow automated send outside Sun 7–9am Chicago (testing) |
| `OPENAI_API_KEY` | Optional; refines draft copy |
| `OPENAI_WEEKLY_EMAIL_MODEL` | Optional model id (default in `email-ai.ts`) |

## Database

- `supabase/migrations/20260327120000_member_entitlements.sql` — entitlements + RLS  
- `supabase/migrations/20260401120000_deep_well_weekly_email_and_plan_interval.sql` — `plan_interval` on entitlements; `deep_well_weekly_campaigns` + `deep_well_weekly_sends`

Campaign rows are keyed by `week_key` (Chicago calendar date of run) for **idempotent** weekly sends.

## Routes

| Route | Role |
| ----- | ---- |
| `/membership` | Pricing + **Start monthly** / **Choose annual** → Checkout |
| `POST /api/stripe/create-checkout-session` | `body: { interval: "month" \| "year" }` → subscription Checkout |
| `POST /api/stripe/webhook` | Subscriptions + existing print handlers |
| `POST /api/stripe/customer-portal` | Billing portal |
| `GET /account/claim?session_id=` | Verify Checkout; set cookie → `/account/success` |
| `/account/success` | Calm confirmation |
| `/account` | Status, plan, renewal, manage billing |
| `/world-watch` | Teaser vs full from `isActiveMember()` |
| `GET/POST /api/cron/deep-well-weekly` | Weekly pipeline (cron + manual) |
| `GET /api/admin/deep-well-weekly-preview` | Logged-in user: JSON or `?format=html` preview (no send) |

## Membership check

`lib/auth/isActiveMember.ts` → `getMemberEntitlementForRequest()`:

1. Service-role lookup by `user_id`, then `email`, then cookie `stripe_customer_id`.  
2. `isEntitlementActive()` requires `active` or `trialing` and future `current_period_end` when present.

Do **not** trust client-only flags.

## Paywall behavior

Non-members see hero + teaser cards + partial summaries; full reflections and scripture blocks are omitted. A soft **Member access** invitation (`member-invitation-banner`) sits in the flow with the specified copy.

## Checkout plan selection

Client sends `{ interval: "month" | "year" }` to `create-checkout-session`. Server maps to `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_YEARLY`. Metadata includes `plan_interval`. Webhook sync (`lib/stripe/sync-member-entitlement.ts`) stores `plan_interval` on `member_entitlements`.

Success: `/account/claim` → cookie → `/account/success`.  
Cancel: back to `/membership` (or as implemented in API).

## Deep Well Weekly (automation)

1. **Window:** Sunday **7:00–9:00** America/Chicago for automatic sends (unless `DEEP_WELL_WEEKLY_SKIP_TIME_GUARD=1` or `manual` / `dry_run`).  
2. **Vercel:** `vercel.json` runs `0 13 * * 0` UTC (approx. 7am CST; **DST note:** verify offset when clocks change, or adjust schedule seasonally).  
3. **Auth:** If `DEEP_WELL_WEEKLY_CRON_SECRET` or `CRON_SECRET` is set, requests must send the same value via `Authorization: Bearer …` or `x-cron-secret`. If **no** secret is configured, the route accepts calls (fine for local only).  
4. **MANUAL_ONLY_MODE:** Default `true`. Cron returns 403 unless `DEEP_WELL_WEEKLY_AUTO=true` or manual trigger (`x-manual-trigger`, `manual_trigger`, `?manual=1`).  
5. **Dry run:** `GET .../api/cron/deep-well-weekly?dry_run=1` returns JSON **without** time-window block (preview anytime).  
6. **Idempotency:** If `deep_well_weekly_campaigns.status === 'sent'` for `week_key`, skip.  
7. **Pipeline:** `lib/worldWatch/email-pipeline.ts` → selection (`email-select.ts`), optional AI (`email-ai.ts`), HTML + text (`email-render.ts`). Recipients: `lib/membership/active-subscribers.ts` (active entitlements + email).

## Local testing

### Membership

1. `stripe listen --forward-to localhost:3000/api/stripe/webhook` → set `STRIPE_WEBHOOK_SECRET`.  
2. Dashboard Prices → `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_YEARLY`.  
3. `/membership` → complete Checkout (`4242…`).  
4. After webhook, `/world-watch` shows full content; `/account` shows plan.

### Weekly email

- Preview JSON: `curl -H "Cookie: …" http://localhost:3000/api/admin/deep-well-weekly-preview`  
- HTML: `…/api/admin/deep-well-weekly-preview?format=html` (logged in).  
- Cron dry run: `curl "http://localhost:3000/api/cron/deep-well-weekly?dry_run=1"`  
- Full send (local): set `DEEP_WELL_WEEKLY_SKIP_TIME_GUARD=1`, `RESEND_*`, `DEEP_WELL_WEEKLY_AUTO=true` (or `MANUAL_ONLY_MODE=false`), and call with `?manual=1` or manual trigger header; ensure active members exist in DB.

### Duplicate protection

Repeat GET for the same `week_key` after `status=sent` → `already_sent`.

## Dashboard webhook events

Enable at minimum:

- `checkout.session.completed`  
- `customer.subscription.created`  
- `customer.subscription.updated`  
- `customer.subscription.deleted`  
- `invoice.payment_succeeded`  
- `invoice.payment_failed`
