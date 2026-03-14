-- Lead contact tracking + follow-up workflow + outreach email event log.
-- Additive and safe for staged rollout.

-- Normalize legacy lead statuses into the new workflow vocabulary.
update public.leads
set status = case status
  when 'interested' then 'replied'
  when 'proposal_sent' then 'contacted'
  when 'won' then 'closed_won'
  when 'lost' then 'closed_lost'
  else status
end
where status in ('interested', 'proposal_sent', 'won', 'lost');

-- Expand lead status check.
alter table public.leads
  drop constraint if exists leads_status_check;

alter table public.leads
  add constraint leads_status_check
  check (status in (
    'new',
    'contacted',
    'follow_up_due',
    'replied',
    'closed_won',
    'closed_lost',
    'do_not_contact'
  ));

-- Contact workflow fields.
alter table public.leads
  add column if not exists last_contacted_at timestamptz;

alter table public.leads
  add column if not exists next_follow_up_at timestamptz;

alter table public.leads
  add column if not exists follow_up_count integer not null default 0;

create index if not exists idx_leads_follow_up_due
  on public.leads(status, next_follow_up_at);

create index if not exists idx_leads_last_contacted_at
  on public.leads(last_contacted_at desc);

-- Outreach email events log.
create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id text,
  lead_id uuid references public.leads(id) on delete set null,
  case_id uuid,
  recipient_email text not null,
  subject text not null,
  body text not null,
  message_type text not null,
  send_status text not null check (send_status in ('sent', 'failed')),
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

alter table public.email_events enable row level security;

drop policy if exists email_events_all on public.email_events;
create policy email_events_all
  on public.email_events
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index if not exists idx_email_events_owner_created
  on public.email_events(owner_id, created_at desc);

create index if not exists idx_email_events_lead
  on public.email_events(lead_id, created_at desc);
