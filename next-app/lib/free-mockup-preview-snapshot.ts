import type { FunnelFormSnapshot } from "@/lib/crm-mockup";
import {
  buildFreeMockupPreviewCopy,
  inferPreviewBusinessKind,
  type PreviewBusinessKind,
} from "@/lib/free-mockup-preview-copy";
import { isFunnelDesignDirectionId } from "@/lib/funnel-design-directions";
import type { FunnelDesignDirectionId } from "@/lib/funnel-design-directions";
import { normalizeDesiredOutcomeIds, type FunnelDesiredOutcomeId } from "@/lib/funnel-desired-outcomes";

/**
 * Serializable snapshot of the Free Mockup **live preview copy** at submit time
 * (stored on `mockup_submissions.mockup_data.preview_snapshot`).
 */
export type FreeMockupPreviewSnapshot = {
  businessKind: PreviewBusinessKind | string;
  headline: string;
  subheadline: string;
  businessName: string;
  city: string;
  ctaLabel: string;
  ctaSupport: string;
  services: Array<{ title: string; description: string }>;
  trustPoints: string[];
  exampleSource?: string | null;
  isFreshCutFunnel?: boolean;
  generatedAt?: string;
  /** Compact line for admin list views */
  previewSummary?: string;
  designDirection?: string | null;
};

function compactSummary(headline: string, ctaLabel: string, max = 160): string {
  const h = headline.replace(/\s+/g, " ").trim();
  const c = ctaLabel.replace(/\s+/g, " ").trim();
  const raw = h && c ? `${h} · ${c}` : h || c || "";
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1)}…`;
}

export function buildPreviewSnapshotFromFunnelSnapshot(
  snapshot: FunnelFormSnapshot,
  funnelSource: string | null | undefined,
): FreeMockupPreviewSnapshot {
  const src = String(funnelSource || "").trim().toLowerCase() || null;
  const isFreshCut = src === "freshcut";

  const servicesText =
    String(snapshot.top_services_to_feature || "").trim() ||
    String(snapshot.services_text || "").trim();

  const dirKey = String(snapshot.selected_template_key || "").trim();
  const designDirection: FunnelDesignDirectionId | "" | undefined = isFunnelDesignDirectionId(dirKey)
    ? dirKey
    : "";

  const desiredOutcomes = normalizeDesiredOutcomeIds(snapshot.desired_outcomes) as FunnelDesiredOutcomeId[];

  const copy = buildFreeMockupPreviewCopy({
    businessName: snapshot.business_name,
    businessType: snapshot.category,
    city: snapshot.city,
    servicesText,
    differentiator: snapshot.what_makes_you_different,
    specialOffer: snapshot.special_offer_or_guarantee,
    designDirection,
    desiredOutcomes,
    isFreshCutFunnel: isFreshCut,
  });

  const businessKind = inferPreviewBusinessKind(snapshot.category, { isFreshCutFunnel: isFreshCut });

  return {
    businessKind,
    headline: copy.headline,
    subheadline: copy.subheadline,
    businessName: snapshot.business_name,
    city: snapshot.city,
    ctaLabel: copy.ctaLabel,
    ctaSupport: copy.ctaSupport,
    services: copy.services.map((s) => ({ title: s.title, description: s.description })),
    trustPoints: copy.trustBullets,
    exampleSource: src,
    isFreshCutFunnel: isFreshCut,
    generatedAt: new Date().toISOString(),
    previewSummary: compactSummary(copy.headline, copy.ctaLabel),
    designDirection: dirKey || null,
  };
}

export function parsePreviewSnapshot(raw: unknown): FreeMockupPreviewSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const headline = typeof o.headline === "string" ? o.headline.trim() : "";
  const subheadline = typeof o.subheadline === "string" ? o.subheadline.trim() : "";
  if (!headline && !subheadline) return null;

  const servicesRaw = o.services;
  const services: Array<{ title: string; description: string }> = [];
  if (Array.isArray(servicesRaw)) {
    for (const x of servicesRaw) {
      if (!x || typeof x !== "object") continue;
      const t = (x as { title?: unknown }).title;
      const d = (x as { description?: unknown }).description;
      services.push({
        title: typeof t === "string" ? t : "",
        description: typeof d === "string" ? d : "",
      });
    }
  }

  const trustRaw = o.trustPoints;
  const trustPoints: string[] = [];
  if (Array.isArray(trustRaw)) {
    for (const x of trustRaw) {
      if (typeof x === "string" && x.trim()) trustPoints.push(x.trim());
    }
  }

  return {
    businessKind: typeof o.businessKind === "string" ? o.businessKind : "general",
    headline,
    subheadline,
    businessName: typeof o.businessName === "string" ? o.businessName : "",
    city: typeof o.city === "string" ? o.city : "",
    ctaLabel: typeof o.ctaLabel === "string" ? o.ctaLabel : "",
    ctaSupport: typeof o.ctaSupport === "string" ? o.ctaSupport : "",
    services,
    trustPoints,
    exampleSource:
      typeof o.exampleSource === "string" ? o.exampleSource : o.exampleSource === null ? null : undefined,
    isFreshCutFunnel: typeof o.isFreshCutFunnel === "boolean" ? o.isFreshCutFunnel : undefined,
    generatedAt: typeof o.generatedAt === "string" ? o.generatedAt : undefined,
    previewSummary: typeof o.previewSummary === "string" ? o.previewSummary : undefined,
    designDirection:
      typeof o.designDirection === "string" ? o.designDirection : o.designDirection === null ? null : undefined,
  };
}

function asFunnelSnapshot(snap: Record<string, unknown>): FunnelFormSnapshot | null {
  const business_name = String(snap.business_name || "").trim();
  const category = String(snap.category || "").trim();
  const city = String(snap.city || "").trim();
  if (!business_name || !category || !city) return null;

  return {
    business_name,
    category,
    city,
    state: String(snap.state || ""),
    phone: String(snap.phone || ""),
    email: String(snap.email || ""),
    website_url: String(snap.website_url || ""),
    facebook_url: String(snap.facebook_url || ""),
    services_text: String(snap.services_text || ""),
    template_mode: String(snap.template_mode || "auto"),
    headline_override: String(snap.headline_override || ""),
    subheadline_override: String(snap.subheadline_override || ""),
    cta_override: String(snap.cta_override || ""),
    style_preset: String(snap.style_preset || ""),
    color_preset: String(snap.color_preset || ""),
    hero_preset: String(snap.hero_preset || ""),
    selected_template_key: String(snap.selected_template_key || "clean-professional"),
    desired_outcomes: Array.isArray(snap.desired_outcomes)
      ? snap.desired_outcomes.map((x) => String(x || "").trim()).filter(Boolean)
      : [],
    top_services_to_feature: String(snap.top_services_to_feature || ""),
    what_makes_you_different: String(snap.what_makes_you_different || ""),
    special_offer_or_guarantee: String(snap.special_offer_or_guarantee || ""),
    anything_to_avoid: String(snap.anything_to_avoid || ""),
    anything_else_i_should_know: String(snap.anything_else_i_should_know || ""),
  };
}

/** Stored snapshot, or recompute from saved `snapshot` + funnel attribution (older rows). */
export function getPreviewSnapshotFromMockupData(mockupData: Record<string, unknown> | null | undefined): FreeMockupPreviewSnapshot | null {
  if (!mockupData || typeof mockupData !== "object") return null;
  const parsed = parsePreviewSnapshot(mockupData.preview_snapshot);
  if (parsed) return parsed;

  const snap = mockupData.snapshot;
  if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;
  const funnel =
    (typeof mockupData.funnel_source === "string" && mockupData.funnel_source.trim()) ||
    (typeof (snap as { funnel_source?: unknown }).funnel_source === "string"
      ? String((snap as { funnel_source?: unknown }).funnel_source).trim()
      : "") ||
    null;

  const normalized = asFunnelSnapshot(snap as Record<string, unknown>);
  if (!normalized) return null;
  try {
    return buildPreviewSnapshotFromFunnelSnapshot(normalized, funnel);
  } catch {
    return null;
  }
}
