-- Scout Brain → CRM handoff: primary outreach target + suggested copy

alter table public.leads add column if not exists google_business_url text;
alter table public.leads add column if not exists advertising_page_url text;
alter table public.leads add column if not exists advertising_page_label text;
alter table public.leads add column if not exists best_contact_value text;
alter table public.leads add column if not exists suggested_template_key text;
alter table public.leads add column if not exists suggested_response text;

comment on column public.leads.google_business_url is 'Google Maps / Business profile URL when known from Places or CRM (no invented URLs).';
comment on column public.leads.advertising_page_url is 'Primary public-facing page for outreach context (Facebook, Google listing, site, etc.).';
comment on column public.leads.advertising_page_label is 'Human label for advertising_page_url (e.g. Facebook page, Google listing).';
comment on column public.leads.best_contact_value is 'Concrete value for best_contact_method (email, URL, or phone string).';
comment on column public.leads.suggested_template_key is 'Scout Brain template key used for suggested_response.';
comment on column public.leads.suggested_response is 'Short ready-to-send outreach text from Scout Brain.';
