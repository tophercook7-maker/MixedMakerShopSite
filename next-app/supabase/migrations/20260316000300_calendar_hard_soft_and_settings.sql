create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  lead_id uuid null references public.leads(id) on delete set null,
  title text not null,
  event_type text not null,
  start_time timestamptz not null,
  end_time timestamptz null,
  notes text null,
  is_blocking boolean not null default false,
  source text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade
);

alter table public.calendar_events add column if not exists workspace_id uuid;
alter table public.calendar_events add column if not exists lead_id uuid null references public.leads(id) on delete set null;
alter table public.calendar_events add column if not exists title text;
alter table public.calendar_events add column if not exists event_type text;
alter table public.calendar_events add column if not exists start_time timestamptz;
alter table public.calendar_events add column if not exists end_time timestamptz;
alter table public.calendar_events add column if not exists notes text;
alter table public.calendar_events add column if not exists is_blocking boolean not null default false;
alter table public.calendar_events add column if not exists source text;
alter table public.calendar_events add column if not exists created_at timestamptz not null default now();
alter table public.calendar_events add column if not exists updated_at timestamptz not null default now();
alter table public.calendar_events add column if not exists owner_id uuid default auth.uid() references public.profiles(id) on delete cascade;

update public.calendar_events
set event_type = case
  when event_type = 'meeting' then 'appointment'
  when event_type = 'follow_up_reminder' then 'followup'
  when event_type = 'scout_run' then 'scout'
  else event_type
end
where event_type in ('meeting', 'follow_up_reminder', 'scout_run');

update public.calendar_events
set is_blocking = case
  when event_type in ('appointment', 'client_call') then true
  else false
end
where is_blocking is distinct from case when event_type in ('appointment', 'client_call') then true else false end;

alter table public.calendar_events
  drop constraint if exists calendar_events_event_type_check;

alter table public.calendar_events
  add constraint calendar_events_event_type_check
  check (event_type in ('appointment', 'client_call', 'followup', 'task', 'scout'));

create or replace function public.touch_calendar_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_calendar_events_updated_at on public.calendar_events;
create trigger trg_calendar_events_updated_at
before update on public.calendar_events
for each row
execute function public.touch_calendar_events_updated_at();

create index if not exists idx_calendar_events_workspace
  on public.calendar_events(workspace_id);

create index if not exists idx_calendar_events_start_time
  on public.calendar_events(start_time);

create index if not exists idx_calendar_events_event_type
  on public.calendar_events(event_type);

create index if not exists idx_calendar_events_lead_id
  on public.calendar_events(lead_id);

create index if not exists idx_calendar_events_owner_start
  on public.calendar_events(owner_id, start_time);

alter table public.calendar_events enable row level security;

drop policy if exists calendar_events_all on public.calendar_events;
create policy calendar_events_all
  on public.calendar_events
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create table if not exists public.calendar_settings (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  show_soft_events_on_main_calendar boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_calendar_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_calendar_settings_updated_at on public.calendar_settings;
create trigger trg_calendar_settings_updated_at
before update on public.calendar_settings
for each row
execute function public.touch_calendar_settings_updated_at();

alter table public.calendar_settings enable row level security;

drop policy if exists calendar_settings_select on public.calendar_settings;
create policy calendar_settings_select
  on public.calendar_settings
  for select
  using (auth.uid() = owner_id);

drop policy if exists calendar_settings_upsert on public.calendar_settings;
create policy calendar_settings_upsert
  on public.calendar_settings
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists calendar_settings_update on public.calendar_settings;
create policy calendar_settings_update
  on public.calendar_settings
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

