/**
 * Single best outreach action from stored fields only (fixed priority — no live Google).
 */
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { appendEncodedSmsBody, cleanPhoneForSmsAndTel } from "@/lib/crm/lead-phone-link";
import { buildLeadSmsBody } from "@/lib/crm/lead-sms-body";
import type { LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";

export { appendEncodedSmsBody, cleanPhoneForSmsAndTel } from "@/lib/crm/lead-phone-link";
export { buildLeadSmsBody, type LeadSmsBodyInput } from "@/lib/crm/lead-sms-body";

/** Prefilled SMS copy for CRM Text action (stored fields + niche scripts). */
export function buildLeadSmsMessage(
  lead: Pick<WorkflowLead, "website" | "lead_tags" | "has_website" | "category" | "business_name">
): string {
  return buildLeadSmsBody({
    website: trim(lead.website),
    lead_tags: lead.lead_tags,
    has_website: lead.has_website,
    category: lead.category,
    businessName: lead.business_name,
  });
}

export function buildLeadSmsMessageFromRow(
  row: Pick<LeadRowForWorkflow, "website" | "lead_tags" | "has_website" | "category" | "business_name">
): string {
  return buildLeadSmsBody({
    website: String(row.website || ""),
    lead_tags: row.lead_tags,
    has_website: row.has_website,
    category: row.category,
    businessName: row.business_name,
  });
}

export type LeadPrimaryActionType =
  | "email"
  | "facebook"
  | "sms"
  | "phone"
  | "contact_form"
  | "open"
  | "research";

export type LeadPrimaryActionSecondary = {
  type: "phone";
  label: string;
  href: string;
  value?: string;
};

export type LeadPrimaryAction = {
  type: LeadPrimaryActionType;
  label: string;
  href?: string;
  value?: string;
  reason?: string;
  /** `tel` / `mailto` / `sms` false; http(s) true */
  external?: boolean;
  /** When primary is Text (sms), optional Call (tel) link */
  secondary?: LeadPrimaryActionSecondary;
};

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function absoluteUrl(raw: string): string {
  const u = trim(raw);
  if (!u) return "";
  return u.startsWith("http") ? u : `https://${u}`;
}

export type ResolveLeadPrimaryActionOptions = {
  /** When no email/phone/facebook/form/site, use this for `research` (e.g. lead workspace path). */
  workspaceHref?: string;
};

export function resolveLeadPrimaryAction(
  lead: WorkflowLead,
  opts?: ResolveLeadPrimaryActionOptions
): LeadPrimaryAction {
  const email = trim(lead.email);
  if (email) {
    return {
      type: "email",
      label: "Email",
      href: `mailto:${email}`,
      value: email,
      external: false,
    };
  }

  const fb = trim(lead.facebook_url);
  if (fb) {
    const href = absoluteUrl(fb);
    return {
      type: "facebook",
      label: "Message",
      href,
      value: href,
      external: true,
    };
  }

  const phone = trim(lead.phone_from_site);
  if (phone) {
    const links = cleanPhoneForSmsAndTel(phone);
    if (links) {
      const body = buildLeadSmsMessage(lead);
      return {
        type: "sms",
        label: "Text",
        href: appendEncodedSmsBody(links.smsHref, body),
        value: links.display,
        external: false,
        secondary: {
          type: "phone",
          label: "Call",
          href: links.telHref,
          value: links.display,
        },
      };
    }
  }

  const contactPage = trim(lead.contact_page);
  if (contactPage) {
    const href = absoluteUrl(contactPage);
    return {
      type: "contact_form",
      label: "Open form",
      href,
      value: href,
      external: true,
    };
  }

  const website = trim(lead.website);
  if (website) {
    const href = absoluteUrl(website);
    return {
      type: "open",
      label: "Open site",
      href,
      value: href,
      external: true,
    };
  }

  return {
    type: "research",
    label: "Research",
    href: opts?.workspaceHref,
    reason: "No direct contact path in saved fields.",
    external: false,
  };
}

export function resolveLeadPrimaryActionFromRow(
  row: LeadRowForWorkflow,
  opts?: ResolveLeadPrimaryActionOptions
): LeadPrimaryAction {
  const email = trim(row.email);
  if (email) {
    return {
      type: "email",
      label: "Email",
      href: `mailto:${email}`,
      value: email,
      external: false,
    };
  }

  const fb = trim(row.facebook_url);
  if (fb) {
    const href = absoluteUrl(fb);
    return {
      type: "facebook",
      label: "Message",
      href,
      value: href,
      external: true,
    };
  }

  const phone = trim(row.phone);
  if (phone) {
    const links = cleanPhoneForSmsAndTel(phone);
    if (links) {
      const body = buildLeadSmsMessageFromRow(row);
      return {
        type: "sms",
        label: "Text",
        href: appendEncodedSmsBody(links.smsHref, body),
        value: links.display,
        external: false,
        secondary: {
          type: "phone",
          label: "Call",
          href: links.telHref,
          value: links.display,
        },
      };
    }
  }

  const contactPage = trim(row.contact_page);
  if (contactPage) {
    const href = absoluteUrl(contactPage);
    return {
      type: "contact_form",
      label: "Open form",
      href,
      value: href,
      external: true,
    };
  }

  const website = trim(row.website);
  if (website) {
    const href = absoluteUrl(website);
    return {
      type: "open",
      label: "Open site",
      href,
      value: href,
      external: true,
    };
  }

  return {
    type: "research",
    label: "Research",
    href: opts?.workspaceHref,
    reason: "No direct contact path in saved fields.",
    external: false,
  };
}

/** One-line hint under the business name (Work these now, etc.). */
export function leadPrimaryActionDetailLine(action: LeadPrimaryAction): string {
  switch (action.type) {
    case "email":
      return action.value ? `Email → ${action.value}` : "Email";
    case "facebook":
      return "Facebook → Open page";
    case "sms":
      return action.value ? `Text → ${action.value}` : "Text";
    case "phone":
      return action.value ? `Phone → ${action.value}` : "Call";
    case "contact_form":
      return "Contact → Open form";
    case "open":
      return "Website → Open site";
    case "research":
      return "Research in workspace";
    default:
      return "—";
  }
}

/** Short card line in Facebook No-Website Reachable mode. */
export function leadPrimaryActionHintLine(action: LeadPrimaryAction): string {
  switch (action.type) {
    case "email":
      return "Best action: Email";
    case "facebook":
      return "Best action: Message on Facebook";
    case "sms":
      return "Best action: Text";
    case "phone":
      return "Best action: Call";
    case "contact_form":
      return "Best action: Open contact form";
    case "open":
      return "Best action: Open site";
    case "research":
      return "Best action: Research";
    default:
      return "Best action: Research";
  }
}
