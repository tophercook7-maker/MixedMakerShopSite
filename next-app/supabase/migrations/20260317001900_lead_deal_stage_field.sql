alter table public.leads
  add column if not exists deal_stage text;

alter table public.leads
  alter column deal_stage set default 'new';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_deal_stage_check'
  ) then
    alter table public.leads
      add constraint leads_deal_stage_check
      check (deal_stage in ('new', 'interested', 'pricing', 'closing', 'won'));
  end if;
end $$;

update public.leads
set deal_stage = coalesce(deal_stage, 'new')
where deal_stage is null;

create index if not exists idx_leads_deal_stage
  on public.leads(owner_id, deal_stage, created_at desc);
