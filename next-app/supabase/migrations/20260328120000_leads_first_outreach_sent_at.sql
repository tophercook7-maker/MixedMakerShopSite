-- First outreach timestamp (distinct from generic outreach_sent_at when needed)
alter table public.leads add column if not exists first_outreach_sent_at timestamptz;

comment on column public.leads.first_outreach_sent_at is 'When the first outbound message was logged as sent';

create index if not exists idx_leads_owner_first_outreach_sent
  on public.leads(owner_id, first_outreach_sent_at desc nulls last);
