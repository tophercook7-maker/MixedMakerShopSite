-- How the last payment request was framed (deposit vs full). Distinct from print_request_type (estimator).

alter table public.leads
  add column if not exists payment_request_type text;

comment on column public.leads.payment_request_type is 'deposit | full — deposit vs full payment request for 3D print jobs';
