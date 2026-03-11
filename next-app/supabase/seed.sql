-- Seed data: run with Supabase SQL editor or psql (as service role) after migrations.
-- Requires at least one profile (create a user in Auth first, then copy their id below).

-- Set this to your first user's id from auth.users after signup:
-- set local app.owner_id = 'your-uuid-here';

-- For local dev, insert a placeholder and use it (replace with real id in production)
-- Example: insert into auth.users (id, email, ...) then into profiles.

-- Leads (use real owner_id from your profiles table)
insert into public.leads (business_name, contact_name, email, phone, lead_source, status, owner_id)
values
  ('Joe''s Coffee', 'Joe Smith', 'joe@joescoffee.com', '555-0101', 'contact_form', 'new', (select id from public.profiles limit 1)),
  ('ABC Roofing', 'Alice Brown', 'alice@abcroofing.com', '555-0102', 'website_check', 'contacted', (select id from public.profiles limit 1)),
  ('Green Lawn Care', 'Greg Green', 'greg@greenlawn.com', null, 'quote_request', 'interested', (select id from public.profiles limit 1)),
  ('Downtown Barber', 'Dan Miller', 'dan@downtownbarber.com', '555-0104', 'contact_form', 'proposal_sent', (select id from public.profiles limit 1)),
  ('River City HVAC', 'Rachel Hill', 'rachel@rivercityhvac.com', '555-0105', 'website_check', 'won', (select id from public.profiles limit 1))
on conflict do nothing;

-- Clients (same owner_id)
insert into public.clients (business_name, contact_name, email, phone, owner_id)
values
  ('Joe''s Coffee', 'Joe Smith', 'joe@joescoffee.com', '555-0101', (select id from public.profiles limit 1)),
  ('ABC Roofing', 'Alice Brown', 'alice@abcroofing.com', '555-0102', (select id from public.profiles limit 1)),
  ('River City HVAC', 'Rachel Hill', 'rachel@rivercityhvac.com', '555-0105', (select id from public.profiles limit 1))
on conflict do nothing;

-- Projects (link to clients by name for seed simplicity)
insert into public.projects (client_id, name, status, deadline, price, owner_id)
values
  ((select id from public.clients where business_name = 'Joe''s Coffee' limit 1), 'Website redesign', 'design', current_date + 30, 950.00, (select id from public.profiles limit 1)),
  ((select id from public.clients where business_name = 'ABC Roofing' limit 1), 'New marketing site', 'planning', current_date + 45, 1200.00, (select id from public.profiles limit 1)),
  ((select id from public.clients where business_name = 'River City HVAC' limit 1), 'Landing page', 'development', current_date + 14, 500.00, (select id from public.profiles limit 1)),
  ((select id from public.clients where business_name = 'River City HVAC' limit 1), 'Maintenance 2025', 'maintenance', null, 89.00, (select id from public.profiles limit 1))
on conflict do nothing;

-- Tasks (link to first 2 projects)
insert into public.tasks (project_id, title, status, priority, due_date, owner_id)
select p.id, t.title, t.status, t.priority, t.due_date, (select id from public.profiles limit 1)
from public.projects p,
 lateral (values
   ('Review mockup', 'todo', 'high', current_date::date),
   ('Send proposal', 'in_progress', 'medium', (current_date + 2)::date),
   ('Homepage copy', 'todo', 'medium', (current_date + 5)::date),
   ('Final review', 'todo', 'low', (current_date + 7)::date)
 ) as t(title, status, priority, due_date)
where p.name = 'Website redesign'
limit 4;

insert into public.tasks (project_id, title, status, priority, due_date, owner_id)
select p.id, 'Kickoff call', 'done', 'high', (current_date - 1)::date, (select id from public.profiles limit 1)
from public.projects p where p.name = 'New marketing site' limit 1;

insert into public.tasks (project_id, title, status, priority, due_date, owner_id)
select p.id, 'Build homepage', 'in_progress', 'critical', current_date::date, (select id from public.profiles limit 1)
from public.projects p where p.name = 'Landing page' limit 1;

insert into public.tasks (project_id, title, status, priority, due_date, owner_id)
select p.id, 'Monthly backup', 'todo', 'low', (current_date + 30)::date, (select id from public.profiles limit 1)
from public.projects p where p.name = 'Maintenance 2025' limit 1;

-- Payments
insert into public.payments (client_id, project_id, amount, status, payment_date, owner_id)
select c.id, p.id, 475.00, 'paid', (current_date - 7)::date, (select id from public.profiles limit 1)
from public.clients c
join public.projects p on p.client_id = c.id and p.name = 'Website redesign'
where c.business_name = 'Joe''s Coffee' limit 1;

insert into public.payments (client_id, project_id, amount, status, payment_date, owner_id)
select c.id, null, 89.00, 'paid', current_date::date, (select id from public.profiles limit 1)
from public.clients c where c.business_name = 'River City HVAC' limit 1;

insert into public.payments (client_id, project_id, amount, status, payment_date, owner_id)
select c.id, p.id, 500.00, 'pending', null, (select id from public.profiles limit 1)
from public.clients c
join public.projects p on p.client_id = c.id and p.name = 'Landing page'
where c.business_name = 'River City HVAC' limit 1;

insert into public.payments (client_id, project_id, amount, status, payment_date, owner_id)
select c.id, p.id, 600.00, 'pending', null, (select id from public.profiles limit 1)
from public.clients c
join public.projects p on p.client_id = c.id and p.name = 'New marketing site'
where c.business_name = 'ABC Roofing' limit 1;
