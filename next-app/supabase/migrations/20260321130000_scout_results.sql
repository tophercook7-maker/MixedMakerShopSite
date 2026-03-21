-- Persistent Scout discovery queue (per owner). Separate from CRM leads until promoted.

create table if not exists public.scout_results (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dedupe_key text not null,
  source_type text not null
    check (source_type in ('google', 'facebook', 'mixed', 'manual', 'unknown')),
  source_url text,
  source_external_id text,
  business_name text not null,
  city text,
  state text,
  category text,
  website_url text,
  has_website boolean,
  facebook_url text,
  has_facebook boolean,
  phone text,
  has_phone boolean,
  opportunity_reason text,
  opportunity_rank integer not null default 0,
  raw_source_payload jsonb,
  scout_notes text,
  skipped boolean not null default false,
  added_to_leads boolean not null default false,
  linked_lead_id uuid references public.leads(id) on delete set null,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, dedupe_key)
);

create index if not exists idx_scout_results_owner on public.scout_results(owner_id);
create index if not exists idx_scout_results_owner_skipped on public.scout_results(owner_id, skipped);
create index if not exists idx_scout_results_owner_added on public.scout_results(owner_id, added_to_leads);
create index if not exists idx_scout_results_owner_source on public.scout_results(owner_id, source_type);
create index if not exists idx_scout_results_owner_has_website on public.scout_results(owner_id, has_website);
create index if not exists idx_scout_results_owner_has_facebook on public.scout_results(owner_id, has_facebook);
create index if not exists idx_scout_results_owner_has_phone on public.scout_results(owner_id, has_phone);
create index if not exists idx_scout_results_linked_lead on public.scout_results(linked_lead_id);

create or replace function public.touch_scout_results_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_scout_results_updated_at on public.scout_results;
create trigger trg_scout_results_updated_at
before update on public.scout_results
for each row
execute function public.touch_scout_results_updated_at();

alter table public.scout_results enable row level security;

drop policy if exists scout_results_owner_all on public.scout_results;
create policy scout_results_owner_all on public.scout_results
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

comment on table public.scout_results is 'Scout discovery queue; promote to leads via CRM, durable skip/saved state.';
