-- Add `approved` to 3D print pipeline CHECK (drop/recreate named constraint from prior migration)

alter table public.leads drop constraint if exists leads_print_pipeline_status_check;

alter table public.leads
  add constraint leads_print_pipeline_status_check
  check (
    print_pipeline_status is null
    or print_pipeline_status in (
      'new',
      'need_info',
      'quoted',
      'approved',
      'printing',
      'ready',
      'delivered',
      'closed'
    )
  );
