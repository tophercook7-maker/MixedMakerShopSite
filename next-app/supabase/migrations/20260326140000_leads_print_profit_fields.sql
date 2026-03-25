-- 3D print job profit tracking (stored inputs; total cost & profit derived in app for now)

alter table public.leads add column if not exists price_charged numeric(12, 2);
alter table public.leads add column if not exists filament_cost numeric(12, 2);
alter table public.leads add column if not exists estimated_time_hours numeric(10, 2);

comment on column public.leads.price_charged is 'Amount charged to customer for this print job (USD).';
comment on column public.leads.filament_cost is 'Filament / material cost for this job (USD). App treats total_cost = filament_cost until more cost lines exist.';
comment on column public.leads.estimated_time_hours is 'Optional estimated print + prep time in hours.';
