alter table public.leads
  add column if not exists is_manual boolean not null default false;

alter table public.leads
  add column if not exists known_owner_name text;

alter table public.leads
  add column if not exists known_context text;

alter table public.leads
  add column if not exists door_status text;

alter table public.leads
  add column if not exists real_world_why_target text;

alter table public.leads
  add column if not exists real_world_walk_in_pitch text;

alter table public.leads
  add column if not exists best_time_to_visit text;

alter table public.leads
  add column if not exists last_updated_at timestamptz not null default now();

alter table public.leads
  drop constraint if exists leads_door_status_check;

alter table public.leads
  add constraint leads_door_status_check check (
    door_status is null
    or door_status in ('not_visited', 'planned', 'visited', 'follow_up', 'closed_won', 'closed_lost')
  );

create index if not exists idx_leads_door_status
  on public.leads(door_status);

create index if not exists idx_leads_is_manual
  on public.leads(is_manual);
