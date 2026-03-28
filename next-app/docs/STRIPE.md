# Stripe (3D print leads)

Stripe is **optional**. The primary pay path for print jobs is **Cash App**. When enabled, admins collect card payments via **Stripe Checkout** (one-time `payment` mode) from a 3D print lead detail page.

## Architecture

| Piece | Location |
| ----- | -------- |
| Create Checkout Session | `POST /api/leads/[id]/stripe-checkout` (authenticated admin; uses `STRIPE_SECRET_KEY`) |
| Webhook | `POST /api/stripe/webhook` (raw body + `Stripe-Signature`; `STRIPE_WEBHOOK_SECRET`) |
| Fulfillment | `checkout.session.completed` → `lib/stripe/fulfill-print-checkout.ts` updates `leads` and upserts `stripe_print_checkouts` |
| Success URL | Confirmation UI only; **webhook + DB** are authoritative for fulfillment |
| Session display (optional) | `GET /api/stripe/session?session_id=` — same user as `metadata.owner_id` only |

## Required environment variables

| Variable | Where | Purpose |
| -------- | ----- | ------- |
| `STRIPE_SECRET_KEY` | Server only | Create Checkout Sessions |
| `STRIPE_WEBHOOK_SECRET` | Server only | Verify webhook signatures |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Webhook writes (`stripe_webhook_events`, `stripe_print_checkouts`, `leads`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Server + client | Already required for the app |
| `NEXT_PUBLIC_SITE_URL` | Server | Success/cancel URLs (Vercel: `VERCEL_URL` is used as fallback in code) |

Optional:

- `NEXT_PUBLIC_SHOW_STRIPE_PRINT_PAYMENTS=true` — shows **Pay deposit (Stripe)** / **Pay full balance (Stripe)** on the print lead Payments panel.

**Not** required for current Checkout Sessions: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (add only if you introduce Payment Element / client-side Stripe).

## Database

Apply migration: `supabase/migrations/20260328100000_stripe_webhook_and_print_checkouts.sql`

- `stripe_webhook_events` — idempotency (`stripe_event_id` unique)
- `stripe_print_checkouts` — audit row per completed checkout (unique `stripe_checkout_session_id`)

## Local development (test mode)

1. Add **test** keys to `.env.local`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_WEBHOOK_SECRET=` (from step 3, or a Dashboard test webhook secret if tunneling a public URL)
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - `NEXT_PUBLIC_SHOW_STRIPE_PRINT_PAYMENTS=true`
2. Run the app: `npm run dev`
3. In another terminal, forward events:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Use the printed **`whsec_...`** as `STRIPE_WEBHOOK_SECRET` locally.
4. Open a **saved** 3D print lead in admin, set quote/deposit/final amounts, click a Stripe pay button.

### Test cards

- Success: `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.
- Decline: `4000 0000 0000 0002` (generic decline).

### Trigger webhooks without Checkout

```bash
stripe trigger checkout.session.completed
```

For end-to-end tests, prefer real test Checkout completes so the session metadata (`lead_id`, `owner_id`, `checkout_for`) matches production behavior.

## Production

1. Use **live** keys: `sk_live_...`, live webhook signing secret.
2. In Stripe Dashboard → **Developers → Webhooks**, add endpoint:
   - URL: `https://<your-domain>/api/stripe/webhook`
   - Events: at minimum `checkout.session.completed`; optionally `payment_intent.succeeded`, `payment_intent.payment_failed` (logged; fulfillment is driven by `checkout.session.completed` for this product).
3. Set `STRIPE_WEBHOOK_SECRET` to that endpoint’s **signing secret**.
4. Ensure `NEXT_PUBLIC_SITE_URL` is the canonical HTTPS origin (so redirects return to the correct host).

## Switching test → live safely

- Rotate env vars on the host (Vercel/project settings): never commit secrets.
- Use a **separate** live webhook endpoint and secret from test.
- Run one real **small** live transaction before announcing.

## Assumptions

- **One-time payments** only (no subscriptions in this flow).
- **USD** line items computed server amounts from lead quote fields (`quoted_amount`, `deposit_amount`, `final_amount`, `price_charged`).
- Fulfillment sets `payment_method` to `stripe`, `payment_status` to `partially_paid` (deposit) or `paid` + `paid_at` (full).
