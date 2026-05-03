alter table public.projects
  add column if not exists estimated_price numeric(10,2),
  add column if not exists deposit_amount numeric(10,2),
  add column if not exists payment_method text,
  add column if not exists scheduled_start_date date,
  add column if not exists due_date date,
  add column if not exists internal_notes text,
  add column if not exists action_checklist jsonb not null default '{}'::jsonb;

update public.projects
set
  estimated_price = coalesce(estimated_price, price),
  due_date = coalesce(due_date, deadline),
  internal_notes = coalesce(internal_notes, notes)
where estimated_price is null
  or due_date is null
  or internal_notes is null;
