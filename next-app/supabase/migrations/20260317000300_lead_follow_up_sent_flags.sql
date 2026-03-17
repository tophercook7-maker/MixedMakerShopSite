alter table public.leads
  add column if not exists follow_up_1_sent boolean not null default false;

alter table public.leads
  add column if not exists follow_up_2_sent boolean not null default false;

alter table public.leads
  add column if not exists follow_up_3_sent boolean not null default false;

create index if not exists idx_leads_follow_up_sent_flags
  on public.leads(owner_id, outreach_sent, follow_up_1_sent, follow_up_2_sent, follow_up_3_sent);
