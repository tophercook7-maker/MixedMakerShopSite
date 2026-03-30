-- Store server-generated static HTML export for shareable CRM mockups (admin / copy-out).

alter table public.crm_mockups
  add column if not exists generated_html text;

alter table public.crm_mockups
  add column if not exists html_generated_at timestamptz;

comment on column public.crm_mockups.generated_html is 'Full static HTML document produced from mockup preview (Phase 1 admin export).';
comment on column public.crm_mockups.html_generated_at is 'When generated_html was last written.';
