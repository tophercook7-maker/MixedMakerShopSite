-- PLA / weight-based filament cost (3D print jobs)
alter table public.leads add column if not exists filament_grams_used numeric(12, 2);
alter table public.leads add column if not exists filament_cost_per_kg numeric(12, 2);
alter table public.leads add column if not exists filament_use_weight_calc boolean not null default true;

comment on column public.leads.filament_grams_used is 'Filament used for this job (grams). Used with filament_cost_per_kg when filament_use_weight_calc is true.';
comment on column public.leads.filament_cost_per_kg is 'PLA cost per kg (USD) for this job; null = use app default per kg.';
comment on column public.leads.filament_use_weight_calc is 'When true, filament_cost is driven by grams × cost/kg; when false, filament_cost is manual.';
