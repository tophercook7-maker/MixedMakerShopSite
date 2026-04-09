-- Branded public slug for client site draft previews (/preview/{slug}).
-- Keeps share links human-readable; UUID /preview/{id} redirects when slug exists.

alter table public.leads
  add column if not exists site_draft_preview_slug text;

create unique index if not exists leads_site_draft_preview_slug_key
  on public.leads (site_draft_preview_slug)
  where site_draft_preview_slug is not null and length(trim(site_draft_preview_slug)) > 0;

comment on column public.leads.site_draft_preview_slug is 'Public slug for client-facing /preview/{slug} site draft; must not collide with crm_mockups.mockup_slug.';

-- Public read of minimal lead fields for site draft preview (security definer).
create or replace function public.get_public_lead_site_draft_preview_by_slug(p_slug text)
returns table (
  id uuid,
  business_name text,
  category text,
  city text,
  phone text,
  address text
)
language sql
security definer
set search_path = public
stable
begin atomic
  select
    l.id,
    l.business_name,
    coalesce(nullif(trim(l.category), ''), nullif(trim(l.industry), '')) as category,
    l.city,
    l.phone,
    l.address
  from public.leads l
  where l.site_draft_preview_slug = nullif(trim(p_slug), '')
  limit 1;
end;

create or replace function public.get_public_lead_site_draft_preview_by_id(p_lead_id uuid)
returns table (
  id uuid,
  business_name text,
  category text,
  city text,
  phone text,
  address text
)
language sql
security definer
set search_path = public
stable
begin atomic
  select
    l.id,
    l.business_name,
    coalesce(nullif(trim(l.category), ''), nullif(trim(l.industry), '')) as category,
    l.city,
    l.phone,
    l.address
  from public.leads l
  where l.id = p_lead_id
  limit 1;
end;

create or replace function public.get_public_site_draft_preview_slug_for_lead(p_lead_id uuid)
returns text
language sql
security definer
set search_path = public
stable
begin atomic
  select l.site_draft_preview_slug
  from public.leads l
  where l.id = p_lead_id
  limit 1;
end;

grant execute on function public.get_public_lead_site_draft_preview_by_slug(text) to anon, authenticated;
grant execute on function public.get_public_lead_site_draft_preview_by_id(uuid) to anon, authenticated;
grant execute on function public.get_public_site_draft_preview_slug_for_lead(uuid) to anon, authenticated;

-- Normalize legacy stored mockup URLs to /preview/ (client-facing canonical path).
update public.crm_mockups
set mockup_url = replace(mockup_url, '/mockup/', '/preview/')
where mockup_url is not null
  and mockup_url like '%/mockup/%';
