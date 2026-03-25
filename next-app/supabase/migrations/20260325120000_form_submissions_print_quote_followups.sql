-- Automated 3D print quote follow-up emails (max 2 per submission; cron-driven)

alter table public.form_submissions
  add column if not exists print_quote_followup_1_sent_at timestamptz;

alter table public.form_submissions
  add column if not exists print_quote_followup_2_sent_at timestamptz;

alter table public.form_submissions
  add column if not exists print_quote_followup_disabled boolean not null default false;

comment on column public.form_submissions.print_quote_followup_1_sent_at is
  'When the first automated 3D print follow-up email was sent (null = not sent).';

comment on column public.form_submissions.print_quote_followup_2_sent_at is
  'When the second (final) automated 3D print follow-up email was sent.';

comment on column public.form_submissions.print_quote_followup_disabled is
  'When true, cron skips this submission (e.g. manual opt-out).';

create index if not exists idx_form_submissions_print_quote_followup_scan
  on public.form_submissions (form_type, created_at desc)
  where form_type = 'print_quote'
    and print_quote_followup_disabled = false
    and email is not null;
