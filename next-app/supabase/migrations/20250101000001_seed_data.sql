-- Seed data (run only in development; use service role)
-- Example leads
insert into public.leads (name, email, phone, message, status, source)
values
  ('Jane Doe', 'jane@example.com', '555-0101', 'Interested in a small business website.', 'new', 'contact'),
  ('Acme Co', 'hello@acme.com', null, 'Website check requested.', 'contacted', 'website_check');

-- Example client
insert into public.clients (name, email, company)
values ('Jane Doe', 'jane@example.com', 'Jane Design Co');

-- Example project
insert into public.projects (name, status, price_cents, deadline)
values ('Marketing site redesign', 'design', 95000, current_date + 30);

-- Example tasks
insert into public.tasks (title, status, priority, due_date)
values
  ('Review homepage mockup', 'todo', 'high', current_date),
  ('Send proposal', 'in_progress', 'medium', current_date + 2);

-- Example payment
insert into public.payments (amount_cents, status, payment_date)
values (95000, 'paid', current_date - 7);
