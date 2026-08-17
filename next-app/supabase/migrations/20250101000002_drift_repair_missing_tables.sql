-- Drift repair: `opportunities` and `case_files` were created by hand in the cloud
-- Supabase dashboard and never captured as migrations, so later ALTER migrations
-- (20260315000200 opportunity_reason, 20260316000500 case_files_activity_summary, etc.)
-- fail on a clean rebuild with "relation does not exist". This recreates them BEFORE
-- those alters. Reconstructed from actual code usage (.from/.insert/.select/.eq/.order)
-- plus every ALTER/CREATE INDEX that references these tables.
--
-- Matches the leads convention from 20250101000000_initial_schema.sql:
--   id uuid primary key default uuid_generate_v4()  (uuid-ossp enabled there, runs first)
-- Nullable everywhere except id/created_at so historical-shaped inserts never fail.

create table if not exists public.opportunities (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid,
  user_id uuid,
  workspace_id uuid,
  business_name text,
  website text,
  website_status text,
  phone text,
  email text,
  category text,
  industry text,
  address text,
  city text,
  state text,
  opportunity_score numeric,
  opportunity_reason text,
  opportunity_signals jsonb,
  close_probability text,
  lead_bucket text,
  lane text,
  no_website boolean,
  website_speed numeric,
  mobile_ready boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.case_files (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  owner_id uuid,
  workspace_id uuid,
  status text,
  email text,
  phone_from_site text,
  contact_page text,
  contact_form_url text,
  facebook text,
  facebook_url text,
  instagram text,
  instagram_url text,
  website_score numeric,
  google_review_count integer,
  google_rating numeric,
  reviews_last_30_days integer,
  owner_post_detected boolean,
  new_photos_detected boolean,
  listing_recently_updated boolean,
  audit_issues jsonb,
  strongest_problems jsonb,
  screenshot_url text,
  homepage_screenshot_url text,
  desktop_screenshot_url text,
  mobile_screenshot_url text,
  internal_screenshot_url text,
  contact_page_screenshot_url text,
  annotated_screenshot_url text,
  screenshot_urls jsonb,
  annotation_payload jsonb,
  activity_summary jsonb,
  website_audit jsonb,
  website_issues jsonb,
  notes text,
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- scout_runs: also dashboard-drifted. Not used by app code (only the nightly scout
-- backend + migrations reference it). Its own migration uses `alter table if exists`,
-- so the only hard failure on a clean build is the index below needing the table.
-- Columns taken from 20260316000400_scout_runs_nightly_report_fields.sql + the index cols.
create table if not exists public.scout_runs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid,
  run_time timestamptz not null default now(),
  job_name text,
  cities_scanned integer default 0,
  industries_scanned integer default 0,
  businesses_found integer default 0,
  opportunities_scored integer default 0,
  leads_created integer default 0,
  email_drafts_generated integer default 0,
  nightly_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
