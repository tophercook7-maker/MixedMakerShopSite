-- Canonical simple CRM: missing lead columns, status vocabulary, no follow_up_due as a status.

-- Columns the app expects but were never migrated (fixes silent insert/select failures).
alter table public.leads add column if not exists facebook_url text;
alter table public.leads add column if not exists has_website boolean;
alter table public.leads add column if not exists why_this_lead_is_here text;
alter table public.leads add column if not exists visual_business boolean not null default false;
alter table public.leads add column if not exists scout_intake_reason text;
alter table public.leads add column if not exists normalized_facebook_url text;
alter table public.leads add column if not exists normalized_website text;
alter table public.leads add column if not exists reply_note text;

-- Backfill has_website from website field
update public.leads
set has_website = (coalesce(trim(website), '') <> '')
where has_website is null;

alter table public.leads alter column has_website set default false;

update public.leads
set has_website = coalesce(has_website, false)
where has_website is null;

-- Drop old status check *before* writing new vocabulary values (e.g. archived, won).
alter table public.leads drop constraint if exists leads_status_check;

-- Normalize legacy statuses into the simple machine vocabulary
update public.leads set status = 'contacted' where status = 'follow_up_due';
update public.leads set status = 'won' where status = 'closed_won';
update public.leads set status = 'archived' where status in ('closed', 'research_later');
update public.leads set status = 'not_interested' where status = 'do_not_contact';
update public.leads set status = 'no_response' where status = 'closed_lost';

-- Any unknown values fall back to new (should be rare)
update public.leads
set status = 'new'
where status not in (
  'new',
  'contacted',
  'replied',
  'no_response',
  'not_interested',
  'won',
  'archived'
);

alter table public.leads
  add constraint leads_status_check
  check (status in (
    'new',
    'contacted',
    'replied',
    'no_response',
    'not_interested',
    'won',
    'archived'
  ));

create index if not exists idx_leads_owner_normalized_fb
  on public.leads(owner_id, normalized_facebook_url)
  where normalized_facebook_url is not null;

create index if not exists idx_leads_owner_normalized_site
  on public.leads(owner_id, normalized_website)
  where normalized_website is not null;
