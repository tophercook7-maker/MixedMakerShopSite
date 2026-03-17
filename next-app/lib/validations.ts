import { z } from "zod";

const leadStatuses = [
  "new",
  "contacted",
  "follow_up_due",
  "replied",
  "no_response",
  "closed",
  "closed_won",
  "closed_lost",
  "research_later",
  "do_not_contact",
] as const;
const dealStatuses = ["none", "interested", "proposal_sent", "won", "lost"] as const;
const doorStatuses = ["not_visited", "planned", "visited", "follow_up", "closed_won", "closed_lost"] as const;
const projectStatuses = ["planning", "design", "development", "testing", "complete", "maintenance"] as const;
const taskStatuses = ["todo", "in_progress", "done"] as const;
const taskPriorities = ["low", "medium", "high", "critical"] as const;
const paymentStatuses = ["pending", "paid", "overdue"] as const;

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
  industry: z.string().max(100).optional().transform((v) => (v === "" ? undefined : v)),
  category: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  city: z.string().max(120).optional().transform((v) => (v === "" ? undefined : v)),
  address: z.string().max(300).optional().transform((v) => (v === "" ? undefined : v)),
  lead_source: z.string().max(50).optional().transform((v) => (v === "" ? undefined : v)),
  status: z.enum(leadStatuses),
  deal_status: z.enum(dealStatuses).optional(),
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
  subscription_started_at: z.string().optional().transform((v) => (v === "" ? undefined : v)),
  referred_by: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  referral_source: z.string().max(200).optional().transform((v) => (v === "" ? undefined : v)),
  is_referred_client: z.boolean().optional(),
  conversion_score: z.number().int().min(0).max(100).optional(),
  score_breakdown: z.record(z.unknown()).optional(),
  sequence_active: z.boolean().optional(),
  notes: z.string().max(5000).optional().transform((v) => (v === "" ? undefined : v)),
  follow_up_date: z.string().optional().transform((v) => (v === "" ? undefined : v)),
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
