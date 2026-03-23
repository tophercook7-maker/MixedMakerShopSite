import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import {
  computePrimaryLeadFolder,
  hasStandaloneSiteSignal,
  hasWeakWebsiteSignal,
  isGoodWebsiteSansClearOpportunity,
  workflowLeadToFolderInput,
} from "@/lib/crm/lead-buckets";
import { resolveLeadPrimaryAction } from "@/lib/crm/lead-primary-action";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";
import { leadHasContactPath } from "@/lib/crm/lead-lane";
import { buildLeadPath } from "@/lib/lead-route";

const DEFAULT_MAX = 6;

function trim(s: unknown): string {
  return String(s ?? "").trim();
}

function leadScore(lead: WorkflowLead): number {
  const c = Number(lead.conversion_score);
  if (Number.isFinite(c)) return c;
  const o = Number(lead.opportunity_score);
  if (Number.isFinite(o)) return o;
  return 0;
}

/**
 * Tiebreak: email > facebook > phone (higher is better).
 */
function contactChannelRank(lead: WorkflowLead): number {
  if (trim(lead.email)) return 3;
  if (trim(lead.facebook_url)) return 2;
  if (trim(lead.phone_from_site)) return 1;
  return 0;
}

export function isReadyToContactLead(lead: WorkflowLead): boolean {
  const bucket = lead.crm_lane ?? computePrimaryLeadFolder(workflowLeadToFolderInput(lead));
  return bucket === "ready_to_contact";
}

function terminalPipelineStage(lead: WorkflowLead): boolean {
  const s = normalizeWorkflowLeadStatus(lead.status);
  return s === "won" || s === "lost";
}

/** Prefer weak / missing site, direct email/phone, and clear outreach signals. */
function workNowQualityRank(lead: WorkflowLead): number {
  const input = workflowLeadToFolderInput(lead);
  let r = 0;
  if (hasWeakWebsiteSignal(input)) r += 45;
  if (!hasStandaloneSiteSignal(input)) r += 28;
  if (trim(lead.email)) r += 22;
  if (trim(lead.phone_from_site)) r += 18;
  if (trim(lead.facebook_url)) r += 10;
  if (trim(lead.contact_page)) r += 6;
  if (lead.is_hot_lead) r += 25;
  return r;
}

/**
 * Top leads in the ready_to_contact bucket for the "Work these now" strip.
 * Drops terminal rows, “good site / no reason” cases, and rows with no contact path / no primary action.
 * Sort: score, then quality heuristics, then email > facebook > phone.
 */
export function getTopWorkLeads(leads: WorkflowLead[], max: number = DEFAULT_MAX): WorkflowLead[] {
  const ready = leads.filter((lead) => {
    if (terminalPipelineStage(lead)) return false;
    if (!isReadyToContactLead(lead)) return false;
    if (isGoodWebsiteSansClearOpportunity(workflowLeadToFolderInput(lead))) return false;
    if (!leadHasContactPath({
      email: lead.email,
      phone: lead.phone_from_site,
      contact_page: lead.contact_page,
      facebook_url: lead.facebook_url,
    }))
      return false;
    const primary = resolveLeadPrimaryAction(lead, {
      workspaceHref: buildLeadPath(lead.id, lead.business_name),
    });
    if (primary.type === "research") return false;
    return true;
  });
  return [...ready]
    .sort((a, b) => {
      const ds = leadScore(b) - leadScore(a);
      if (ds !== 0) return ds;
      const dq = workNowQualityRank(b) - workNowQualityRank(a);
      if (dq !== 0) return dq;
      return contactChannelRank(b) - contactChannelRank(a);
    })
    .slice(0, max);
}

export type WorkLeadPrimaryKind = "email" | "facebook" | "phone" | "contact_form";

export type WorkLeadPrimaryAction = {
  kind: WorkLeadPrimaryKind;
  /** Button label */
  label: string;
  /** One-line hint, e.g. "Email → …" */
  detailLine: string;
  href: string;
  external: boolean;
};

function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1")) {
    const x = d.slice(1);
    return `(${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
  }
  return raw.trim();
}

function absoluteUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  return u.startsWith("http") ? u : `https://${u}`;
}

/**
 * Single primary outreach action for the strip (mailto, tel, or external URL).
 */
export function resolveWorkLeadPrimaryAction(lead: WorkflowLead): WorkLeadPrimaryAction | null {
  const email = trim(lead.email);
  const fb = trim(lead.facebook_url);
  const phone = trim(lead.phone_from_site);
  const contactPage = trim(lead.contact_page);
  const website = trim(lead.website);
  const bcm = trim(lead.best_contact_method).toLowerCase();

  const tryEmail = (): WorkLeadPrimaryAction | null =>
    email
      ? {
          kind: "email",
          label: "Email",
          detailLine: `Email → ${email}`,
          href: `mailto:${email}`,
          external: false,
        }
      : null;

  const tryFacebook = (): WorkLeadPrimaryAction | null => {
    if (!fb) return null;
    return {
      kind: "facebook",
      label: "Message",
      detailLine: "Facebook → Open page",
      href: absoluteUrl(fb),
      external: true,
    };
  };

  const tryPhone = (): WorkLeadPrimaryAction | null => {
    if (!phone) return null;
    const tel = phone.replace(/[^\d+]/g, "");
    return {
      kind: "phone",
      label: "Call",
      detailLine: `Phone → ${formatPhoneDisplay(phone)}`,
      href: tel.startsWith("+") ? `tel:${tel}` : `tel:${tel}`,
      external: false,
    };
  };

  const tryContactForm = (): WorkLeadPrimaryAction | null => {
    if (!contactPage) return null;
    return {
      kind: "contact_form",
      label: "Open form",
      detailLine: "Contact → Open form",
      href: absoluteUrl(contactPage),
      external: true,
    };
  };

  if (bcm === "email") {
    const x = tryEmail();
    if (x) return x;
  }
  if (bcm === "facebook") {
    const x = tryFacebook();
    if (x) return x;
  }
  if (bcm === "phone") {
    const x = tryPhone();
    if (x) return x;
  }
  if (bcm === "contact_form" || bcm === "contact_page") {
    const x = tryContactForm();
    if (x) return x;
  }
  if (bcm === "website" && website) {
    return {
      kind: "contact_form",
      label: "Open site",
      detailLine: "Website → Open site",
      href: absoluteUrl(website),
      external: true,
    };
  }

  // Fallback: email > facebook > phone > contact page
  return tryEmail() ?? tryFacebook() ?? tryPhone() ?? tryContactForm();
}

export function workTheseNowContextLine(lead: WorkflowLead): string {
  const city = trim(lead.city);
  const cat = trim(lead.category);
  const why = trim(lead.why_this_lead_is_here);
  if (city && cat) return `${city} · ${cat}`;
  if (city) return city;
  if (cat) return cat;
  if (why) return why.length > 72 ? `${why.slice(0, 69)}…` : why;
  return "—";
}
