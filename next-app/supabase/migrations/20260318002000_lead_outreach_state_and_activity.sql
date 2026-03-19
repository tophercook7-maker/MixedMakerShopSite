-- Outreach send tracking, channel flags, and per-lead activity timeline.

alter table public.leads
  add column if not exists last_outreach_channel text;

alter table public.leads
  add column if not exists last_outreach_status text;

update public.leads set last_outreach_status = 'draft' where last_outreach_status is null;

alter table public.leads
  alter column last_outreach_status set default 'draft';

alter table public.leads
  alter column last_outreach_status set not null;

alter table public.leads
  drop constraint if exists leads_last_outreach_channel_check;

alter table public.leads
  add constraint leads_last_outreach_channel_check
  check (last_outreach_channel is null or last_outreach_channel in ('email', 'facebook', 'text'));

alter table public.leads
  drop constraint if exists leads_last_outreach_status_check;

alter table public.leads
  add constraint leads_last_outreach_status_check
  check (last_outreach_status in ('draft', 'sending', 'sent', 'failed'));

alter table public.leads
  add column if not exists last_outreach_sent_at timestamptz;

alter table public.leads
  add column if not exists preview_sent boolean not null default false;

alter table public.leads
  add column if not exists email_sent boolean not null default false;

alter table public.leads
  add column if not exists facebook_sent boolean not null default false;

alter table public.leads
  add column if not exists text_sent boolean not null default false;

create index if not exists idx_leads_last_outreach_status
  on public.leads(owner_id, last_outreach_status, last_outreach_sent_at desc nulls last);

create index if not exists idx_leads_outreach_flags
  on public.leads(owner_id, email_sent, facebook_sent, text_sent);

-- Backfill from legacy outreach_sent
update public.leads
set
  email_sent = true,
  last_outreach_channel = coalesce(last_outreach_channel, 'email'),
  last_outreach_status = case
    when last_outreach_status = 'draft' then 'sent'
    else last_outreach_status
  end,
  last_outreach_sent_at = coalesce(last_outreach_sent_at, outreach_sent_at, last_contacted_at)
where outreach_sent is true
  and email_sent is false;

-- Activity log (append-only)
create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_activities_lead_created
  on public.lead_activities(lead_id, created_at desc);

create index if not exists idx_lead_activities_owner_created
  on public.lead_activities(owner_id, created_at desc);

alter table public.lead_activities enable row level security;

drop policy if exists lead_activities_owner on public.lead_activities;
create policy lead_activities_owner
  on public.lead_activities
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
