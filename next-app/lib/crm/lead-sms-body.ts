/**
 * Prefilled SMS copy for CRM Text actions (stored fields only; no leads-workflow-view import).
 */
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";

const SMS_BODY_DEFAULT =
  "Hey, this is Topher with MixedMakerShop. I came across your business and noticed you may need help with your website. If you want, I can send over a quick idea.";

const SMS_BODY_NO_OR_NON_STANDALONE_SITE =
  "Hey, this is Topher with MixedMakerShop. I came across your business and noticed you may not have a website yet. I help businesses get more calls with simple sites. Want me to send a quick idea?";

const SMS_BODY_WEAK_SITE =
  "Hey, this is Topher with MixedMakerShop. I came across your business and noticed your website could work harder for you. I help businesses get more calls with simple improvements. Want me to send a quick idea?";

const SMS_MAX_LEN = 200;

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

export function clampSmsBody(s: string): string {
  const t = s.trim();
  if (t.length <= SMS_MAX_LEN) return t;
  return `${t.slice(0, Math.max(0, SMS_MAX_LEN - 1))}…`;
}

function tagsIndicateWeakWebsite(tags: string[] | null | undefined): boolean {
  return (tags || []).some((t) => String(t || "").trim().toLowerCase() === "weak_website");
}

export type LeadSmsBodyInput = {
  website: string;
  lead_tags: string[] | null | undefined;
  has_website: boolean | null | undefined;
};

function pickSmsBodyText(input: LeadSmsBodyInput): string {
  if (tagsIndicateWeakWebsite(input.lead_tags)) return clampSmsBody(SMS_BODY_WEAK_SITE);
  const web = trim(input.website);
  if (input.has_website === false) return clampSmsBody(SMS_BODY_NO_OR_NON_STANDALONE_SITE);
  if (!web || !leadHasStandaloneWebsite(web)) return clampSmsBody(SMS_BODY_NO_OR_NON_STANDALONE_SITE);
  return clampSmsBody(SMS_BODY_DEFAULT);
}

/** Prefilled SMS body text (plain string, not URL-encoded). */
export function buildLeadSmsBody(input: LeadSmsBodyInput): string {
  return pickSmsBodyText(input);
}
