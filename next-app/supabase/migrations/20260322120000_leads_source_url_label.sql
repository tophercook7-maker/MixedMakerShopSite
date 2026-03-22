-- Optional capture context (page URL + human label). Canonical channel codes stay in lead_source.

alter table public.leads add column if not exists source_url text;
alter table public.leads add column if not exists source_label text;

comment on column public.leads.lead_source is 'Canonical capture channel: extension, quick_add, scout_google, scout_facebook, scout_mixed, manual, or legacy tokens.';
comment on column public.leads.source_url is 'Page or listing URL where the lead was captured, when known.';
comment on column public.leads.source_label is 'Optional plain-English label shown in CRM (e.g. Captured from Facebook).';
