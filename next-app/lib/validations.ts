import { z } from "zod";

const leadStatuses = [
  "new",
  "contacted",
  "follow_up_due",
  "replied",
  "closed_won",
  "closed_lost",
  "do_not_contact",
] as const;
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
  lead_source: z.string().max(50).optional().transform((v) => (v === "" ? undefined : v)),
  status: z.enum(leadStatuses),
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
