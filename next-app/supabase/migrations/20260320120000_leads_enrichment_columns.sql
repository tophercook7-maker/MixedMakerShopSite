-- Columns used by CRM lead enrichment (HTML / optional search). Safe if already present.

alter table public.leads add column if not exists contact_page text;
alter table public.leads add column if not exists city text;
alter table public.leads add column if not exists state text;
alter table public.leads add column if not exists email_source text;

comment on column public.leads.contact_page is 'Public contact or form page URL on the business site (enrichment / manual).';
comment on column public.leads.email_source is 'How email was obtained (e.g. enrichment, manual).';
