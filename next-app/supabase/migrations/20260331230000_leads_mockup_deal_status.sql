-- Simple mockup / web-deal pipeline status (separate from canonical leads.status).

alter table public.leads
  add column if not exists mockup_deal_status text not null default 'new';

alter table public.leads
  drop constraint if exists leads_mockup_deal_status_check;

alter table public.leads
  add constraint leads_mockup_deal_status_check
  check (
    mockup_deal_status in (
      'new',
      'mockup_sent',
      'replied',
      'interested',
      'closed_won',
      'closed_lost'
    )
  );

comment on column public.leads.mockup_deal_status is 'Web mockup funnel: new → mockup_sent → replied/interested → closed_*';

create index if not exists idx_leads_owner_mockup_deal_status
  on public.leads(owner_id, mockup_deal_status, last_updated_at desc);
