alter table public.leads
  add column if not exists last_reply_at timestamptz null;

alter table public.leads
  add column if not exists last_reply_preview text null;
