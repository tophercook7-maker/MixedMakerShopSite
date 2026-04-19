import { leadHasContactPath } from "@/lib/crm/lead-lane";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import type { WebCrmLane } from "@/lib/crm/web-lead-lane";

export type WebNextActionId =
  | "send_email"
  | "open_facebook"
  | "open_contact_form"
  | "text_lead"
  | "build_sample"
  | "send_follow_up"
  | "price_deal"
  | "mark_won"
  | "park_lead"
  | "review_manually";

export type WebNextAction = {
  id: WebNextActionId;
  label: string;
  reason: string;
  urgencyNote: string | null;
  primaryCtaLabel: string;
};

/** Minimal fields for deterministic next-action (keeps UI mapper decoupled). */
export type WebLeadActionContext = {
  hasEmail: boolean;
  hasPhone: boolean;
  hasFacebook: boolean;
  hasContactPage: boolean;
  hasWebsite: boolean;
  bestContactMethod: string;
  website: string;
  previewUrl: string | null;
  unreadReplyCount: number;
  followUpDueAt: string | null;
};

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function followUpOverdue(ctx: WebLeadActionContext): boolean {
  const at = ctx.followUpDueAt;
  if (!at) return false;
  const t = new Date(at).getTime();
  if (!Number.isFinite(t)) return false;
  return t < Date.now();
}

export function resolveWebNextAction(ctx: WebLeadActionContext, lane: WebCrmLane): WebNextAction {
  const hasEmail = ctx.hasEmail;
  const hasPhone = ctx.hasPhone;
  const hasFb = ctx.hasFacebook;
  const hasContactPage = ctx.hasContactPage;
  const hasSite = ctx.hasWebsite;
  const bcm = trim(ctx.bestContactMethod).toLowerCase();
  const unreplied = (ctx.unreadReplyCount ?? 0) > 0;

  const laneInput = {
    email: hasEmail ? "x" : "",
    phone: hasPhone ? "x" : "",
    website: ctx.website,
    facebook_url: hasFb ? "x" : "",
    contact_page: hasContactPage ? "x" : "",
    best_contact_method: ctx.bestContactMethod,
  };

  if (lane === "won") {
    return {
      id: "review_manually",
      label: "Won",
      reason: "This lead is marked won. Log any handoff notes if needed.",
      urgencyNote: null,
      primaryCtaLabel: "Review record",
    };
  }

  if (lane === "responded" || unreplied) {
    return {
      id: "send_email",
      label: "Reply to lead",
      reason: "Unread reply or conversation needs your response.",
      urgencyNote: "Reply while context is fresh.",
      primaryCtaLabel: hasEmail ? "Send email" : "Open conversation",
    };
  }

  if (lane === "sample_active") {
    return {
      id: "build_sample",
      label: "Sample / mockup",
      reason: "Mockup or preview is in motion — finish, send, or follow up.",
      urgencyNote: null,
      primaryCtaLabel: ctx.previewUrl ? "Open preview" : "Build sample",
    };
  }

  if (lane === "qualified_deal") {
    return {
      id: "price_deal",
      label: "Move deal forward",
      reason: "Pricing or closing conversation — keep momentum.",
      urgencyNote: null,
      primaryCtaLabel: "Price deal",
    };
  }

  if (lane === "waiting" || followUpOverdue(ctx)) {
    return {
      id: "send_follow_up",
      label: "Follow up",
      reason: followUpOverdue(ctx)
        ? "Follow-up is overdue."
        : "Waiting on them or a scheduled follow-up.",
      urgencyNote: followUpOverdue(ctx) ? "Overdue" : null,
      primaryCtaLabel: "Send follow-up",
    };
  }

  if (lane === "parked") {
    return {
      id: "review_manually",
      label: "Parked",
      reason: "Low priority or sidelined — reopen when timing improves.",
      urgencyNote: null,
      primaryCtaLabel: "Review",
    };
  }

  if (bcm === "facebook" || (hasFb && !hasEmail)) {
    return {
      id: "open_facebook",
      label: "Facebook outreach",
      reason: "Facebook is the strongest available path.",
      urgencyNote: null,
      primaryCtaLabel: "Open Facebook",
    };
  }

  if (bcm === "contact_form" || (hasContactPage && !hasEmail)) {
    return {
      id: "open_contact_form",
      label: "Contact form",
      reason: "Use the on-site contact path.",
      urgencyNote: null,
      primaryCtaLabel: "Open contact page",
    };
  }

  if (bcm === "text" || bcm === "phone" || hasPhone) {
    return {
      id: "text_lead",
      label: "Text or call",
      reason: "Phone is available for a fast touch.",
      urgencyNote: null,
      primaryCtaLabel: "Text lead",
    };
  }

  if (hasEmail) {
    return {
      id: "send_email",
      label: "Email outreach",
      reason: "Email is available for a clean first touch.",
      urgencyNote: null,
      primaryCtaLabel: "Send email",
    };
  }

  if (!leadHasContactPath(laneInput) && !hasSite) {
    return {
      id: "review_manually",
      label: "Needs research",
      reason: "No clear contact path yet — find email, phone, or Facebook.",
      urgencyNote: null,
      primaryCtaLabel: "Research lead",
    };
  }

  if (!leadHasStandaloneWebsite(ctx.website)) {
    return {
      id: "build_sample",
      label: "Show a sample",
      reason: "No solid website — a quick mockup can open the conversation.",
      urgencyNote: null,
      primaryCtaLabel: "Build sample",
    };
  }

  return {
    id: "review_manually",
    label: "Review lead",
    reason: "Choose the best channel and log what you tried.",
    urgencyNote: null,
    primaryCtaLabel: "Review manually",
  };
}
