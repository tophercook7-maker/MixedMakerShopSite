-- CRM: service line classification + first-outreach note (email-first workflow)
alter table public.leads add column if not exists service_type text;
alter table public.leads add column if not exists first_outreach_message text;

comment on column public.leads.service_type is 'Optional: web_design | 3d_printing';
comment on column public.leads.first_outreach_message is 'Exact text of first outreach for replay / training';

create index if not exists idx_leads_owner_service_type
  on public.leads(owner_id, service_type)
  where service_type is not null;
