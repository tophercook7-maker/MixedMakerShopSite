-- Shareable lead website mockups (sales previews, not production sites).
--
-- If you see: relation "public.crm_mockups" does not exist
-- → Run SECTION A alone first and confirm it succeeds, then run SECTION B.
-- → If SECTION A fails on foreign keys, your public.leads or auth.users must exist first.

-- ========== SECTION A — table only (run this first) ==========

create table if not exists public.crm_mockups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  template_key text not null default 'generic-local',
  business_name text not null default '',
  city text,
  category text,
  phone text,
  email text,
  facebook_url text,
  headline text not null default '',
  subheadline text not null default '',
  cta_text text not null default 'Call Now',
  mockup_slug text not null,
  mockup_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_mockups_mockup_slug_key unique (mockup_slug),
  constraint crm_mockups_lead_owner_key unique (lead_id, owner_id)
);

create index if not exists idx_crm_mockups_owner_updated
  on public.crm_mockups(owner_id, updated_at desc);

comment on table public.crm_mockups is 'CRM: personalized website preview per lead; public access via slug RPC only.';

-- ========== SECTION B — after SECTION A succeeds ==========

-- One-line body avoids unclosed $$ if the script is truncated when pasted.
create or replace function public.touch_crm_mockups_updated_at()
returns trigger
language plpgsql
as 'begin NEW.updated_at := now(); return NEW; end;';

drop trigger if exists trg_crm_mockups_updated_at on public.crm_mockups;
create trigger trg_crm_mockups_updated_at
  before update on public.crm_mockups
  for each row execute procedure public.touch_crm_mockups_updated_at();

alter table public.crm_mockups enable row level security;

drop policy if exists crm_mockups_owner_all on public.crm_mockups;
create policy crm_mockups_owner_all on public.crm_mockups
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- SQL-standard body (PostgreSQL 14+).
create or replace function public.get_public_crm_mockup_by_slug(p_slug text)
returns table (
  id uuid,
  template_key text,
  business_name text,
  city text,
  category text,
  phone text,
  email text,
  facebook_url text,
  headline text,
  subheadline text,
  cta_text text,
  mockup_slug text,
  raw_payload jsonb
)
language sql
security definer
set search_path = public
stable
begin atomic
  select
    m.id,
    m.template_key,
    m.business_name,
    m.city,
    m.category,
    m.phone,
    m.email,
    m.facebook_url,
    m.headline,
    m.subheadline,
    m.cta_text,
    m.mockup_slug,
    m.raw_payload
  from public.crm_mockups m
  where m.mockup_slug = nullif(trim(p_slug), '')
  limit 1;
end;

grant execute on function public.get_public_crm_mockup_by_slug(text) to anon, authenticated;
