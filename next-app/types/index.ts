export type Lead = {
  id: string;
  form_submission_id?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  status: "new" | "contacted" | "replied" | "no_response" | "not_interested" | "won" | "archived";
  source?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Client = {
  id: string;
  lead_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Project = {
  id: string;
  client_id?: string | null;
  name: string;
  status: "planning" | "design" | "development" | "testing" | "complete" | "maintenance";
  price_cents?: number | null;
  deadline?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Task = {
  id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "critical";
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Payment = {
  id: string;
  client_id?: string | null;
  project_id?: string | null;
  amount_cents: number;
  status: "pending" | "paid" | "overdue";
  payment_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};
