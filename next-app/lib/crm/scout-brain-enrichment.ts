/**
 * Server-side client for Scout Brain POST /api/enrich-lead.
 * Base: SCOUT_BRAIN_API_BASE_URL → `${base}/api/enrich-lead`
 * Auth: SCOUT_ENRICH_API_KEY (or legacy SCOUT_BRAIN_API_KEY) → X-Scout-Enrich-Key
 */

export const SCOUT_BRAIN_ENRICH_PATH = "/api/enrich-lead";

export type ScoutBrainEnrichInput = {
  business_name: string;
  city?: string | null;
  state?: string | null;
  source_url?: string | null;
  facebook_url?: string | null;
  source_type: "extension" | "facebook" | "google" | "manual" | "unknown" | "mixed";
  /** Passed through for deterministic CRM lanes when Places/crawl add nothing */
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  contact_page?: string | null;
  conversion_score?: number | null;
  opportunity_score?: number | null;
  why_this_lead_is_here?: string | null;
  notes?: string | null;
  category?: string | null;
  source?: string | null;
  source_label?: string | null;
  google_business_url?: string | null;
};

export type ScoutBrainEnrichedLead = {
  business_name?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  facebook_url?: string | null;
  google_business_url?: string | null;
  website?: string | null;
  normalized_website?: string | null;
  phone?: string | null;
  email?: string | null;
  email_source?: string | null;
  contact_page?: string | null;
  city?: string | null;
  state?: string | null;
  category?: string | null;
  tags?: string[] | null;
  score?: number | null;
  contact_confidence?: number | null;
  contact_confidence_label?: string | null;
  why_this_lead_is_here?: string | null;
  best_contact_method?: string | null;
  best_contact_value?: string | null;
  advertising_page_url?: string | null;
  advertising_page_label?: string | null;
  suggested_template_key?: string | null;
  suggested_response?: string | null;
  best_next_move?: string | null;
  pitch_angle?: string | null;
  source_confidence?: number | null;
  match_confidence?: number | null;
  raw_signals?: Record<string, unknown> | null;
  place_id?: string | null;
  lead_bucket?: string | null;
  contact_readiness?: string | null;
  simplified_next_step?: string | null;
  lane_summary_line?: string | null;
  honest_headline?: string | null;
};

export type ScoutBrainEnrichResponse = {
  ok?: boolean;
  error?: string | null;
  enriched_lead?: ScoutBrainEnrichedLead | null;
};

export function getScoutBrainEnrichBaseUrl(): string | null {
  const raw = process.env.SCOUT_BRAIN_API_BASE_URL?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/+$/, "");
}

/** Server log when enrichment would call Brain but URL is missing (once per process is noisy; call sites log on demand). */
export function logScoutBrainEnrichConfigMissing(context: string): void {
  console.info(
    `[crm-enrichment] ${context}: SCOUT_BRAIN_API_BASE_URL is not set — Scout Brain enrichment skipped; using local HTML fallback if available.`
  );
}

export function scoutBrainEnrichEndpointUrl(): string | null {
  const base = getScoutBrainEnrichBaseUrl();
  if (!base) return null;
  return `${base}${SCOUT_BRAIN_ENRICH_PATH}`;
}

const DEFAULT_TIMEOUT_MS = 11_000;

function scoutEnrichApiKey(): string {
  return (
    process.env.SCOUT_ENRICH_API_KEY?.trim() ||
    process.env.SCOUT_BRAIN_API_KEY?.trim() ||
    ""
  );
}

/**
 * Calls Scout Brain enrichment. Structured failure (no throw) on errors.
 */
export async function fetchScoutBrainEnrichLead(
  input: ScoutBrainEnrichInput,
  options?: { timeoutMs?: number }
): Promise<{ ok: true; data: ScoutBrainEnrichResponse } | { ok: false; error: string }> {
  const url = scoutBrainEnrichEndpointUrl();
  if (!url) {
    return { ok: false, error: "SCOUT_BRAIN_API_BASE_URL is not configured" };
  }

  const timeoutMs = Math.min(12_000, Math.max(8_000, options?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const apiKey = scoutEnrichApiKey();
  if (apiKey) {
    headers["X-Scout-Enrich-Key"] = apiKey;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        business_name: input.business_name || "",
        city: input.city || "",
        state: input.state || "",
        source_url: input.source_url || "",
        facebook_url: input.facebook_url || "",
        google_business_url: input.google_business_url ?? "",
        source_type: input.source_type || "unknown",
        email: input.email ?? "",
        phone: input.phone ?? "",
        website: input.website ?? "",
        contact_page: input.contact_page ?? "",
        conversion_score:
          input.conversion_score != null && Number.isFinite(Number(input.conversion_score))
            ? Math.round(Number(input.conversion_score))
            : null,
        opportunity_score:
          input.opportunity_score != null && Number.isFinite(Number(input.opportunity_score))
            ? Math.round(Number(input.opportunity_score))
            : null,
        why_this_lead_is_here: input.why_this_lead_is_here ?? "",
        notes: input.notes ?? "",
        category: input.category ?? "",
        source: input.source ?? "",
        source_label: input.source_label ?? "",
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await res.text();
    let json: ScoutBrainEnrichResponse;
    try {
      json = JSON.parse(text) as ScoutBrainEnrichResponse;
    } catch {
      return { ok: false, error: `Invalid JSON from Scout Brain (${res.status})` };
    }

    if (!res.ok) {
      return {
        ok: false,
        error: json.error || `Scout Brain HTTP ${res.status}`,
      };
    }

    if (!json.ok) {
      return { ok: false, error: json.error || "Scout Brain returned ok: false" };
    }

    return { ok: true, data: json };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("abort") || msg === "The operation was aborted.") {
      return { ok: false, error: "Scout Brain request timed out" };
    }
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
