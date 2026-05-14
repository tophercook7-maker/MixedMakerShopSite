import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import {
  sendEmergencyLeadNotificationEmail,
  sendLeadNotificationEmail,
} from "@/lib/crm/send-lead-notification-email";

const inboundSources = new Set([
  "captain_maker",
  "captain_maker_chat",
  "contact_form",
  "idea_lab",
  "quote_request",
  "ring_connect",
  "website_check",
  "ai_automation_inquiry",
  "digital_resource_request",
  "mockup_request",
  "print_request",
  "public_booking",
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
      form_submission_id: string | null;
      duplicate_skipped: boolean;
      duplicate_reason?: string | null;
      notification_sent: boolean;
      notification_error?: string;
    }
  | { ok: false; status: number; error: string; details?: unknown };

type InboundLeadSubmissionOptions = {
  requestId?: string;
};

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
    case "ai_automation_inquiry":
      return "AI automation inquiry";
    case "digital_resource_request":
      return "digital resource request";
    case "mockup_request":
      return "free website preview request";
    case "print_request":
      return "3D print request";
    case "public_booking":
      return "public booking request";
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

function envPresence() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY?.trim()),
    RESEND_AQPI_KEY_FALLBACK: Boolean(process.env.RESEND_AQPI_KEY?.trim()),
    RESEND_FROM_EMAIL: Boolean(process.env.RESEND_FROM_EMAIL?.trim()),
    BOOKING_FROM_EMAIL: Boolean(process.env.BOOKING_FROM_EMAIL?.trim()),
    LEAD_NOTIFY_EMAIL: Boolean(process.env.LEAD_NOTIFY_EMAIL?.trim()),
  };
}

async function sendEmergencyAndLog(opts: {
  requestId?: string;
  error: string;
  payload: unknown;
  context: string;
}) {
  const emergency = await sendEmergencyLeadNotificationEmail({
    requestId: opts.requestId,
    error: opts.error,
    payload: opts.payload,
  });
  if (!emergency.ok) {
    console.error("[inbound lead] emergency notification failed", {
      request_id: opts.requestId,
      context: opts.context,
      error: emergency.error,
      env_present: envPresence(),
    });
    return;
  }
  console.info("[inbound lead] emergency notification sent", {
    request_id: opts.requestId,
    context: opts.context,
  });
}

export async function handleInboundLeadSubmission(
  body: unknown,
  options: InboundLeadSubmissionOptions = {},
): Promise<InboundLeadSubmissionResult> {
  const requestId = options.requestId;
  console.info("[inbound lead] received public payload", {
    request_id: requestId,
    payload: body,
    env_present: envPresence(),
  });

  const parsed = inboundLeadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[inbound lead] validation failed", {
      request_id: requestId,
      details: parsed.error.flatten(),
    });
    await sendEmergencyAndLog({
      requestId,
      error: "Invalid public lead data.",
      payload: body,
      context: "validation_failed",
    });
    return { ok: false, status: 400, error: "Invalid lead data.", details: parsed.error.flatten() };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    await sendEmergencyAndLog({
      requestId,
      error: "Server CRM configuration missing.",
      payload: body,
      context: "missing_supabase_env",
    });
    return { ok: false, status: 500, error: "Server CRM configuration missing." };
  }

  const data = parsed.data;
  const source = normalizeInboundSource(data);
  const supabase = createClient(url, key);
  const { data: owner, error: ownerError } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  console.info("[inbound lead] owner profile lookup result", {
    request_id: requestId,
    owner_resolved: Boolean(owner?.id),
    owner_error: ownerError?.message || null,
  });
  if (ownerError || !owner?.id) {
    await sendEmergencyAndLog({
      requestId,
      error: ownerError?.message || "CRM owner could not be resolved.",
      payload: body,
      context: "owner_lookup_failed",
    });
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

  console.info("[inbound lead] lead insert result", {
    request_id: requestId,
    ok: crm.ok,
    lead_id: crm.ok ? crm.lead_id : null,
    duplicate_skipped: crm.ok ? crm.duplicate_skipped : null,
    error: crm.ok ? null : crm.error,
  });

  if (!crm.ok) {
    await sendEmergencyAndLog({
      requestId,
      error: crm.error,
      payload: body,
      context: "lead_insert_failed",
    });
    return { ok: false, status: 500, error: crm.error };
  }

  const { data: submissionRow, error: submissionError } = await supabase
    .from("form_submissions")
    .insert({
      form_type: source,
      name: data.name || data.contact_name || null,
      business_name: data.business_name || null,
      email: data.email,
      phone: data.phone || null,
      website,
      message: notes,
      owner_id: owner.id,
    })
    .select("id")
    .single();
  const formSubmissionId = submissionRow?.id ? String(submissionRow.id) : null;
  console.info("[inbound lead] form_submissions insert result", {
    request_id: requestId,
    ok: !submissionError,
    form_submission_id: formSubmissionId,
    error: submissionError?.message || null,
  });
  if (submissionError) {
    console.error("[inbound lead] form_submissions insert failed", submissionError);
    await sendEmergencyAndLog({
      requestId,
      error: `form_submissions insert failed: ${submissionError.message}`,
      payload: body,
      context: "form_submission_insert_failed_after_lead_save",
    });
  }

  const notification = await sendLeadNotificationEmail({
    leadId: crm.lead_id,
    formSubmissionId,
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
  console.info("[inbound lead] final result", {
    request_id: requestId,
    lead_id: crm.lead_id,
    form_submission_id: formSubmissionId,
    notification_sent: notification.ok,
  });

  return {
    ok: true,
    lead_id: crm.lead_id,
    form_submission_id: formSubmissionId,
    duplicate_skipped: crm.duplicate_skipped,
    duplicate_reason: "duplicate_reason" in crm ? crm.duplicate_reason : null,
    notification_sent: notification.ok,
    notification_error: notification.ok ? undefined : notification.error,
  };
}
