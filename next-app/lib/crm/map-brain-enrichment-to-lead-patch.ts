/**
 * Maps Scout Brain `enriched_lead` → CRM `leads` patch fields (pre–pickLeadPatchFields).
 * CRM columns: `email` / `phone` (not primary_contact_*).
 * Conservative: fill missing / weak only; merge tags; raise scores only; no FB over real site.
 */
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { isValidFacebookBusinessUrl } from "@/lib/crm/facebook-no-website-reachable";
import { normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import type { ScoutBrainEnrichedLead } from "@/lib/crm/scout-brain-enrichment";

function trimStr(v: unknown): string {
  return String(v ?? "").trim();
}

function isFacebookUrl(raw: string): boolean {
  const s = raw.toLowerCase();
  return s.includes("facebook.") || s.includes("fb.com");
}

function isGenericWhyThisLead(s: string): boolean {
  const t = trimStr(s).toLowerCase();
  if (!t || t.length < 6) return true;
  return /captured via quick add|facebook only|no website|facebook business|bookmarklet|quick add/i.test(t);
}

function mergeLeadTags(existing: unknown, fromBrain: string[] | null | undefined): string[] {
  const prev: string[] = Array.isArray(existing)
    ? (existing as unknown[]).map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  const set = new Set(prev);
  for (const t of fromBrain || []) {
    const u = String(t || "").trim();
    if (u) set.add(u);
  }
  return Array.from(set);
}

export type LeadRowForBrainPatch = Record<string, unknown>;

/**
 * Build raw patch object from current lead row + Brain payload.
 */
export function buildBrainEnrichmentLeadPatch(
  current: LeadRowForBrainPatch,
  brain: ScoutBrainEnrichedLead
): { patchRaw: Record<string, unknown>; updatedFields: string[] } {
  const patchRaw: Record<string, unknown> = {};
  const updatedFields: string[] = [];

  const exEmail = trimStr(current.email);
  const exPhone = trimStr(current.phone);
  const exWeb = trimStr(current.website);
  const exFb = trimStr(current.facebook_url);
  const exContact = trimStr(current.contact_page);
  const exCity = trimStr(current.city);
  const exState = trimStr(current.state);
  const exCat = trimStr(current.category);
  const exWhy = trimStr(current.why_this_lead_is_here);
  const exRec = trimStr(current.recommended_next_action);

  const bEmail = trimStr(brain.email);
  if (bEmail && !exEmail) {
    patchRaw.email = bEmail;
    patchRaw.email_source = trimStr(brain.email_source) || "scout_brain";
    updatedFields.push("email", "email_source");
  }

  const bPhone = trimStr(brain.phone);
  if (bPhone && !exPhone) {
    patchRaw.phone = bPhone;
    updatedFields.push("phone");
  }

  const bWeb = trimStr(brain.website);
  const brainStandalone = bWeb && leadHasStandaloneWebsite(bWeb);
  const exStandalone = exWeb && leadHasStandaloneWebsite(exWeb);
  const exIsSocial = exWeb && isFacebookUrl(exWeb);

  if (bWeb && brainStandalone) {
    if (!exWeb || exIsSocial || !exStandalone) {
      const w = bWeb.startsWith("http") ? bWeb : `https://${bWeb}`;
      patchRaw.website = w;
      patchRaw.has_website = true;
      patchRaw.normalized_website =
        trimStr(brain.normalized_website) || normalizeWebsiteUrl(w) || null;
      updatedFields.push("website", "normalized_website", "has_website");
    }
  }

  const bFb = trimStr(brain.facebook_url);
  if (bFb && !exFb) {
    const f = bFb.startsWith("http") ? bFb : `https://${bFb}`;
    if (isValidFacebookBusinessUrl(f)) {
      patchRaw.facebook_url = f;
      patchRaw.normalized_facebook_url = normalizeFacebookUrl(f) || null;
      updatedFields.push("facebook_url", "normalized_facebook_url");
    }
  }

  const bCp = trimStr(brain.contact_page);
  if (bCp && !exContact) {
    patchRaw.contact_page = bCp;
    updatedFields.push("contact_page");
  }

  const bCity = trimStr(brain.city);
  if (bCity && !exCity) {
    patchRaw.city = bCity;
    updatedFields.push("city");
  }

  const bState = trimStr(brain.state);
  if (bState && !exState) {
    patchRaw.state = bState;
    updatedFields.push("state");
  }

  const bCat = trimStr(brain.category);
  if (bCat && !exCat) {
    patchRaw.category = bCat;
    updatedFields.push("category");
  }

  const bWhy = trimStr(brain.why_this_lead_is_here);
  if (bWhy && isGenericWhyThisLead(exWhy)) {
    patchRaw.why_this_lead_is_here = bWhy;
    updatedFields.push("why_this_lead_is_here");
  }

  const ccNum = brain.contact_confidence;
  const ccLabel = trimStr(brain.contact_confidence_label);
  if (
    (ccNum != null && Number.isFinite(Number(ccNum))) ||
    (ccLabel && ccLabel.length > 0)
  ) {
    const prevRaw = current.score_breakdown;
    const prev =
      prevRaw != null && typeof prevRaw === "object" && !Array.isArray(prevRaw)
        ? { ...(prevRaw as Record<string, unknown>) }
        : {};
    if (ccNum != null && Number.isFinite(Number(ccNum))) {
      prev.scout_contact_confidence = Math.max(0, Math.min(100, Math.round(Number(ccNum))));
    }
    if (ccLabel) {
      prev.scout_contact_confidence_label = ccLabel;
    }
    patchRaw.score_breakdown = prev;
    updatedFields.push("score_breakdown");
  }

  const brainScore = brain.score;
  if (brainScore != null && !Number.isNaN(Number(brainScore))) {
    const next = Math.max(0, Math.min(100, Math.round(Number(brainScore))));
    const curConv = Number(current.conversion_score);
    const curOpp = Number(current.opportunity_score);
    const curConvN = Number.isFinite(curConv) ? curConv : null;
    const curOppN = Number.isFinite(curOpp) ? curOpp : null;
    if (curConvN == null || next > curConvN) {
      patchRaw.conversion_score = next;
      updatedFields.push("conversion_score");
    }
    if (curOppN == null || next > curOppN) {
      patchRaw.opportunity_score = next;
      if (!updatedFields.includes("opportunity_score")) updatedFields.push("opportunity_score");
    }
  }

  const brainTags = Array.isArray(brain.tags) ? brain.tags : [];
  if (brainTags.length > 0) {
    const merged = mergeLeadTags(current.lead_tags, brainTags);
    const prevLen = Array.isArray(current.lead_tags) ? (current.lead_tags as unknown[]).length : 0;
    if (merged.length !== prevLen || JSON.stringify(merged) !== JSON.stringify(current.lead_tags)) {
      patchRaw.lead_tags = merged;
      updatedFields.push("lead_tags");
    }
  }

  const step = trimStr(brain.simplified_next_step).toLowerCase();
  const stepLabel =
    step === "contact now"
      ? "Contact now"
      : step === "message on facebook"
        ? "Message on Facebook"
        : step === "call now"
          ? "Call now"
          : step === "research later"
            ? "Research later"
            : step === "skip for now"
              ? "Skip for now"
              : "";
  if (!exRec && stepLabel) {
    patchRaw.recommended_next_action = stepLabel;
    updatedFields.push("recommended_next_action");
  } else {
    const nextMove = trimStr(brain.best_next_move);
    const pitch = trimStr(brain.pitch_angle);
    if (!exRec && (nextMove || pitch)) {
      const line = [nextMove, pitch].filter(Boolean).join(" — ").slice(0, 500);
      if (line) {
        patchRaw.recommended_next_action = line;
        updatedFields.push("recommended_next_action");
      }
    }
  }

  const bPlace = trimStr(brain.place_id);
  if (bPlace && !trimStr(current.place_id)) {
    patchRaw.place_id = bPlace;
    updatedFields.push("place_id");
  }

  const gbu = trimStr(brain.google_business_url);
  if (gbu) {
    const u = gbu.startsWith("http") ? gbu : `https://${gbu}`;
    if (!trimStr(current.google_business_url)) {
      patchRaw.google_business_url = u;
      updatedFields.push("google_business_url");
    }
  }

  const apu = trimStr(brain.advertising_page_url);
  if (apu) {
    const u = apu.startsWith("http") ? apu : `https://${apu}`;
    patchRaw.advertising_page_url = u;
    updatedFields.push("advertising_page_url");
  }
  const apl = trimStr(brain.advertising_page_label);
  if (apl) {
    patchRaw.advertising_page_label = apl;
    if (!updatedFields.includes("advertising_page_label")) updatedFields.push("advertising_page_label");
  }

  const bcmNew = trimStr(brain.best_contact_method);
  if (bcmNew) {
    patchRaw.best_contact_method = bcmNew === "contact_page" ? "contact_form" : bcmNew;
    updatedFields.push("best_contact_method");
  }
  const bcvNew = trimStr(brain.best_contact_value);
  if (bcvNew) {
    patchRaw.best_contact_value = bcvNew;
    updatedFields.push("best_contact_value");
  } else if (bcmNew === "research_later") {
    patchRaw.best_contact_value = null;
    updatedFields.push("best_contact_value");
  }

  const stk = trimStr(brain.suggested_template_key);
  if (stk) {
    patchRaw.suggested_template_key = stk;
    updatedFields.push("suggested_template_key");
  }
  const sr = trimStr(brain.suggested_response);
  if (sr) {
    patchRaw.suggested_response = sr;
    updatedFields.push("suggested_response");
  }

  const projEmail = trimStr(patchRaw.email) || exEmail;
  const projPhone = trimStr(patchRaw.phone) || exPhone;
  const projCp = trimStr(patchRaw.contact_page) || exContact;
  const projFb = trimStr(patchRaw.facebook_url) || exFb;
  const hasNonFbContact = Boolean(projEmail || projPhone || projCp);
  const fbOk = Boolean(projFb && isValidFacebookBusinessUrl(projFb));
  if (!hasNonFbContact && projFb && !fbOk) {
    patchRaw.recommended_next_action = "Find real Facebook page";
    patchRaw.best_contact_method = null;
    updatedFields.push("recommended_next_action", "best_contact_method");
  }

  return {
    patchRaw,
    updatedFields: Array.from(new Set(updatedFields)),
  };
}

/** @deprecated Use buildBrainEnrichmentLeadPatch */
export const buildPatchFromScoutBrainEnrichment = buildBrainEnrichmentLeadPatch;
