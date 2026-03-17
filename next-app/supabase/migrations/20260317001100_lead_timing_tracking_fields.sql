alter table public.leads
  add column if not exists replied_at timestamptz;

alter table public.leads
  add column if not exists contact_method text;

alter table public.leads
  add column if not exists category text;

alter table public.leads
  add column if not exists outreach_sent_at timestamptz;

create index if not exists idx_leads_outreach_reply_timing
  on public.leads(owner_id, outreach_sent_at desc, replied_at desc);
