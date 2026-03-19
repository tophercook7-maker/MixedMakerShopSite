alter table public.leads
  add column if not exists follow_up_stage integer;

alter table public.leads
  add column if not exists follow_up_status text;

alter table public.leads
  alter column follow_up_stage set default 0;

alter table public.leads
  alter column follow_up_status set default 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_follow_up_stage_range_check'
  ) then
    alter table public.leads
      add constraint leads_follow_up_stage_range_check
      check (follow_up_stage is null or follow_up_stage between 0 and 3);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_follow_up_status_check'
  ) then
    alter table public.leads
      add constraint leads_follow_up_status_check
      check (follow_up_status is null or follow_up_status in ('pending', 'completed'));
  end if;
end $$;

update public.leads
set follow_up_stage = coalesce(follow_up_stage, 0)
where follow_up_stage is null;

update public.leads
set follow_up_status = coalesce(follow_up_status, 'pending')
where follow_up_status is null;

create index if not exists idx_leads_follow_up_queue
  on public.leads(owner_id, follow_up_status, next_follow_up_at asc);
