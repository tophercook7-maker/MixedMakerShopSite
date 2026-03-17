alter table public.leads
  add column if not exists last_reply_at timestamptz;

alter table public.leads
  add column if not exists last_reply_preview text;

alter table public.leads
  add column if not exists is_hot_lead boolean not null default false;

alter table public.leads
  add column if not exists recommended_next_action text;

alter table public.email_messages
  add column if not exists recipient_email text;

alter table public.email_messages
  add column if not exists in_reply_to text;

alter table public.email_messages
  add column if not exists "references" text[];

alter table public.email_messages
  add column if not exists preview_url text;

alter table public.email_messages
  add column if not exists message_kind text;

create index if not exists idx_email_messages_in_reply_to
  on public.email_messages(in_reply_to);

create index if not exists idx_email_messages_recipient_email
  on public.email_messages(lower(coalesce(recipient_email, '')));
