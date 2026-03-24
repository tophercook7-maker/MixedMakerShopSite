/**
 * Hardcoded first-touch outreach scripts by lead category (no AI).
 * Strategy: curiosity and reply — no mockups, no “already built” claims.
 */

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
