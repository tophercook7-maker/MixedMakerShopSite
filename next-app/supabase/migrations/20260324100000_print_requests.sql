-- Public 3D print request uploads (metadata + file URL filled by API)

create table if not exists public.print_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  description text,
  quantity text,
  color_preference text,
  file_url text not null,
  file_name text not null,
  file_kind text not null check (file_kind in ('model', 'image')),
  created_at timestamptz not null default now()
);

create index if not exists print_requests_created_at_idx on public.print_requests (created_at desc);

alter table public.print_requests enable row level security;

-- No anon/authenticated policies: inserts only via service role (API).

comment on table public.print_requests is 'Inbound 3D print file/image uploads from /upload-print';

-- Storage bucket for STL/3MF/images (uploads via service role; public read for shared links in email)
insert into storage.buckets (id, name, public, file_size_limit)
values ('print-request-uploads', 'print-request-uploads', true, 26214400)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "print_request_uploads_select_public" on storage.objects;

create policy "print_request_uploads_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'print-request-uploads');
