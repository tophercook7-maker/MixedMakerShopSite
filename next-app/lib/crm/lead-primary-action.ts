/**
 * Single best outreach action from stored fields only (fixed priority — no live Google).
 */
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import type { LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";

export type LeadPrimaryActionType = "email" | "facebook" | "phone" | "contact_form" | "open" | "research";

export type LeadPrimaryAction = {
  type: LeadPrimaryActionType;
  label: string;
  href?: string;
  value?: string;
  reason?: string;
  /** `tel` / `mailto` false; http(s) true */
  external?: boolean;
};

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function absoluteUrl(raw: string): string {
  const u = trim(raw);
  if (!u) return "";
  return u.startsWith("http") ? u : `https://${u}`;
}

function telHref(phone: string): string {
  const tel = phone.replace(/[^\d+]/g, "");
  if (!tel) return "";
  return tel.startsWith("+") ? `tel:${tel}` : `tel:${tel}`;
}

function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1")) {
    const x = d.slice(1);
    return `(${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
  }
  return raw.trim();
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
    const href = telHref(phone);
    if (href) {
      return {
        type: "phone",
        label: "Call",
        href,
        value: formatPhoneDisplay(phone),
        external: false,
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
    const href = telHref(phone);
    if (href) {
      return {
        type: "phone",
        label: "Call",
        href,
        value: formatPhoneDisplay(phone),
        external: false,
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
