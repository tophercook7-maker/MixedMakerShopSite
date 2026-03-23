/**
 * `sms:` / `tel:` href helpers (no CRM view imports — safe from leads-workflow-view).
 */
import { clampSmsBody } from "@/lib/crm/lead-sms-body";

function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1")) {
    const x = d.slice(1);
    return `(${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
  }
  return raw.trim();
}

/**
 * Strip non-digits; require at least 10 digits.
 * US: 10 national digits or 11 with leading 1 → sms:/tel: with +1…
 * Longer digit strings treated as international +digits.
 */
export function cleanPhoneForSmsAndTel(raw: string): {
  display: string;
  smsHref: string;
  telHref: string;
} | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;

  let national = digits;
  if (digits.length === 11 && digits.startsWith("1")) {
    national = digits.slice(1);
  }

  if (national.length === 10) {
    const e164 = `+1${national}`;
    const display = `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
    return {
      display,
      smsHref: `sms:${e164}`,
      telHref: `tel:${e164}`,
    };
  }

  const e164 = `+${digits}`;
  return {
    display: formatPhoneDisplay(raw),
    smsHref: `sms:${e164}`,
    telHref: `tel:${e164}`,
  };
}

/**
 * Append URL-encoded `body` to a plain `sms:…` href.
 */
export function appendEncodedSmsBody(smsHref: string, messageBody: string): string {
  const q = encodeURIComponent(clampSmsBody(messageBody));
  const sep = smsHref.includes("?") ? "&" : "?";
  return `${smsHref}${sep}body=${q}`;
}
