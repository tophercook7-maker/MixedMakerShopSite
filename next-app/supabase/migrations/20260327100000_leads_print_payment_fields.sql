-- 3D print job payment tracking (CRM leads)

alter table public.leads
  add column if not exists quoted_amount numeric,
  add column if not exists deposit_amount numeric,
  add column if not exists final_amount numeric,
  add column if not exists payment_status text default 'unpaid',
  add column if not exists payment_method text,
  add column if not exists payment_link text,
  add column if not exists paid_at timestamptz;

comment on column public.leads.payment_status is 'unpaid | deposit_requested | partially_paid | paid | refunded';
comment on column public.leads.payment_method is 'stripe | cashapp | manual | other';
