alter table public.leads
  add column if not exists deal_status text not null default 'none';

alter table public.leads
  add column if not exists deal_value numeric;

alter table public.leads
  add column if not exists closed_at timestamptz;

alter table public.leads
  drop constraint if exists leads_deal_status_check;

alter table public.leads
  add constraint leads_deal_status_check
  check (deal_status in ('none', 'interested', 'proposal_sent', 'won', 'lost'));

alter table public.leads
  drop constraint if exists leads_status_check;

alter table public.leads
  add constraint leads_status_check
  check (status in (
    'new',
    'contacted',
    'follow_up_due',
    'replied',
    'no_response',
    'closed',
    'closed_won',
    'closed_lost',
    'research_later',
    'do_not_contact'
  ));

create index if not exists idx_leads_deal_status
  on public.leads(owner_id, deal_status, closed_at desc);
