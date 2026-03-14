-- CRM email thread + message tracking for outbound/inbound conversations.

create table if not exists public.email_threads (
  id uuid primary key default gen_random_uuid(),
  workspace_id text,
  lead_id uuid references public.leads(id) on delete set null,
  contact_email text not null,
  subject text,
  provider_thread_id text,
  status text not null default 'open' check (status in ('open', 'active', 'closed')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.email_threads(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  direction text not null check (direction in ('outbound', 'inbound')),
  provider_message_id text,
  subject text,
  body text not null,
  delivery_status text not null default 'sent' check (delivery_status in ('queued', 'sent', 'failed', 'received')),
  sent_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

alter table public.email_threads enable row level security;
alter table public.email_messages enable row level security;

drop policy if exists email_threads_all on public.email_threads;
create policy email_threads_all
  on public.email_threads
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists email_messages_all on public.email_messages;
create policy email_messages_all
  on public.email_messages
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index if not exists idx_email_threads_owner_last_message
  on public.email_threads(owner_id, last_message_at desc);

create index if not exists idx_email_threads_lead
  on public.email_threads(lead_id, created_at desc);

create index if not exists idx_email_threads_contact_subject
  on public.email_threads(contact_email, subject);

create index if not exists idx_email_threads_provider_thread
  on public.email_threads(provider_thread_id);

create index if not exists idx_email_messages_lead_created
  on public.email_messages(lead_id, created_at desc);

create index if not exists idx_email_messages_thread_created
  on public.email_messages(thread_id, created_at asc);

create index if not exists idx_email_messages_provider_message
  on public.email_messages(provider_message_id);
