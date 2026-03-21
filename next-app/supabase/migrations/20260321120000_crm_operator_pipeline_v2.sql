-- Web design CRM: canonical pipeline stages, operator tables, website reviews.

-- ---------------------------------------------------------------------------
-- Lead status → 7-stage pipeline
-- ---------------------------------------------------------------------------
alter table public.leads drop constraint if exists leads_status_check;

update public.leads set status = 'lost' where status in ('no_response', 'not_interested', 'archived');

update public.leads
set status = 'contacted'
where status = 'follow_up_due';

update public.leads
set status = 'won'
where status in ('closed_won');

update public.leads
set status = 'lost'
where status in ('closed_lost', 'closed', 'do_not_contact', 'research_later');

-- Any stragglers
update public.leads
set status = 'new'
where status not in (
  'new',
  'contacted',
  'replied',
  'qualified',
  'proposal_sent',
  'won',
  'lost'
);

alter table public.leads
  add constraint leads_status_check
  check (status in (
    'new',
    'contacted',
    'replied',
    'qualified',
    'proposal_sent',
    'won',
    'lost'
  ));

-- ---------------------------------------------------------------------------
-- Lead columns (primary contact + tags + automation)
-- ---------------------------------------------------------------------------
alter table public.leads add column if not exists primary_contact_name text;
alter table public.leads add column if not exists lead_tags text[] not null default '{}';
alter table public.leads add column if not exists unread_reply_count integer not null default 0;
alter table public.leads add column if not exists automation_paused boolean not null default false;

update public.leads
set primary_contact_name = trim(contact_name)
where coalesce(nullif(trim(primary_contact_name), ''), '') = ''
  and contact_name is not null
  and trim(contact_name) <> '';

-- ---------------------------------------------------------------------------
-- Website reviews (one row per lead; extensible for multi-site later)
-- ---------------------------------------------------------------------------
create table if not exists public.website_reviews (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  website_url text,
  website_status text not null default 'unknown'
    check (website_status in ('none', 'live', 'broken', 'unknown')),
  website_grade text
    check (website_grade is null or website_grade in ('A', 'B', 'C', 'D', 'F')),
  mobile_friendly text not null default 'unknown'
    check (mobile_friendly in ('yes', 'no', 'unknown')),
  clear_cta text not null default 'unknown'
    check (clear_cta in ('yes', 'no', 'weak', 'unknown')),
  branding_quality text
    check (branding_quality is null or branding_quality in ('strong', 'average', 'weak')),
  website_notes text,
  reviewed_at timestamptz default now(),
  unique (lead_id)
);

create index if not exists idx_website_reviews_owner on public.website_reviews(owner_id);

-- ---------------------------------------------------------------------------
-- Proposals
-- ---------------------------------------------------------------------------
create table if not exists public.crm_proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  proposal_link text,
  proposal_amount numeric(12, 2),
  proposal_status text not null default 'draft'
    check (proposal_status in ('draft', 'sent', 'viewed', 'negotiating', 'accepted', 'declined')),
  proposal_sent_at timestamptz,
  proposal_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_proposals_owner on public.crm_proposals(owner_id);
create index if not exists idx_crm_proposals_lead on public.crm_proposals(lead_id);

-- ---------------------------------------------------------------------------
-- Automation / operator event log
-- ---------------------------------------------------------------------------
create table if not exists public.crm_automation_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_automation_events_owner_created
  on public.crm_automation_events(owner_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.website_reviews enable row level security;
alter table public.crm_proposals enable row level security;
alter table public.crm_automation_events enable row level security;

drop policy if exists "website_reviews_owner_all" on public.website_reviews;
create policy "website_reviews_owner_all" on public.website_reviews
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "crm_proposals_owner_all" on public.crm_proposals;
create policy "crm_proposals_owner_all" on public.crm_proposals
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "crm_automation_events_owner_all" on public.crm_automation_events;
create policy "crm_automation_events_owner_all" on public.crm_automation_events
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
