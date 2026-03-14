-- Morning Intake Pipeline fields for Scout-Brain -> CRM lead mapping.
-- Additive migration only; safe to run multiple times.

alter table public.leads
  add column if not exists workspace_id text;

alter table public.leads
  add column if not exists linked_opportunity_id uuid;

alter table public.leads
  add column if not exists address text;

alter table public.leads
  add column if not exists place_id text;

alter table public.leads
  add column if not exists best_contact_method text;

alter table public.leads
  add column if not exists opportunity_score numeric;

alter table public.leads
  add column if not exists auto_intake boolean not null default false;

create index if not exists idx_leads_source_created
  on public.leads(lead_source, created_at desc);

create index if not exists idx_leads_owner_place
  on public.leads(owner_id, place_id);

create index if not exists idx_leads_owner_linked_opp
  on public.leads(owner_id, linked_opportunity_id);

create index if not exists idx_leads_owner_website
  on public.leads(owner_id, lower(coalesce(website, '')));

create index if not exists idx_leads_owner_phone
  on public.leads(owner_id, phone);

create index if not exists idx_leads_owner_name_address
  on public.leads(owner_id, lower(coalesce(business_name, '')), lower(coalesce(address, '')));
