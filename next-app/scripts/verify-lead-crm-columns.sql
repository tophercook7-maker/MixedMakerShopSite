-- Run in Supabase SQL editor (or psql) to confirm CRM migration columns exist on public.leads.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'leads'
  and column_name in (
    'source_query',
    'source_platform',
    'capture_run_id',
    'capture_notes',
    'crm_lane_web'
  )
order by column_name;
