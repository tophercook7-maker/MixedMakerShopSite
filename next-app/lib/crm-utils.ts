/**
 * Hardcoded first-touch outreach scripts by lead category (no AI).
 * Strategy: curiosity and reply — no mockups, no “already built” claims.
 *
 * Also: local CRM dashboard helpers (localStorage, mailto/sms links, sort/merge).
 */

import type { Lead, LeadStatus } from "@/lib/leads-data";

export type OutreachScriptNiche = "landscaping" | "service" | "coffee" | "default";

export type OutreachTemplateSet = {
  niche: OutreachScriptNiche;
  emailSubject: string;
  emailBody: string;
  smsInitial: string;
  smsFollowUp: string;
  facebookMessage: string;
};

function normalizeCategory(category: string | null | undefined): string {
  return String(category || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Order: landscaping → coffee → service → default (specific before broad “service”). */
export function resolveOutreachScriptNiche(category: string | null | undefined): OutreachScriptNiche {
  const c = normalizeCategory(category);

  if (
    c.includes("landscaping") ||
    c.includes("lawn care") ||
    c.includes("landscape") ||
    /\blawn\b/.test(c)
  ) {
    return "landscaping";
  }

  if (c.includes("coffee") || c.includes("cafe")) {
    return "coffee";
  }

  if (
    c.includes("pressure") ||
    c.includes("washing") ||
    c.includes("handyman") ||
    c.includes("odd jobs") ||
    c.includes("contractor") ||
    c.includes("service") ||
    c.includes("repair")
  ) {
    return "service";
  }

  return "default";
}

/** Short label for CRM cards (optional UI). */
export function outreachScriptLabel(niche: OutreachScriptNiche): string {
  switch (niche) {
    case "landscaping":
      return "Landscaping";
    case "service":
      return "Service";
    case "coffee":
      return "Coffee";
    default:
      return "Default";
  }
}

function fillBusinessName(businessName: string | null | undefined, text: string): string {
  const n = String(businessName || "").trim();
  const display = n || "your business";
  return text.replace(/\{\{\s*businessName\s*\}\}/g, display);
}

const RAW: Record<OutreachScriptNiche, Omit<OutreachTemplateSet, "niche">> = {
  landscaping: {
    emailSubject: "Quick question about {{businessName}}",
    emailBody: `I came across {{businessName}} and wanted to ask a quick question.

Are you getting most of your jobs through Facebook right now, or do you have a website helping bring in work too?

I help local businesses get more calls and jobs online with simple, clean websites.

If that is something you have thought about, I would be glad to talk.

Thanks,
Topher
MixedMakerShop`,
    smsInitial:
      "Quick question — are you getting most of your jobs through Facebook right now, or do you have a website helping bring in work too?",
    smsFollowUp:
      "Just following up on my last message — are you mainly getting jobs through Facebook right now, or are people finding you somewhere else too?",
    facebookMessage: `I came across {{businessName}} and wanted to ask a quick question.

Are you getting most of your jobs through Facebook right now, or do you have a website helping bring in work too?

I help local businesses get more calls and jobs online with simple, clean websites. If that is something you have thought about, I would be glad to talk.`,
  },
  service: {
    emailSubject: "Quick question about {{businessName}}",
    emailBody: `I came across {{businessName}} and wanted to ask a quick question.

When people need your services, are they mostly finding you through Facebook right now, or somewhere else?

I help local service businesses get more calls and jobs online with simple websites that make it easy for people to reach out.

If that is something you would be open to, I would be glad to talk.

Thanks,
Topher
MixedMakerShop`,
    smsInitial:
      "Quick question — when people need your services, are they mostly finding you through Facebook right now, or somewhere else?",
    smsFollowUp:
      "Just checking back in — when people need your services, are they mostly finding you through Facebook, or somewhere else?",
    facebookMessage: `I came across {{businessName}} and wanted to ask a quick question.

When people need your services, are they mostly finding you through Facebook right now, or somewhere else?

I help local service businesses get more calls and jobs online with simple websites that make it easy for people to reach out. If you would ever like to talk about that, I would be glad to.`,
  },
  coffee: {
    emailSubject: "Quick question about {{businessName}}",
    emailBody: `I was checking out {{businessName}} and wanted to ask a quick question.

Do you have a website for your shop, or are you mostly using Facebook right now?

A simple site with your menu, hours, location, and contact info can make a big difference for people finding you.

If that is something you would be interested in, I would be glad to talk.

Thanks,
Topher
MixedMakerShop`,
    smsInitial: "Quick question — do you have a website for your shop, or are you mostly using Facebook right now?",
    smsFollowUp:
      "Just following up — do you have a website for your shop right now, or are you mostly using Facebook?",
    facebookMessage: `I was checking out {{businessName}} and wanted to ask a quick question.

Do you have a website for your shop, or are you mostly using Facebook right now?

A simple site with your menu, hours, location, and contact info can make a big difference for people finding you. If you would like, I would be glad to talk.`,
  },
  default: {
    emailSubject: "Quick question about {{businessName}}",
    emailBody: `I came across {{businessName}} and wanted to ask a quick question.

Are you mainly using Facebook right now to bring in customers, or do you have a website helping with that too?

I help local businesses get more customers online with simple, clean websites.

If that is something you have thought about, I would be glad to talk.

Thanks,
Topher
MixedMakerShop`,
    smsInitial:
      "Quick question — are you mainly using Facebook right now to bring in customers, or do you have a website helping with that too?",
    smsFollowUp:
      "Just following up — are you mainly using Facebook right now to bring in customers, or do you have a website helping with that too?",
    facebookMessage: `I came across {{businessName}} and wanted to ask a quick question.

Are you mainly using Facebook right now to bring in customers, or do you have a website helping with that too?

I help local businesses get more customers online with simple, clean websites. If that is something you have thought about, I would be glad to talk.`,
  },
};

export type TemplateSetLeadInput = {
  businessName?: string | null;
  category?: string | null;
};

export function getTemplateSet(lead: TemplateSetLeadInput): OutreachTemplateSet {
  const niche = resolveOutreachScriptNiche(lead.category);
  const raw = RAW[niche];
  const name = lead.businessName;
  return {
    niche,
    emailSubject: fillBusinessName(name, raw.emailSubject),
    emailBody: fillBusinessName(name, raw.emailBody),
    smsInitial: fillBusinessName(name, raw.smsInitial),
    smsFollowUp: fillBusinessName(name, raw.smsFollowUp),
    facebookMessage: fillBusinessName(name, raw.facebookMessage),
  };
}

// ——— Local CRM (browser dashboard) ———

const LOCAL_CRM_STORAGE_KEY = "mixedmaker-local-crm-leads-v1";

const STATUS_SORT_ORDER: Record<LeadStatus, number> = {
  New: 0,
  Messaged: 1,
  "Follow-Up": 2,
  Closed: 3,
};

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Local calendar date `YYYY-MM-DD` (not UTC). */
export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getLeadColor(status: LeadStatus): string {
  switch (status) {
    case "New":
      return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200";
    case "Messaged":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200";
    case "Follow-Up":
      return "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-200";
    case "Closed":
      return "border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
  }
}

export function loadLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CRM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is Lead => isLeadShape(x));
  } catch {
    return [];
  }
}

const LEAD_STATUSES: readonly LeadStatus[] = ["New", "Messaged", "Follow-Up", "Closed"];

function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === "string" && (LEAD_STATUSES as readonly string[]).includes(v);
}

function isLeadShape(v: unknown): v is Lead {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.businessName === "string" &&
    typeof o.category === "string" &&
    typeof o.location === "string" &&
    isLeadStatus(o.status) &&
    typeof o.createdAt === "string"
  );
}

export function saveLeads(leads: Lead[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_CRM_STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // ignore quota / private mode
  }
}

/** Keep stored leads; append default seed rows the user does not already have (by id). */
export function mergeDefaultLeads(stored: Lead[], defaults: Lead[]): Lead[] {
  const byId = new Map(stored.map((l) => [l.id, l]));
  for (const d of defaults) {
    if (!byId.has(d.id)) {
      byId.set(d.id, d);
    }
  }
  return Array.from(byId.values());
}

export function sortLeads(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const byStatus = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function makeMailtoLink(lead: Lead): string {
  const email = String(lead.email || "").trim();
  const t = getTemplateSet(lead);
  const subject = encodeURIComponent(t.emailSubject);
  const body = encodeURIComponent(t.emailBody);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function makeSmsLink(lead: Lead, kind: "initial" | "followup"): string {
  const phone = String(lead.phone || "").trim();
  const t = getTemplateSet(lead);
  const message = kind === "initial" ? t.smsInitial : t.smsFollowUp;
  const body = encodeURIComponent(message);
  return `sms:${phone}?body=${body}`;
}
