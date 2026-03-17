alter table public.leads
  add column if not exists outreach_sent boolean not null default false;

alter table public.leads
  add column if not exists outreach_sent_at timestamptz;

alter table public.leads
  add column if not exists preview_url text;

alter table public.leads
  add column if not exists follow_up_1 timestamptz;

alter table public.leads
  add column if not exists follow_up_2 timestamptz;

alter table public.leads
  add column if not exists follow_up_3 timestamptz;

create index if not exists idx_leads_preview_outreach_sent
  on public.leads(owner_id, outreach_sent, outreach_sent_at desc);
