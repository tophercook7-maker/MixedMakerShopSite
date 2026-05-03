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
  | "follow_up"
  | "follow_up_due"
  | "replied"
  | "qualified"
  | "proposal_sent"
  | "won"
  | "lost"
  | "no_response"
  | "not_interested"
  | "archived"
  | "closed"
  | "closed_won"
  | "closed_lost"
  | "research_later"
  | "do_not_contact";
export type DealStatus = "none" | "interested" | "proposal_sent" | "won" | "lost";
export type DealStage = "new" | "interested" | "pricing" | "closing" | "won";
export type DoorStatus = "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost";
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
  source?: string | null;
  lead_source: string | null;
  source_url?: string | null;
  source_label?: string | null;
  workspace_id?: string | null;
  linked_opportunity_id?: string | null;
  best_contact_method?: string | null;
  contact_method?: string | null;
  category?: string | null;
  city?: string | null;
  lead_bucket?: string | null;
  is_manual?: boolean | null;
  known_owner_name?: string | null;
  known_context?: string | null;
  door_status?: DoorStatus | null;
  real_world_why_target?: string | null;
  real_world_walk_in_pitch?: string | null;
  best_time_to_visit?: string | null;
  last_updated_at?: string | null;
  is_recurring_client?: boolean | null;
  monthly_value?: number | null;
  subscription_started_at?: string | null;
  referred_by?: string | null;
  referral_source?: string | null;
  is_referred_client?: boolean | null;
  opportunity_score?: number | null;
  conversion_score?: number | null;
  score_breakdown?: Record<string, unknown> | null;
  auto_intake?: boolean;
  status: LeadStatus;
  deal_status?: DealStatus | null;
  deal_stage?: DealStage | null;
  deal_value?: number | null;
  closed_at?: string | null;
  sequence_active?: boolean | null;
  notes: string | null;
  follow_up_date: string | null;
  last_contacted_at?: string | null;
  follow_up_stage?: number | null;
  follow_up_status?: "pending" | "completed" | null;
  outreach_sent_at?: string | null;
  replied_at?: string | null;
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

export type ProjectStatus =
  | "draft"
  | "estimate_sent"
  | "deposit_requested"
  | "deposit_received"
  | "scheduled"
  | "in_progress"
  | "waiting_on_customer"
  | "completed"
  | "archived";
export type Project = {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  deadline: string | null;
  price: number | null;
  notes: string | null;
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
  | "scout"
  | "busy_block"
  | "reminder";
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
