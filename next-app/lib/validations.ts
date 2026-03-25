import { z } from "zod";

const leadStatuses = [
  "new",
  "contacted",
  "follow_up",
  "replied",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
  "no_response",
  "not_interested",
  "archived",
  "follow_up_due",
  "closed",
  "closed_won",
  "closed_lost",
  "research_later",
  "do_not_contact",
] as const;
const dealStatuses = ["none", "interested", "proposal_sent", "won", "lost"] as const;
const dealStages = ["new", "interested", "pricing", "closing", "won"] as const;
const doorStatuses = ["not_visited", "planned", "visited", "follow_up", "closed_won", "closed_lost"] as const;
const printPipelineStatuses = [
  "new",
  "need_info",
  "quoted",
  "approved",
  "printing",
  "ready",
  "delivered",
  "closed",
] as const;
const projectStatuses = ["planning", "design", "development", "testing", "complete", "maintenance"] as const;
const taskStatuses = ["todo", "in_progress", "done"] as const;
const taskPriorities = ["low", "medium", "high", "critical"] as const;
const paymentStatuses = ["pending", "paid", "overdue"] as const;
const printLeadPaymentStatuses = [
  "unpaid",
  "deposit_requested",
  "partially_paid",
  "paid",
  "refunded",
] as const;
const printPaymentRequestTypes = ["deposit", "full"] as const;

/** ISO-ish timestamps: empty string → undefined; JSON `null` kept (PATCH clears column). */
const optionalTimestamp = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.union([z.string(), z.null()]).optional()
);

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name required").max(200),
  email: z.string().email(),
  message: z.string().min(1, "Message required").max(5000),
});

export const websiteCheckFormSchema = z.object({
  name: z.string().max(200).optional(),
  business_name: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
});

export const quoteFormSchema = z.object({
  name: z.string().min(1).max(200),
  business_name: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
});

export const leadSchema = z.object({
  business_name: z.string().min(1, "Business name required").max(200),
  contact_name: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  phone: z.string().max(50).optional().transform((v) => (v === "" ? undefined : v)),
  website: z.string().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  facebook_url: z.string().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  industry: z.string().max(100).optional().transform((v) => (v === "" ? undefined : v)),
  category: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  city: z.string().max(120).optional().transform((v) => (v === "" ? undefined : v)),
  address: z.string().max(300).optional().transform((v) => (v === "" ? undefined : v)),
  source: z.string().max(80).optional().transform((v) => (v === "" ? undefined : v)),
  lead_source: z.string().max(80).optional().transform((v) => (v === "" ? undefined : v)),
  source_url: z.string().max(2000).optional().transform((v) => (v === "" ? undefined : v)),
  source_label: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  status: z.enum(leadStatuses),
  deal_status: z.enum(dealStatuses).optional(),
  deal_stage: z.enum(dealStages).optional(),
  deal_value: z.number().min(0).optional(),
  closed_at: z.string().optional().transform((v) => (v === "" ? undefined : v)),
  replied_at: z.string().optional().transform((v) => (v === "" ? undefined : v)),
  outreach_sent_at: z.string().optional().transform((v) => (v === "" ? undefined : v)),
  contact_method: z.string().max(100).optional().transform((v) => (v === "" ? undefined : v)),
  lead_bucket: z.string().max(60).optional().transform((v) => (v === "" ? undefined : v)),
  is_manual: z.boolean().optional(),
  known_owner_name: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  known_context: z.string().max(2000).optional().transform((v) => (v === "" ? undefined : v)),
  door_status: z.enum(doorStatuses).optional(),
  real_world_why_target: z.string().max(4000).optional().transform((v) => (v === "" ? undefined : v)),
  real_world_walk_in_pitch: z.string().max(4000).optional().transform((v) => (v === "" ? undefined : v)),
  best_time_to_visit: z.string().max(120).optional().transform((v) => (v === "" ? undefined : v)),
  is_recurring_client: z.boolean().optional(),
  monthly_value: z.number().min(0).optional(),
  subscription_started_at: optionalTimestamp,
  referred_by: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  referral_source: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  is_referred_client: z.boolean().optional(),
  conversion_score: z.number().int().min(0).max(100).optional(),
  lead_tags: z.array(z.string().max(120)).max(80).optional(),
  score_breakdown: z.record(z.unknown()).optional(),
  sequence_active: z.boolean().optional(),
  notes: z.string().max(5000).optional().transform((v) => (v === "" ? undefined : v)),
  follow_up_date: optionalTimestamp,
  last_contacted_at: optionalTimestamp,
  follow_up_stage: z.number().int().min(0).max(3).optional().nullable(),
  next_follow_up_at: optionalTimestamp,
  follow_up_status: z.enum(["pending", "completed"]).optional(),
  last_outreach_channel: z.enum(["email", "facebook", "text"]).nullable().optional(),
  last_outreach_status: z.enum(["draft", "sending", "sent", "failed"]).optional(),
  last_outreach_sent_at: optionalTimestamp,
  preview_sent: z.boolean().optional(),
  email_sent: z.boolean().optional(),
  facebook_sent: z.boolean().optional(),
  text_sent: z.boolean().optional(),
  outreach_sent: z.boolean().optional(),
  preview_url: z.string().max(4000).optional().transform((v) => (v === "" ? undefined : v)),
  reply_note: z.string().max(2000).optional().transform((v) => (v === "" ? undefined : v)),
  is_hot_lead: z.boolean().optional(),
  automation_paused: z.boolean().optional(),
  last_reply_at: optionalTimestamp,
  last_reply_preview: z.string().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  print_attachment_url: z.string().max(4000).optional().transform((v) => (v === "" ? undefined : v)),
  print_estimate_summary: z.string().max(4000).optional().transform((v) => (v === "" ? undefined : v)),
  print_request_summary: z.string().max(2000).optional().transform((v) => (v === "" ? undefined : v)),
  print_pipeline_status: z.union([z.enum(printPipelineStatuses), z.null()]).optional(),
  print_request_type: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  print_tags: z.array(z.string().max(120)).max(80).optional(),
  print_material: z.string().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  print_dimensions: z.string().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  print_quantity: z.string().max(120).optional().transform((v) => (v === "" ? undefined : v)),
  print_deadline: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  print_design_help_requested: z.boolean().optional().nullable(),
  price_charged: z.number().min(0).optional().nullable(),
  filament_cost: z.number().min(0).optional().nullable(),
  filament_grams_used: z.number().min(0).max(1_000_000).optional().nullable(),
  filament_cost_per_kg: z.number().min(0).max(1_000_000).optional().nullable(),
  filament_use_weight_calc: z.boolean().optional().nullable(),
  estimated_time_hours: z.number().min(0).optional().nullable(),
  print_timer_started_at: optionalTimestamp,
  print_timer_running: z.boolean().optional().nullable(),
  print_tracked_minutes: z.number().int().min(0).max(999_999).optional().nullable(),
  print_manual_time_minutes: z.number().int().min(0).max(999_999).optional().nullable(),
  quoted_amount: z.number().min(0).optional().nullable(),
  deposit_amount: z.number().min(0).optional().nullable(),
  final_amount: z.number().min(0).optional().nullable(),
  payment_request_type: z.union([z.enum(printPaymentRequestTypes), z.null()]).optional(),
  payment_status: z.union([z.enum(printLeadPaymentStatuses), z.null()]).optional(),
  payment_method: z.string().max(40).optional().transform((v) => (v === "" ? undefined : v)),
  payment_link: z.string().max(4000).optional().transform((v) => (v === "" ? undefined : v)),
  paid_at: optionalTimestamp,
  last_response_at: optionalTimestamp,
  unread_reply_count: z.number().int().min(0).optional().nullable(),
  recommended_next_action: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
});

export const clientSchema = z.object({
  business_name: z.string().min(1, "Business name required").max(200),
  contact_name: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal("")),
  hosting_provider: z.string().max(100).optional(),
  maintenance_plan: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const projectSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1, "Project name required").max(200),
  status: z.enum(projectStatuses),
  deadline: z.string().optional(),
  price: z.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
});

export const taskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1, "Title required").max(300),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  due_date: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const paymentSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional().nullable(),
  amount: z.number().min(0),
  status: z.enum(paymentStatuses),
  payment_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type WebsiteCheckFormInput = z.infer<typeof websiteCheckFormSchema>;
export type QuoteFormInput = z.infer<typeof quoteFormSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
