alter table public.leads
  add column if not exists sequence_step integer not null default 0;

alter table public.leads
  add column if not exists sequence_active boolean not null default false;

create index if not exists idx_leads_sequence_due
  on public.leads(sequence_active, next_follow_up_at);
