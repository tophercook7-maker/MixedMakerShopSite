-- Guided funnel fields for /free-mockup (indexed copies + full payload remains in mockup_data).

alter table public.mockup_submissions
  add column if not exists selected_template_key text;

alter table public.mockup_submissions
  add column if not exists desired_outcomes jsonb not null default '[]'::jsonb;

alter table public.mockup_submissions
  add column if not exists top_services_to_feature text;

alter table public.mockup_submissions
  add column if not exists what_makes_you_different text;

alter table public.mockup_submissions
  add column if not exists special_offer_or_guarantee text;

alter table public.mockup_submissions
  add column if not exists anything_to_avoid text;

alter table public.mockup_submissions
  add column if not exists anything_else_i_should_know text;

create index if not exists mockup_submissions_email_created_idx
  on public.mockup_submissions (email, created_at desc);

comment on column public.mockup_submissions.selected_template_key is 'Visitor design direction: clean-professional, bold-modern, etc.';
