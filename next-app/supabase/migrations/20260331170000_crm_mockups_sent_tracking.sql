-- Track when a shareable CRM mockup preview was emailed to the lead from admin.

alter table public.crm_mockups
  add column if not exists sent_at timestamptz;

alter table public.crm_mockups
  add column if not exists last_sent_to text;

comment on column public.crm_mockups.sent_at is 'When the mockup preview link was last emailed to the lead from admin.';
comment on column public.crm_mockups.last_sent_to is 'Recipient email address used for the last admin “send mockup” action.';
