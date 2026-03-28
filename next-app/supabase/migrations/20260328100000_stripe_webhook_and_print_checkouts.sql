-- Idempotent Stripe webhook processing + audit trail for 3D print Checkouts.

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_created_at_idx
  on public.stripe_webhook_events (created_at desc);

comment on table public.stripe_webhook_events is 'Stores processed Stripe event IDs so webhook handlers are idempotent.';

create table if not exists public.stripe_print_checkouts (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  lead_id uuid references public.leads (id) on delete set null,
  owner_id uuid,
  customer_email text,
  amount_total_cents int,
  currency text not null default 'usd',
  status text not null default 'completed',
  checkout_for text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_print_checkouts_lead_id_idx
  on public.stripe_print_checkouts (lead_id);

create index if not exists stripe_print_checkouts_created_at_idx
  on public.stripe_print_checkouts (created_at desc);

comment on table public.stripe_print_checkouts is 'Successful Stripe Checkout Sessions for print leads; written from webhook, not from success page.';

alter table public.stripe_webhook_events enable row level security;
alter table public.stripe_print_checkouts enable row level security;
