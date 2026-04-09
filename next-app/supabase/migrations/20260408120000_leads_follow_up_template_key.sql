-- Lightweight follow-up + deal tracking for CRM cadence

alter table public.leads
  add column if not exists last_follow_up_template_key text,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists lead_status text default 'new';

-- Index for follow-up scheduling
create index if not exists idx_leads_owner_next_follow_up_at
  on public.leads(owner_id, next_follow_up_at asc nulls last)
  where next_follow_up_at is not null;

-- Optional: index for status filtering in admin
create index if not exists idx_leads_status
  on public.leads(lead_status);
