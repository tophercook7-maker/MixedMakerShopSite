-- 3D print job labor timer (single CRM lead row)
alter table public.leads add column if not exists print_timer_started_at timestamptz;
alter table public.leads add column if not exists print_timer_running boolean not null default false;
alter table public.leads add column if not exists print_tracked_minutes integer not null default 0;
alter table public.leads add column if not exists print_manual_time_minutes integer not null default 0;

comment on column public.leads.print_timer_started_at is 'When the current timer session started (3D print jobs).';
comment on column public.leads.print_timer_running is 'True while timer is running.';
comment on column public.leads.print_tracked_minutes is 'Minutes accumulated from completed Start/Stop sessions.';
comment on column public.leads.print_manual_time_minutes is 'Extra minutes entered manually (e.g. forgot timer).';
