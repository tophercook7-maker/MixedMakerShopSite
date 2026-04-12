-- Pipeline tracking for mockup funnel submissions (admin CRM).

alter table public.mockup_submissions
  add column if not exists lead_status text not null default 'new',
  add column if not exists status_updated_at timestamptz;

comment on column public.mockup_submissions.lead_status is 'Sales pipeline: new, draft_created, contacted, replied, follow_up_needed, closed_won, closed_lost, archived';
comment on column public.mockup_submissions.status_updated_at is 'When lead_status last changed (manual or automatic).';

-- Backfill from legacy status column (new | reviewed | contacted | closed).
update public.mockup_submissions
set
  lead_status = case trim(lower(coalesce(status, '')))
    when 'reviewed' then 'draft_created'
    when 'contacted' then 'contacted'
    when 'closed' then 'closed_lost'
    when 'new' then 'new'
    else lead_status
  end,
  status_updated_at = coalesce(status_updated_at, updated_at, created_at);

create index if not exists mockup_submissions_lead_status_idx
  on public.mockup_submissions (lead_status);
