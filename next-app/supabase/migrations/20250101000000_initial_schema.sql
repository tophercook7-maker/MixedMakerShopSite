-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'owner' check (role in ('owner', 'admin')),
  updated_at timestamptz default now()
);

-- Form submissions (contact, website check, quote)
create table public.form_submissions (
  id uuid primary key default uuid_generate_v4(),
  form_type text not null check (form_type in ('contact', 'website_check', 'quote', 'connect')),
  payload jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Leads (from forms or manual)
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  form_submission_id uuid references public.form_submissions(id) on delete set null,
  name text,
  email text not null,
  phone text,
  company text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'interested', 'proposal_sent', 'won', 'lost')),
  source text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients (converted leads or manual)
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  status text not null default 'planning' check (status in ('planning', 'design', 'development', 'testing', 'complete', 'maintenance')),
  price_cents int,
  deadline date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  amount_cents int not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  payment_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: only authenticated users (owner) can access
alter table public.profiles enable row level security;
alter table public.form_submissions enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.payments enable row level security;

-- Policies: allow all operations for authenticated users (single-tenant owner)
create policy "Owner can do all on profiles" on public.profiles for all using (auth.uid() = id);
create policy "Anyone can insert form_submissions" on public.form_submissions for insert with check (true);
create policy "Owner can select form_submissions" on public.form_submissions for select using (auth.role() = 'authenticated');
create policy "Owner can update form_submissions" on public.form_submissions for update using (auth.role() = 'authenticated');
create policy "Owner can delete form_submissions" on public.form_submissions for delete using (auth.role() = 'authenticated');
create policy "Owner can do all on leads" on public.leads for all using (auth.role() = 'authenticated');
create policy "Owner can do all on clients" on public.clients for all using (auth.role() = 'authenticated');
create policy "Owner can do all on projects" on public.projects for all using (auth.role() = 'authenticated');
create policy "Owner can do all on tasks" on public.tasks for all using (auth.role() = 'authenticated');
create policy "Owner can do all on payments" on public.payments for all using (auth.role() = 'authenticated');

-- Trigger to create profile on signup
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
