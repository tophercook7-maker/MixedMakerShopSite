import type { SupabaseClient } from "@supabase/supabase-js";
import { runCrmLeadEnrichmentAfterSave } from "@/lib/crm/run-crm-lead-enrichment";
import { upsertCrmMockupForLead } from "@/lib/crm-mockup-upsert-server";
import { sendViaSmtp } from "@/lib/crm/smtp-notify";
import {
  buildPreviewShareEmailBodyWithGreeting,
  previewShareEmailSubject,
} from "@/lib/preview-share-copy";
import { recordLeadActivity } from "@/lib/lead-activity";

function truthyEnv(value: string | undefined, dflt: boolean): boolean {
  if (value == null || value.trim() === "") return dflt;
  return /^(1|true|yes|on)$/i.test(value.trim());
}

/**
 * Dedicated switch for inbound-lead autopilot. Deliberately independent of
 * MANUAL_ONLY_MODE so turning this on never wakes up other automation. Default OFF
 * — nothing changes until it's explicitly enabled.
 */
export function isInboundAutopilotEnabled(): boolean {
  return truthyEnv(process.env.INBOUND_AUTOPILOT, false);
}

/** Public origin for customer-facing preview links. */
export function siteOrigin(): string {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "https://mixedmakershop.com").replace(/\/$/, "");
}

function looksLikeEmail(value: string | null | undefined): boolean {
  const s = String(value || "").trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}

export type InboundAutopilotInput = {
  leadId: string;
  ownerId: string;
  customerEmail?: string | null;
  customerName?: string | null;
  businessName?: string | null;
  message?: string | null;
};

/**
 * Detect contact-form spam (bots pitching services TO Topher) so autopilot doesn't
 * auto-email them a preview from his own Gmail. The lead is still stored + he's still
 * notified — only the customer auto-reply is skipped.
 *
 * Calibrated on a real sample (Payoneer affiliate pitch w/ a partnerlinks.io link +
 * "book a demo" + "while browsing your website"). Keys ONLY on message content, a
 * link, and seller-pitch phrases — NEVER on "no website", because a business with no
 * website is Topher's ideal customer, not spam.
 */
export function looksLikeSpam(input: {
  message?: string | null;
  businessName?: string | null;
}): { isSpam: boolean; score: number; reasons: string[] } {
  // Strip structured form lines first — the lead's OWN website/business live on
  // "Website:" / "Business:" lines and must NOT count as spam links.
  const msg = String(input.message || "")
    .split(/\r?\n/)
    .filter((line) => !/^\s*(website|business|inbound source|phone|source)\s*:/i.test(line))
    .join("\n")
    .toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  // A link in the free-text body is the strongest single signal — real leads put their
  // site in the Website field (stripped above), not a URL in the "what do you need" box.
  if (/\bhttps?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}|[a-z0-9-]+\.(?:io|biz|link|xyz|top|click|info)\b/i.test(msg)) {
    score += 2;
    reasons.push("link in message");
  }

  // Seller-pitch phrases (someone selling TO him, not asking for his help).
  const PITCH = [
    "book a demo", "schedule a demo", "we've been helping", "we help businesses",
    "we help companies", "i work with", "our platform", "our service", "our team can",
    "reach out", "partnership", "collaborat", "backlink", "guest post", "rank higher",
    "rank #1", "first page of google guaranteed", "seo services", "digital marketing services",
    "lead generation service", "increase your traffic", "boost your sales", "grow your revenue",
    "global hiring", "payroll and compliance", "workforce management", "crypto", "bitcoin",
    "investment opportunity", "loan offer",
  ];
  const hits = PITCH.filter((p) => msg.includes(p));
  if (hits.length) {
    score += Math.min(2, hits.length);
    reasons.push(`pitch phrase: ${hits.slice(0, 3).join(", ")}`);
  }

  // Classic fake-personalization openers used by outreach bots.
  if (/i (found|came across|discovered) your (company|business|website)|while browsing your (website|site)/i.test(msg)) {
    score += 1;
    reasons.push("bot personalization opener");
  }

  return { isSpam: score >= 2, score, reasons };
}

/**
 * Background prep for a fresh inbound lead, in order:
 *   1. Enrich (scrape/score via Scout Brain; safe no-op if it isn't configured).
 *   2. Build the preview mockup (template-based — fast, free, deterministic).
 *   3. Auto-reply to the customer with their preview link.
 *
 * Fire-and-forget: every step is isolated in its own try/catch so a failure NEVER
 * affects the already-saved lead or the customer response. The customer email is
 * sent ONLY when a valid preview URL was produced AND the address looks real — so
 * we never email a broken link. Topher opted into the customer auto-reply explicitly.
 */
export async function runInboundAutopilot(
  supabase: SupabaseClient,
  input: InboundAutopilotInput,
): Promise<void> {
  const { leadId, ownerId } = input;

  // 1. Enrich — mutates the lead (category/website/score) before the mockup uses it.
  try {
    await runCrmLeadEnrichmentAfterSave(supabase, ownerId, leadId);
  } catch (e) {
    console.error("[inbound autopilot] enrich failed", e);
  }

  // 2. Build the preview mockup and get a public preview URL.
  let previewUrl = "";
  try {
    const m = await upsertCrmMockupForLead(supabase, ownerId, leadId, siteOrigin());
    if ("previewUrl" in m) {
      previewUrl = String(m.previewUrl || "").trim();
    } else {
      console.error("[inbound autopilot] mockup failed", m.error, m.reason);
    }
  } catch (e) {
    console.error("[inbound autopilot] mockup threw", e);
  }

  // 3. Customer auto-reply — guarded: real preview link + real email + not spam.
  const spam = looksLikeSpam({ message: input.message, businessName: input.businessName });
  if (spam.isSpam) {
    // Lead is already stored and Topher already notified — just don't email the bot.
    // Tag it so it's filterable in the CRM, and log why.
    try {
      const { data: row } = await supabase
        .from("leads")
        .select("lead_tags")
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .maybeSingle();
      const tags = Array.isArray((row as { lead_tags?: unknown[] } | null)?.lead_tags)
        ? ((row as { lead_tags: unknown[] }).lead_tags.map((t) => String(t)))
        : [];
      if (!tags.includes("suspected-spam")) {
        await supabase.from("leads").update({ lead_tags: [...tags, "suspected-spam"] })
          .eq("id", leadId).eq("owner_id", ownerId);
      }
    } catch (e) {
      console.error("[inbound autopilot] spam-tag failed", e);
    }
    void recordLeadActivity(supabase, {
      ownerId,
      leadId,
      eventType: "inbound_autopilot_spam_skipped",
      message: `Skipped customer auto-reply — suspected spam (${spam.reasons.join("; ")})`,
      meta: { score: spam.score, reasons: spam.reasons },
    });
    console.info("[inbound autopilot] spam — auto-reply skipped", { leadId, score: spam.score, reasons: spam.reasons });
    return;
  }

  if (previewUrl && looksLikeEmail(input.customerEmail)) {
    const to = String(input.customerEmail).trim();
    try {
      const sent = await sendViaSmtp({
        to,
        subject: previewShareEmailSubject(input.businessName),
        text: buildPreviewShareEmailBodyWithGreeting(previewUrl, input.customerName || ""),
      });
      if (sent.ok) {
        void recordLeadActivity(supabase, {
          ownerId,
          leadId,
          eventType: "inbound_autopilot_preview_sent",
          message: `Auto-sent website preview to ${to}`,
          meta: { previewUrl, via: sent.via },
        });
        console.info("[inbound autopilot] preview emailed", { leadId, to, via: sent.via });
      } else {
        console.error("[inbound autopilot] preview email failed", sent.error);
      }
    } catch (e) {
      console.error("[inbound autopilot] auto-reply threw", e);
    }
  } else {
    console.info("[inbound autopilot] auto-reply skipped", {
      leadId,
      hasPreview: Boolean(previewUrl),
      hasValidEmail: looksLikeEmail(input.customerEmail),
    });
  }
}
