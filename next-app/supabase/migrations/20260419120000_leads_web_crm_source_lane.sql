-- Web CRM source capture + optional persisted lane (computed client/server; nullable for backfill).
alter table public.leads
  add column if not exists source_query text,
  add column if not exists source_platform text,
  add column if not exists capture_run_id text,
  add column if not exists capture_notes text,
  add column if not exists crm_lane_web text;

comment on column public.leads.source_query is 'Search query or keyword used when the lead was captured (e.g. Google Maps search).';
comment on column public.leads.source_platform is 'Normalized capture channel: google_maps, google_search, facebook, manual, extension, quick_add, import, unknown.';
comment on column public.leads.capture_run_id is 'Optional batch/run id for prospecting or extension capture sessions.';
comment on column public.leads.capture_notes is 'Freeform notes at capture time.';
comment on column public.leads.crm_lane_web is 'Optional persisted web CRM lane; resolver remains source of truth on read.';
