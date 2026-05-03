alter table public.projects
  add column if not exists amount_paid_updated_at timestamptz,
  add column if not exists completed_at timestamptz;

update public.projects
set completed_at = coalesce(completed_at, now())
where status = 'completed'
  and completed_at is null;
