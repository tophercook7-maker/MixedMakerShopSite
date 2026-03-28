-- World Watch: billing plan label + Deep Well Weekly email campaigns.

alter table public.member_entitlements
  add column if not exists plan_interval text check (plan_interval is null or plan_interval in ('month', 'year'));

comment on column public.member_entitlements.plan_interval is 'Stripe subscription recurring interval (month/year); webhook-maintained.';

create table if not exists public.deep_well_weekly_campaigns (
  id uuid primary key default gen_random_uuid(),
  week_key text not null unique,
  week_start timestamptz not null,
  week_end timestamptz not null,
  subject text not null,
  preview_text text,
  html_body text not null,
  text_body text not null,
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'failed')),
  recipient_count int,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deep_well_weekly_campaigns_week_end_idx
  on public.deep_well_weekly_campaigns (week_end desc);

comment on table public.deep_well_weekly_campaigns is 'Deep Well Weekly member digest; idempotent via week_key (Chicago calendar Sunday of send).';

create table if not exists public.deep_well_weekly_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.deep_well_weekly_campaigns (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists deep_well_weekly_sends_campaign_id_idx
  on public.deep_well_weekly_sends (campaign_id);

create index if not exists deep_well_weekly_sends_email_idx
  on public.deep_well_weekly_sends (lower(email));

alter table public.deep_well_weekly_campaigns enable row level security;
alter table public.deep_well_weekly_sends enable row level security;
