import type { Lead, LeadStatus } from "@/lib/leads-data";

export const CRM_STORAGE_KEY = "mixedmakershop-crm-v2";

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CRM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(leads));
}

export function mergeDefaultLeads(existing: Lead[], defaults: Lead[]): Lead[] {
  const byId = new Map(existing.map((lead) => [lead.id, lead]));
  for (const lead of defaults) {
    if (!byId.has(lead.id)) byId.set(lead.id, lead);
  }
  return Array.from(byId.values());
}

export type LeadPriority = "new" | "followup" | "overdue" | "normal";

/** Queue hint: untouched new, follow-up status, or stale contact (2+ days, not closed). */
export function getLeadPriority(lead: Lead): LeadPriority {
  if (!lead.lastContacted && lead.status === "New") {
    return "new";
  }
  if (lead.status === "Follow-Up") {
    return "followup";
  }
  if (lead.lastContacted) {
    const last = new Date(lead.lastContacted);
    const now = new Date();
    if (!Number.isNaN(last.getTime())) {
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 2 && lead.status !== "Closed") {
        return "overdue";
      }
    }
  }
  return "normal";
}

export function getLeadColor(status: LeadStatus): string {
  switch (status) {
    case "New":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Messaged":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "Follow-Up":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "Closed":
      return "border-green-200 bg-green-50 text-green-700";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
  }
}

export function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

export function getTemplateSet(lead: Lead) {
  const category = lead.category.toLowerCase();

  if (category.includes("coffee")) {
    return {
      emailSubject: `Quick idea for ${lead.businessName}`,
      emailBody: `Hi,

I came across ${lead.businessName} while looking at local businesses in ${lead.location}, and I noticed you could benefit from a stronger website presence.

I build simple, clean websites for local businesses, and I put together a quick homepage idea to show what ${lead.businessName} could look like online.

No pressure at all — I just thought it might help you attract more customers and give people a better first impression when they search for you.

If you want, I can send it over.

Thanks,
Topher
MixedMakerShop`,
      smsInitial: `Hey! I came across ${lead.businessName} and made a quick website mockup idea for your business. No pressure at all — want me to send it over? - Topher, MixedMakerShop`,
      smsFollowUp: `Hey! Just checking back in. I made a quick homepage idea for ${lead.businessName} and wanted to see if you'd like me to send it over. - Topher`,
      facebookMessage: `Hey! I came across ${lead.businessName} and put together a quick website mockup idea for your business. No pressure at all — just thought it could help you get more customers online. Want me to send it over? - Topher, MixedMakerShop`,
    };
  }

  if (category.includes("pressure")) {
    return {
      emailSubject: `Quick website idea for ${lead.businessName}`,
      emailBody: `Hi,

I came across ${lead.businessName} while looking at local service businesses in ${lead.location}.

I build simple websites for businesses like yours, and I put together a quick homepage idea showing how your business could look online and help bring in more calls and jobs.

No pressure — I just thought it might be useful to show you.

Want me to send it over?

Thanks,
Topher
MixedMakerShop`,
      smsInitial: `Hey! I came across ${lead.businessName} and made a quick website mockup idea that could help you get more calls and jobs online. Want me to send it over? - Topher, MixedMakerShop`,
      smsFollowUp: `Hey! Just following up. I put together a quick website idea for ${lead.businessName} and thought it could really help your online presence. Want me to send it? - Topher`,
      facebookMessage: `Hey! I came across ${lead.businessName} and made a quick website mockup idea that could help you get more calls and jobs online. Want me to send it over? - Topher, MixedMakerShop`,
    };
  }

  return {
    emailSubject: `Quick idea for ${lead.businessName}`,
    emailBody: `Hi,

I came across ${lead.businessName} and noticed you don’t really have a full website set up.

I build simple, clean websites for local businesses, and I put together a quick homepage idea for your business to show what it could look like online.

No pressure at all — I just thought it might help you stand out more and get a few extra customers.

If you’d like, I can send it over.

Thanks,
Topher
MixedMakerShop`,
    smsInitial: `Hey! I came across ${lead.businessName} and noticed you don’t really have a full website set up. I made a quick homepage mockup idea for your business. Want me to send it over? - Topher, MixedMakerShop`,
    smsFollowUp: `Hey! Just following up — I made that quick website mockup idea for ${lead.businessName}. Want me to send it over? - Topher`,
    facebookMessage: `Hey! I came across ${lead.businessName} and noticed you don’t really have a full website set up. I made a quick homepage mockup idea for your business. Want me to send it over? - Topher, MixedMakerShop`,
  };
}

export function makeMailtoLink(lead: Lead): string {
  const t = getTemplateSet(lead);
  return `mailto:${lead.email ?? ""}?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(t.emailBody)}`;
}

export function makeSmsLink(lead: Lead, mode: "initial" | "followup" = "initial"): string {
  const t = getTemplateSet(lead);
  const phone = normalizePhone(lead.phone);
  const body = mode === "followup" ? t.smsFollowUp : t.smsInitial;
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export function sortLeads(leads: Lead[]): Lead[] {
  const order: Record<LeadStatus, number> = {
    New: 0,
    Messaged: 1,
    "Follow-Up": 2,
    Closed: 3,
  };

  return [...leads].sort((a, b) => {
    const statusDiff = order[a.status] - order[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.businessName.localeCompare(b.businessName);
  });
}
