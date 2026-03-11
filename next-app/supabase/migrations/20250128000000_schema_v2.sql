-- Drop old tables if they exist (from initial_schema)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.payments;
drop table if exists public.tasks;
drop table if exists public.projects;
drop table if exists public.clients;
drop table if exists public.leads;
drop table if exists public.form_submissions;
drop table if exists public.profiles;

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'owner' check (role in ('owner', 'admin')),
  created_at timestamptz default now()
);

-- Form submissions (public forms; owner_id null until claimed)
create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  name text,
  business_name text,
  email text,
  phone text,
  website text,
  message text,
  created_at timestamptz default now(),
  owner_id uuid references public.profiles(id) on delete set null
);

-- Leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  industry text,
  lead_source text,
  status text not null default 'new' check (status in ('new', 'contacted', 'interested', 'proposal_sent', 'won', 'lost')),
  notes text,
  follow_up_date date,
  created_at timestamptz default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

-- Clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  hosting_provider text,
  maintenance_plan text,
  notes text,
  created_at timestamptz default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  status text not null default 'planning' check (status in ('planning', 'design', 'development', 'testing', 'complete', 'maintenance')),
  deadline date,
  price numeric(10,2),
  notes text,
  created_at timestamptz default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  due_date date,
  notes text,
  created_at timestamptz default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  payment_date date,
  notes text,
  created_at timestamptz default now(),
  owner_id uuid not null references public.profiles(id) on delete cascade
);

-- RLS
alter table public.profiles enable row level security;
alter table public.form_submissions enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.payments enable row level security;

-- Profiles: own row only
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Form submissions: anyone can insert (public forms); owner can read/update
create policy "form_submissions_insert" on public.form_submissions for insert with check (true);
create policy "form_submissions_select" on public.form_submissions for select using (auth.uid() = owner_id or owner_id is null);
create policy "form_submissions_update" on public.form_submissions for update using (auth.uid() = owner_id or owner_id is null);

-- Private tables: only owner
create policy "leads_all" on public.leads for all using (auth.uid() = owner_id);
create policy "clients_all" on public.clients for all using (auth.uid() = owner_id);
create policy "projects_all" on public.projects for all using (auth.uid() = owner_id);
create policy "tasks_all" on public.tasks for all using (auth.uid() = owner_id);
create policy "payments_all" on public.payments for all using (auth.uid() = owner_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
