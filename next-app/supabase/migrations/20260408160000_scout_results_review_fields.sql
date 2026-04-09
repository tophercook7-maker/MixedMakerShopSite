-- Optional workflow fields for Scout review (safe if columns already exist)

alter table public.scout_results add column if not exists marked_priority boolean not null default false;
alter table public.scout_results add column if not exists reviewed_at timestamptz;
alter table public.scout_results add column if not exists pulled_into_crm_at timestamptz;

comment on column public.scout_results.marked_priority is 'User-flagged priority in Scout review UI.';
comment on column public.scout_results.reviewed_at is 'Last time the row was explicitly reviewed (e.g. mark priority).';
comment on column public.scout_results.pulled_into_crm_at is 'When this Scout row was promoted to leads.';
