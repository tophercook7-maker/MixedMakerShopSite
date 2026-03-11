export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

export type LeadStatus = "new" | "contacted" | "interested" | "proposal_sent" | "won" | "lost";
export type Lead = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  lead_source: string | null;
  status: LeadStatus;
  notes: string | null;
  follow_up_date: string | null;
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
