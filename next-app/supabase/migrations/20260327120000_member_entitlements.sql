-- Deep Well Audio / World Watch: Stripe subscription entitlements (webhook-maintained).

create table if not exists public.member_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text,
  stripe_customer_id text not null unique,
  stripe_subscription_id text,
  subscription_status text not null default 'none',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_entitlements_user_id_idx
  on public.member_entitlements (user_id);

create index if not exists member_entitlements_email_lower_idx
  on public.member_entitlements (lower(email));

comment on table public.member_entitlements is 'World Watch membership; updated from Stripe webhooks. Do not trust client-reported status.';

alter table public.member_entitlements enable row level security;

drop policy if exists "member_entitlements_select_own" on public.member_entitlements;
create policy "member_entitlements_select_own"
  on public.member_entitlements
  for select
  using (user_id is not null and auth.uid() = user_id);
