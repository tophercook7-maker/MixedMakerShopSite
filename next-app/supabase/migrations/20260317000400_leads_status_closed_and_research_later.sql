alter table public.leads
  drop constraint if exists leads_status_check;

alter table public.leads
  add constraint leads_status_check
  check (status in (
    'new',
    'contacted',
    'follow_up_due',
    'replied',
    'closed',
    'closed_won',
    'closed_lost',
    'research_later',
    'do_not_contact'
  ));
