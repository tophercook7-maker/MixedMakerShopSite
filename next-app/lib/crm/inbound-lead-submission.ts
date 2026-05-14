import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import { sendLeadNotificationEmail } from "@/lib/crm/send-lead-notification-email";

const inboundSources = new Set([
  "captain_maker",
  "captain_maker_chat",
  "contact_form",
  "idea_lab",
  "quote_request",
  "ring_connect",
  "website_check",
]);

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => {
      const trimmed = String(value || "").trim();
      return trimmed || undefined;
    });

export const inboundLeadSubmissionSchema = z
  .object({
    submission_type: z.literal("public_lead").optional(),
    form_type: optionalText(80),
    source: optionalText(80),
    lead_source: optionalText(80),
    name: optionalText(200),
    contact_name: optionalText(200),
    business_name: optionalText(200),
    email: z.string().email(),
    phone: optionalText(50),
    website: optionalText(500),
    category: optionalText(200),
    industry: optionalText(100),
    service_type: optionalText(80),
    message: optionalText(12000),
    notes: optionalText(12000),
    request: optionalText(12000),
    transcript: optionalText(12000),
    source_url: optionalText(2000),
    source_label: optionalText(200),
  })
  .superRefine((value, ctx) => {
    const source = normalizeInboundSource(value);
    if (!inboundSources.has(source)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unsupported inbound lead source.",
        path: ["source"],
      });
    }
    if (!value.message && !value.notes && !value.request && !value.transcript && !value.website) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Lead request details are required.",
        path: ["message"],
      });
    }
  });

export type InboundLeadSubmissionInput = z.infer<typeof inboundLeadSubmissionSchema>;

export type InboundLeadSubmissionResult =
  | {
      ok: true;
      lead_id: string;
      duplicate_skipped: boolean;
      duplicate_reason?: string | null;
      notification_sent: boolean;
      notification_error?: string;
    }
  | { ok: false; status: number; error: string; details?: unknown };

export function isInboundLeadSubmission(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  if (record.submission_type === "public_lead") return true;
  return inboundSources.has(normalizeInboundSource(record));
}

function normalizeInboundSource(value: Record<string, unknown>): string {
  return String(value.source || value.lead_source || value.form_type || "")
    .trim()
    .toLowerCase();
}

function sourceLabel(source: string): string {
  switch (source) {
    case "captain_maker":
    case "captain_maker_chat":
      return "Captain Maker chat";
    case "contact_form":
      return "public contact form";
    case "idea_lab":
      return "Idea Lab form";
    case "quote_request":
      return "quote request form";
    case "ring_connect":
      return "Ring/connect capture";
    case "website_check":
      return "free website check form";
    default:
      return "public lead submission";
  }
}

function defaultBusinessName(data: InboundLeadSubmissionInput, source: string): string {
  const explicit = data.business_name || data.name;
  if (explicit) return explicit;
  if (source === "website_check" && data.website) return `Website check - ${data.website}`;
  if (source === "captain_maker" || source === "captain_maker_chat") return "Captain Maker lead";
  return "Mixed Maker Shop lead";
}

function buildLeadNotes(data: InboundLeadSubmissionInput, source: string): string {
  const lines = [
    `Inbound source: ${sourceLabel(source)}`,
    data.request ? `Request:\n${data.request}` : "",
    data.message ? `Message:\n${data.message}` : "",
    data.notes ? `Notes:\n${data.notes}` : "",
    data.transcript ? `Captain Maker transcript:\n${data.transcript}` : "",
  ].filter(Boolean);
  return lines.join("\n\n").slice(0, 12000);
}

export async function handleInboundLeadSubmission(body: unknown): Promise<InboundLeadSubmissionResult> {
  const parsed = inboundLeadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "Invalid lead data.", details: parsed.error.flatten() };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { ok: false, status: 500, error: "Server CRM configuration missing." };
  }

  const data = parsed.data;
  const source = normalizeInboundSource(data);
  const supabase = createClient(url, key);
  const { data: owner, error: ownerError } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  if (ownerError || !owner?.id) {
    return { ok: false, status: 500, error: "CRM owner could not be resolved." };
  }

  const website = data.website || null;
  const notes = buildLeadNotes(data, source);
  const crm = await insertCanonicalInboundLead(supabase, owner.id, {
    business_name: defaultBusinessName(data, source),
    contact_name: data.contact_name || data.name || null,
    email: data.email,
    phone: data.phone ?? null,
    website,
    category: data.category || data.industry || null,
    industry: data.industry || data.category || null,
    service_type: data.service_type || null,
    notes,
    why_this_lead_is_here: `Submitted via ${sourceLabel(source)}`,
    source,
    lead_source: source,
    source_url: data.source_url,
    source_label: data.source_label,
    status: "new",
    lead_tags: ["inbound", source],
    has_website: website ? leadHasStandaloneWebsite(website) : false,
    last_updated_at: new Date().toISOString(),
  });

  if (!crm.ok) {
    return { ok: false, status: 500, error: crm.error };
  }

  const { error: submissionError } = await supabase.from("form_submissions").insert({
    form_type: source,
    name: data.name || data.contact_name || null,
    business_name: data.business_name || null,
    email: data.email,
    phone: data.phone || null,
    website,
    message: notes,
    owner_id: owner.id,
  });
  if (submissionError) {
    console.error("[inbound lead] form_submissions insert failed", submissionError);
  }

  const notification = await sendLeadNotificationEmail({
    leadId: crm.lead_id,
    duplicateSkipped: crm.duplicate_skipped,
    duplicateReason: "duplicate_reason" in crm ? crm.duplicate_reason : null,
    submission: data,
  });
  if (!notification.ok) {
    console.error("[inbound lead] notification email failed", {
      lead_id: crm.lead_id,
      source,
      error: notification.error,
    });
  }

  return {
    ok: true,
    lead_id: crm.lead_id,
    duplicate_skipped: crm.duplicate_skipped,
    duplicate_reason: "duplicate_reason" in crm ? crm.duplicate_reason : null,
    notification_sent: notification.ok,
    notification_error: notification.ok ? undefined : notification.error,
  };
}
