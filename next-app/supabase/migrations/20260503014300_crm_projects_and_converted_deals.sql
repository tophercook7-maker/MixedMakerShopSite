-- Allow leads to be marked as converted and move projects to the CRM project status set.
alter table public.leads
  drop constraint if exists leads_deal_status_check;

alter table public.leads
  add constraint leads_deal_status_check
  check (deal_status in ('none', 'interested', 'proposal_sent', 'won', 'lost', 'converted'));

update public.projects
set status = case status
  when 'planning' then 'draft'
  when 'design' then 'in_progress'
  when 'development' then 'in_progress'
  when 'testing' then 'in_progress'
  when 'complete' then 'completed'
  when 'maintenance' then 'in_progress'
  else status
end
where status in ('planning', 'design', 'development', 'testing', 'complete', 'maintenance');

alter table public.projects
  drop constraint if exists projects_status_check;

alter table public.projects
  alter column status set default 'draft';

alter table public.projects
  add constraint projects_status_check
  check (
    status in (
      'draft',
      'estimate_sent',
      'deposit_requested',
      'deposit_received',
      'scheduled',
      'in_progress',
      'waiting_on_customer',
      'completed',
      'archived'
    )
  );
