-- Canonical CRM activity log: type, message, metadata, actor_user_id.
-- Handles fresh installs and upgrades from legacy lead_activities (event_type, meta, owner_id).

do $migr$
begin
  -- Fresh database: create canonical table
  if to_regclass('public.lead_activities') is null then
    create table public.lead_activities (
      id uuid primary key default gen_random_uuid(),
      lead_id uuid not null references public.leads(id) on delete cascade,
      type text not null,
      message text,
      metadata jsonb not null default '{}'::jsonb,
      actor_user_id uuid references public.profiles(id) on delete set null,
      created_at timestamptz not null default now()
    );
  -- Legacy table from older migration: reshape in place
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'lead_activities'
      and column_name = 'event_type'
  ) then
    alter table public.lead_activities add column if not exists type text;
    alter table public.lead_activities add column if not exists message text;
    alter table public.lead_activities add column if not exists metadata jsonb default '{}'::jsonb;
    alter table public.lead_activities add column if not exists actor_user_id uuid references public.profiles(id) on delete set null;

    update public.lead_activities
    set
      type = coalesce(type, event_type, 'note'),
      metadata = coalesce(metadata, meta, '{}'::jsonb),
      actor_user_id = coalesce(actor_user_id, owner_id)
    where true;

    alter table public.lead_activities alter column metadata set default '{}'::jsonb;
    alter table public.lead_activities alter column metadata set not null;
    alter table public.lead_activities alter column type set not null;

    drop policy if exists lead_activities_owner on public.lead_activities;

    alter table public.lead_activities drop column if exists event_type;
    alter table public.lead_activities drop column if exists meta;
    alter table public.lead_activities drop column if exists owner_id;
  end if;
end
$migr$;

create index if not exists idx_lead_activities_lead_id
  on public.lead_activities(lead_id);

create index if not exists idx_lead_activities_created_at_desc
  on public.lead_activities(created_at desc);

alter table public.lead_activities enable row level security;

drop policy if exists lead_activities_actor_rw on public.lead_activities;
create policy lead_activities_actor_rw
  on public.lead_activities
  for all
  using (auth.uid() = actor_user_id)
  with check (auth.uid() = actor_user_id);
