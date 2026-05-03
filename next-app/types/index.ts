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
  status:
    | "draft"
    | "estimate_sent"
    | "deposit_requested"
    | "deposit_received"
    | "scheduled"
    | "in_progress"
    | "waiting_on_customer"
    | "completed"
    | "archived";
  price_cents?: number | null;
  deadline?: string | null;
  notes?: string | null;
  estimated_price?: number | null;
  deposit_amount?: number | null;
  amount_paid?: number | null;
  payment_status?: string | null;
  amount_paid_updated_at?: string | null;
  payment_method?: string | null;
  scheduled_start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  internal_notes?: string | null;
  action_checklist?: Record<string, boolean> | null;
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
