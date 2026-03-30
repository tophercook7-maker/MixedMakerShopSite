-- Admin 1-click quick mockup generator output (SampleDraft JSON + metadata).

alter table public.mockup_submissions
  add column if not exists admin_generated_mockup jsonb;

comment on column public.mockup_submissions.admin_generated_mockup is 'Rules-based homepage draft from Generate Mockup (structured + sampleDraft + presets).';
