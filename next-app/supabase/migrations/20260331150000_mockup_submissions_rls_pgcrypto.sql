-- Full setup: table + RLS policies. Safe if 20260331140000 already ran (IF NOT EXISTS / idempotent parts).
-- If you use the Supabase SQL editor, you can run this whole file once.

create extension if not exists pgcrypto;

create table if not exists public.mockup_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  mockup_data jsonb not null default '{}'::jsonb,
  notes text,
  status text not null default 'new',
  source text not null default 'free-mockup',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mockup_submissions_created_at_idx
  on public.mockup_submissions (created_at desc);

create index if not exists mockup_submissions_status_idx
  on public.mockup_submissions (status);

create or replace function public.set_mockup_submissions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_mockup_submissions_updated_at on public.mockup_submissions;

create trigger trg_mockup_submissions_updated_at
before update on public.mockup_submissions
for each row execute procedure public.set_mockup_submissions_updated_at();

alter table public.mockup_submissions enable row level security;

comment on table public.mockup_submissions is 'Free mockup funnel saves; full payload in mockup_data. Review via service role / admin.';

drop policy if exists "mockup_submissions_select_authenticated" on public.mockup_submissions;
drop policy if exists "mockup_submissions_update_authenticated" on public.mockup_submissions;

create policy "mockup_submissions_select_authenticated"
  on public.mockup_submissions
  for select
  to authenticated
  using (true);

create policy "mockup_submissions_update_authenticated"
  on public.mockup_submissions
  for update
  to authenticated
  using (true)
  with check (true);
