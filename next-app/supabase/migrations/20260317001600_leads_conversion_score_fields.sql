alter table public.leads
  add column if not exists conversion_score integer;

alter table public.leads
  add column if not exists score_breakdown jsonb;

alter table public.leads
  drop constraint if exists leads_conversion_score_range_check;

alter table public.leads
  add constraint leads_conversion_score_range_check
  check (
    conversion_score is null
    or (conversion_score >= 0 and conversion_score <= 100)
  );

create index if not exists idx_leads_conversion_score
  on public.leads(conversion_score desc nulls last);
