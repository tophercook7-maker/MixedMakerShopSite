-- Canonical capture channel (extension, quick_add, scout_*, manual). Distinct from WorkflowLead UI field "server/local".

alter table public.leads add column if not exists source text;

comment on column public.leads.source is 'Where the lead was captured: extension, quick_add, scout_google, scout_facebook, scout_mixed, manual, etc.';

-- Prefer existing lead_source when source is empty (older rows).
update public.leads
set source = lead_source
where coalesce(nullif(trim(source), ''), '') = ''
  and coalesce(nullif(trim(lead_source), ''), '') <> '';
