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

-- Backfill from legacy outreach_sent (skip if older DB never had outreach_sent / outreach_sent_at)
do $guard$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'outreach_sent'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'outreach_sent_at'
  ) then
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
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'outreach_sent'
  ) then
    update public.leads
    set
      email_sent = true,
      last_outreach_channel = coalesce(last_outreach_channel, 'email'),
      last_outreach_status = case
        when last_outreach_status = 'draft' then 'sent'
        else last_outreach_status
      end,
      last_outreach_sent_at = coalesce(last_outreach_sent_at, last_contacted_at)
    where outreach_sent is true
      and email_sent is false;
  end if;
end
$guard$;

-- Activity log table: see migration 20260319003000_lead_activities_canonical.sql
