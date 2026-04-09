-- Lightweight follow-up template tracking for CRM cadence (manual-send assisted).
alter table public.leads add column if not exists last_follow_up_template_key text;

create index if not exists idx_leads_owner_next_follow_up_at
  on public.leads(owner_id, next_follow_up_at asc nulls last)
  where next_follow_up_at is not null;
