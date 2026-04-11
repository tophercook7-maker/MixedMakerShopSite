-- Attribution from /free-mockup query (e.g. freshcut) for reporting and admin.

alter table public.mockup_submissions
  add column if not exists funnel_source text;

comment on column public.mockup_submissions.funnel_source is 'Optional funnel tag from client (e.g. freshcut from ?source=freshcut).';

create index if not exists mockup_submissions_funnel_source_idx
  on public.mockup_submissions (funnel_source)
  where funnel_source is not null;
