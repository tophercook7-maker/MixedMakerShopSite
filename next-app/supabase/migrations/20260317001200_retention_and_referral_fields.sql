alter table public.leads
  add column if not exists is_recurring_client boolean not null default false;

alter table public.leads
  add column if not exists monthly_value numeric;

alter table public.leads
  add column if not exists subscription_started_at timestamptz;

alter table public.leads
  add column if not exists referred_by text;

alter table public.leads
  add column if not exists referral_source text;

alter table public.leads
  add column if not exists is_referred_client boolean not null default false;

create index if not exists idx_leads_recurring_clients
  on public.leads(owner_id, is_recurring_client, subscription_started_at desc);

create index if not exists idx_leads_referrals
  on public.leads(owner_id, referred_by, referral_source);
