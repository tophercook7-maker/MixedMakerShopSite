-- Bracketed labor estimate for 3D print jobs
alter table public.leads add column if not exists print_labor_level text;
alter table public.leads add column if not exists print_labor_cost numeric(12, 2);

comment on column public.leads.print_labor_level is 'Labor bracket id: very_simple, simple, moderate, detailed, complex.';
comment on column public.leads.print_labor_cost is 'USD labor charge for the selected bracket (denormalized for reporting).';
