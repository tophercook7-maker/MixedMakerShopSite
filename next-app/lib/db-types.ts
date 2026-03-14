export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up_due"
  | "replied"
  | "closed_won"
  | "closed_lost"
  | "do_not_contact";
export type Lead = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address?: string | null;
  place_id?: string | null;
  industry: string | null;
  lead_source: string | null;
  workspace_id?: string | null;
  linked_opportunity_id?: string | null;
  best_contact_method?: string | null;
  opportunity_score?: number | null;
  auto_intake?: boolean;
  status: LeadStatus;
  notes: string | null;
  follow_up_date: string | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  follow_up_count?: number;
  created_at: string;
  owner_id: string;
};

export type Client = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  hosting_provider: string | null;
  maintenance_plan: string | null;
  notes: string | null;
  created_at: string;
  owner_id: string;
};

export type ProjectStatus = "planning" | "design" | "development" | "testing" | "complete" | "maintenance";
export type Project = {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  deadline: string | null;
  price: number | null;
  notes: string | null;
  created_at: string;
  owner_id: string;
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type Task = {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  owner_id: string;
};

export type PaymentStatus = "pending" | "paid" | "overdue";
export type Payment = {
  id: string;
  client_id: string;
  project_id: string | null;
  amount: number;
  status: PaymentStatus;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  owner_id: string;
};

export type FormSubmission = {
  id: string;
  form_type: string;
  name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  message: string | null;
  created_at: string;
  owner_id: string | null;
};
