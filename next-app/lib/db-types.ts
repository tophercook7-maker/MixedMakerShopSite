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
  | "closed"
  | "closed_won"
  | "closed_lost"
  | "research_later"
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

export type EmailThreadStatus = "open" | "active" | "closed";
export type EmailThread = {
  id: string;
  workspace_id: string | null;
  lead_id: string | null;
  contact_email: string;
  subject: string | null;
  provider_thread_id: string | null;
  status: EmailThreadStatus;
  last_message_at: string | null;
  created_at: string;
  owner_id: string;
};

export type EmailDirection = "outbound" | "inbound";
export type EmailDeliveryStatus = "queued" | "sent" | "failed" | "received";
export type EmailMessage = {
  id: string;
  thread_id: string | null;
  lead_id: string | null;
  direction: EmailDirection;
  status?: "draft" | "queued" | "sent" | "failed" | "received" | string | null;
  generated_by?: string | null;
  provider_message_id: string | null;
  subject: string | null;
  body: string;
  delivery_status: EmailDeliveryStatus;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
  owner_id: string;
};

export type CalendarEventType =
  | "appointment"
  | "client_call"
  | "personal"
  | "followup"
  | "task"
  | "scout";
export type CalendarEvent = {
  id: string;
  workspace_id: string | null;
  lead_id: string | null;
  title: string;
  event_type: CalendarEventType;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  created_at: string;
  owner_id: string;
};
