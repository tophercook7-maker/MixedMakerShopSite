create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  event_type text not null check (event_type in ('meeting', 'followup', 'task', 'scout')),
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade
);

create index if not exists idx_calendar_events_owner_start
  on public.calendar_events(owner_id, start_time);

create index if not exists idx_calendar_events_workspace_start
  on public.calendar_events(workspace_id, start_time);

create index if not exists idx_calendar_events_lead
  on public.calendar_events(lead_id);

alter table public.calendar_events enable row level security;

drop policy if exists calendar_events_all on public.calendar_events;
create policy calendar_events_all
  on public.calendar_events
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
