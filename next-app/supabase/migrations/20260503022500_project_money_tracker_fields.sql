alter table public.projects
  add column if not exists amount_paid numeric(10,2) not null default 0,
  add column if not exists payment_status text not null default 'not_requested';

alter table public.projects
  drop constraint if exists projects_payment_status_check;

alter table public.projects
  add constraint projects_payment_status_check
  check (
    payment_status in (
      'not_requested',
      'deposit_requested',
      'deposit_received',
      'partially_paid',
      'paid_in_full',
      'refunded',
      'canceled'
    )
  );
