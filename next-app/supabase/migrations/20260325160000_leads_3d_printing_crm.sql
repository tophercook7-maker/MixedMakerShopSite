-- 3D printing workflow inside main CRM (separate pipeline + detail fields; generic `status` stays in sync via app)

alter table public.leads
  add column if not exists print_pipeline_status text
    check (
      print_pipeline_status is null
      or print_pipeline_status in (
        'new',
        'need_info',
        'quoted',
        'printing',
        'ready',
        'delivered',
        'closed'
      )
    );

alter table public.leads add column if not exists print_request_type text;
alter table public.leads add column if not exists print_tags text[] not null default '{}';
alter table public.leads add column if not exists print_material text;
alter table public.leads add column if not exists print_dimensions text;
alter table public.leads add column if not exists print_quantity text;
alter table public.leads add column if not exists print_deadline text;
alter table public.leads add column if not exists print_design_help_requested boolean;
alter table public.leads add column if not exists last_response_at timestamptz;

comment on column public.leads.print_pipeline_status is '3D print-only pipeline; kept separate from web-design leads.status.';
comment on column public.leads.print_tags is 'Auto-detected request tags (mount, replacement_part, …).';

create index if not exists idx_leads_lead_source_3d
  on public.leads (owner_id, created_at desc)
  where lead_source in ('3d_printing', 'print_quote');

update public.leads
set
  lead_source = '3d_printing',
  source = coalesce(nullif(trim(source), ''), '3d_printing')
where lead_source = 'print_quote'
   or source = 'print_quote';
