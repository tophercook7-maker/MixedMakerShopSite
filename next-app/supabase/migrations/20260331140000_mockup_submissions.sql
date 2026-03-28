-- Standalone inbox for free-mockup funnel submissions (no outbound email from API).
-- Inserts use service role; RLS enabled with no end-user policies.

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
