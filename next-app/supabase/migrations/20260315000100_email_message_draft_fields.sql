-- Optional draft metadata for generated outreach messages.
alter table public.email_messages
  add column if not exists status text;

alter table public.email_messages
  add column if not exists generated_by text;

update public.email_messages
set status = coalesce(status, 'sent')
where status is null;

alter table public.email_messages
  alter column status set default 'sent';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'email_messages_status_check'
  ) then
    alter table public.email_messages
      add constraint email_messages_status_check
      check (status in ('draft', 'queued', 'sent', 'failed', 'received'));
  end if;
end$$;
