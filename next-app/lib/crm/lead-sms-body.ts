/**
 * Prefilled SMS copy for CRM Text actions (stored fields + category niche scripts).
 */
import { getTemplateSet } from "@/lib/crm-utils";

const SMS_MAX_LEN = 200;

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

export function clampSmsBody(s: string): string {
  const t = s.trim();
  if (t.length <= SMS_MAX_LEN) return t;
  return `${t.slice(0, Math.max(0, SMS_MAX_LEN - 1))}…`;
}

export type LeadSmsBodyInput = {
  website: string;
  lead_tags: string[] | null | undefined;
  has_website: boolean | null | undefined;
  /** When set, selects niche script (see `getTemplateSet`). */
  category?: string | null;
  businessName?: string | null;
};

/** Prefilled SMS body text (plain string, not URL-encoded). */
export function buildLeadSmsBody(input: LeadSmsBodyInput): string {
  const { smsInitial } = getTemplateSet({
    category: input.category,
    businessName: input.businessName,
  });
  return clampSmsBody(smsInitial);
}
