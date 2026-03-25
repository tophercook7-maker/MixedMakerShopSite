-- 3D print quote CRM: quick-scan fields (full details remain in notes / message body)

alter table public.leads add column if not exists print_attachment_url text;
alter table public.leads add column if not exists print_estimate_summary text;
alter table public.leads add column if not exists print_request_summary text;

comment on column public.leads.print_attachment_url is 'Public URL of upload from /3d-printing quote form (if any).';
comment on column public.leads.print_estimate_summary is 'Short summary of ballpark calculator estimate from the form.';
comment on column public.leads.print_request_summary is 'What they need — short line for list views.';
