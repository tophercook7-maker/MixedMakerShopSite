import type { SampleDraft } from "@/lib/sample-draft-types";
import { normalizeDesiredOutcomeIds } from "@/lib/funnel-desired-outcomes";
import { presetsForDesignDirection } from "@/lib/funnel-design-directions";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import {
  autofillLeadSample,
  buildDefaultLeadSample,
  getSuggestedServicesForBusinessType,
  IMAGE_POOLS,
  leadSampleToDraft,
  normalizeLeadSampleRecord,
  readableBusinessType,
  type LeadSampleRecord,
} from "@/lib/lead-samples";
import { imageCategoryFromPortfolioRouteSlug, type SampleImageCategory } from "@/lib/sample-fallback-images";
import {
  buildPreviewShareCoreBody,
  buildPreviewShareEmailBody,
  buildPreviewShareFacebookBody,
} from "@/lib/preview-share-copy";

export const PORTFOLIO_MOCKUP_TEMPLATE_KEYS = [
  "pressure-washing",
  "auto-detailing",
  "landscaping",
  "plumbing",
  "restaurant",
  "wellness",
] as const;

export type PortfolioMockupTemplateKey = (typeof PORTFOLIO_MOCKUP_TEMPLATE_KEYS)[number];

export type MockupStylePreset = "clean-modern" | "bold-premium" | "friendly-local" | "minimal-elegant";
export type MockupColorPreset = "blue" | "green" | "dark" | "warm-neutral" | "bold-accent" | "wellness";

export type CrmMockupTemplateInfo = {
  template_key: string;
  stylePreset: MockupStylePreset;
  colorPreset: MockupColorPreset;
  suggestedCta: string;
  suggestedHeadlinePattern: "trusted_in_city" | "simple_services";
};

export type LeadRowForMockup = {
  business_name?: string | null;
  category?: string | null;
  industry?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  facebook_url?: string | null;
  website?: string | null;
};

export function pickCtaForCategoryHay(hay: string): string {
  if (/restaurant|food truck|kitchen|catering/i.test(hay)) return "Order Online";
  if (/coffee|cafe|espresso/i.test(hay)) return "Message Us";
  if (/church|ministry/i.test(hay)) return "Plan Your Visit";
  if (/massage|yoga|sound bath|wellness|holistic|healing/i.test(hay)) return "Book a Session";
  if (/detail|salon|spa/i.test(hay)) return "Book Now";
  if (/landscap|lawn/i.test(hay)) return "Get a Quote";
  if (/pressure|power wash|wash/i.test(hay)) return "Get a Free Estimate";
  if (/plumb|hvac|electric|handyman/i.test(hay)) return "Schedule Service";
  return "Call Now";
}

/** Strips trailing "service" / "services" so subheads avoid "… services services". */
export function stripTrailingServiceWords(label: string): string {
  let s = String(label || "").trim();
  if (!s) return s;
  const low = s.toLowerCase();
  if (low.endsWith(" services")) return s.slice(0, -" services".length).trim() || s;
  if (low.endsWith(" service")) return s.slice(0, -" service".length).trim() || s;
  return s;
}

/** Uniform hero CTA for all signature mockups (same system, every time). */
export const SIGNATURE_MOCKUP_HERO_CTA = "Get a Free Quote";

/** Bottom-of-page CTA label (distinct from hero). */
export const SIGNATURE_MOCKUP_FINAL_CTA = "Call Now";

/** Subtle footer credit on exported / shareable previews. */
export const SIGNATURE_MOCKUP_FOOTER_BRAND = "Preview built by Topher";

export const SIGNATURE_MOCKUP_WHY_CORE = ["Local & reliable", "Fast response", "Quality work"] as const;

/** Trust line under hero: serving line when we have a real place name, otherwise a fixed trio. */
export function buildSignatureTrustLine(cityRaw: string | null | undefined): string {
  const c =
    String(cityRaw || "")
      .split(",")[0]
      ?.trim() || String(cityRaw || "").trim();
  if (!c || /^your area$/i.test(c)) return "Local • Reliable • Straightforward Service";
  return `Serving ${c} and surrounding areas`;
}

/** Three core bullets, plus one optional first line from the lead’s differentiator. */
export function buildSignatureWhyBullets(differentiator: string): string[] {
  const line = String(differentiator || "")
    .split(/\n+/)[0]
    ?.trim();
  if (line) return [line, ...SIGNATURE_MOCKUP_WHY_CORE];
  return [...SIGNATURE_MOCKUP_WHY_CORE];
}

function signatureOfferingBlurb(name: string): string {
  const n = String(name || "").trim() || "this service";
  return `Straightforward ${n} with clear scope and easy scheduling.`;
}

/**
 * Applies the MixedMakerShop signature shell: trust line, fixed why bullets, bottom CTA, uniform service blurbs.
 */
export function applySignatureMockupDraft(
  draft: SampleDraft,
  row: { city: string | null },
  payload: Record<string, unknown>
): SampleDraft {
  const fc = readFunnelContext(payload);
  const diff = fc ? String(fc.what_makes_you_different || "").trim() : "";
  const offerings = (draft.offerings || []).map((o) => ({
    ...o,
    text: signatureOfferingBlurb(o.name),
  }));
  return {
    ...draft,
    heroPrimaryCta: SIGNATURE_MOCKUP_HERO_CTA,
    localPositioning: buildSignatureTrustLine(row.city),
    whyChooseTitle: draft.whyChooseTitle ?? "Why choose us",
    whyChooseBullets: buildSignatureWhyBullets(diff),
    offeringsTitle: "Services",
    servicesSectionLead: "A short list of what we can take care of for you.",
    offerings,
    finalTitle: "Ready when you are",
    finalSub: `Questions or timing? Call ${draft.phone} — we're happy to help.`,
    finalCta: SIGNATURE_MOCKUP_FINAL_CTA,
  };
}

/**
 * Conversion-focused hero lines for sendable mockups: "{Service} in {City}" plus a reliable local subhead.
 */
export function buildPersonalizedMockupHero(opts: {
  cityHeadline: string;
  primaryOffering: string;
}): { headline: string; subheadline: string; cta: string } {
  const city = String(opts.cityHeadline || "").trim() || "your area";
  const offeringRaw = String(opts.primaryOffering || "").trim() || "Local service";
  const headline = `${offeringRaw} in ${city}`;
  const core = stripTrailingServiceWords(offeringRaw).toLowerCase();
  const subheadline = `Reliable ${core} services for homeowners and businesses in ${city}`;
  return { headline, subheadline, cta: SIGNATURE_MOCKUP_HERO_CTA };
}

function pickPortfolioMeta(key: PortfolioMockupTemplateKey): CrmMockupTemplateInfo {
  const found = getPortfolioSampleBySlug(key);
  const hay = key.replace(/-/g, " ");
  return {
    template_key: key,
    stylePreset: (found?.stylePreset as MockupStylePreset) ?? "clean-modern",
    colorPreset: (found?.colorPreset as MockupColorPreset) ?? "blue",
    suggestedCta: pickCtaForCategoryHay(hay),
    suggestedHeadlinePattern: "trusted_in_city",
  };
}

/**
 * Maps lead category/industry to an existing portfolio sample slug or generic-local.
 */
export function getMockupTemplateForLead(lead: LeadRowForMockup): CrmMockupTemplateInfo {
  const hay = `${lead.category || ""} ${lead.industry || ""}`.toLowerCase();

  if (
    /(wellness|massage|yoga|sound bath|holistic|healing|reiki|meditation)/i.test(hay) &&
    !/auto\s*detail|car\s*detail/i.test(hay)
  ) {
    return pickPortfolioMeta("wellness");
  }

  if (/(landscap|lawn care|lawn\b|yard care)/i.test(hay)) return pickPortfolioMeta("landscaping");

  if (/coffee|cafe|espresso/i.test(hay)) {
    return {
      template_key: "generic-local",
      stylePreset: "friendly-local",
      colorPreset: "warm-neutral",
      suggestedCta: pickCtaForCategoryHay(hay),
      suggestedHeadlinePattern: "simple_services",
    };
  }

  if (/church|ministry|worship/i.test(hay)) {
    return {
      template_key: "generic-local",
      stylePreset: "clean-modern",
      colorPreset: "blue",
      suggestedCta: "Plan Your Visit",
      suggestedHeadlinePattern: "simple_services",
    };
  }

  const detailing = /detail|detailing|auto detail|car detail|mobile detail/i.test(hay);
  const pressure = /pressure wash|power wash|soft wash|exterior wash|house wash|driveway wash/i.test(hay);
  if (detailing && !pressure) return pickPortfolioMeta("auto-detailing");
  if (pressure) return pickPortfolioMeta("pressure-washing");

  if (/restaurant|food truck|diner|kitchen|catering/i.test(hay)) return pickPortfolioMeta("restaurant");

  if (/plumb|hvac|heat|air conditioning|electric|handyman|contractor|roof/i.test(hay)) {
    return pickPortfolioMeta("plumbing");
  }

  return {
    template_key: "generic-local",
    stylePreset: "clean-modern",
    colorPreset: "blue",
    suggestedCta: pickCtaForCategoryHay(hay),
    suggestedHeadlinePattern: "trusted_in_city",
  };
}

export type MockupContentFields = {
  business_name: string;
  city: string | null;
  category: string;
  phone: string | null;
  email: string | null;
  facebook_url: string | null;
  headline: string;
  subheadline: string;
  cta_text: string;
  services: string[];
};

/**
 * Fills headline, subhead, CTA, and services from the lead row.
 */
export function buildMockupContentFromLead(lead: LeadRowForMockup, template: CrmMockupTemplateInfo): MockupContentFields {
  const businessName = String(lead.business_name || "").trim() || "Your business";
  const categoryLabel = readableBusinessType(String(lead.category || lead.industry || "local service"));
  const city = String(lead.city || "").trim();
  const state = String(lead.state || "").trim();
  const location = [city, state].filter(Boolean).join(", ");

  const servicesWellness = ["Massage Therapy", "Yoga Classes", "Sound Baths"];

  if (template.template_key === "wellness") {
    const cityHeadline = city.split(",")[0]?.trim() || city || "";
    const hero = buildPersonalizedMockupHero({
      cityHeadline: cityHeadline || "your area",
      primaryOffering: servicesWellness[0] || "Massage therapy",
    });
    return {
      business_name: businessName,
      city: location || city || null,
      category: categoryLabel.includes("Wellness") ? categoryLabel : "Wellness / Massage / Yoga",
      phone: String(lead.phone || "").trim() || null,
      email: String(lead.email || "").trim() || null,
      facebook_url: String(lead.facebook_url || "").trim() || null,
      headline: hero.headline,
      subheadline: hero.subheadline,
      cta_text: hero.cta,
      services: servicesWellness,
    };
  }

  const services = getSuggestedServicesForBusinessType(categoryLabel);
  const primaryOffering = services[0]?.trim() || categoryLabel;
  const cityHeadline = city.split(",")[0]?.trim() || city || "";
  const hero = buildPersonalizedMockupHero({
    cityHeadline: cityHeadline || "your area",
    primaryOffering,
  });

  return {
    business_name: businessName,
    city: location || city || null,
    category: categoryLabel,
    phone: String(lead.phone || "").trim() || null,
    email: String(lead.email || "").trim() || null,
    facebook_url: String(lead.facebook_url || "").trim() || null,
    headline: hero.headline,
    subheadline: hero.subheadline,
    cta_text: hero.cta,
    services,
  };
}

function enrichMockupContentFromFunnelFields(
  content: MockupContentFields,
  _snapshot: FunnelFormSnapshot
): MockupContentFields {
  return content;
}

function isPortfolioKey(key: string): key is PortfolioMockupTemplateKey {
  return (PORTFOLIO_MOCKUP_TEMPLATE_KEYS as readonly string[]).includes(key);
}

function displayPhoneForDraft(phone: string | null | undefined): string {
  const p = String(phone || "").trim();
  if (p) return p;
  return "(555) 555-0100";
}

function accentModeFromPresets(style: MockupStylePreset): string {
  if (style === "bold-premium") return "bold-premium";
  if (style === "friendly-local") return "friendly-local";
  if (style === "minimal-elegant") return "minimal-elegant";
  return "clean-modern";
}

function mergePortfolioDraftWithMockup(
  draft: SampleDraft,
  row: PublicCrmMockupRow,
  servicesOverride: string[]
): SampleDraft {
  const phone = displayPhoneForDraft(row.phone);
  const names =
    servicesOverride.length > 0 ? servicesOverride : draft.offerings.map((o) => o.name);
  const offerings = names.map((name, idx) => ({
    name,
    text:
      draft.offerings[idx]?.text ??
      `${name} — clear options and an easy next step for customers.`,
    image: draft.offerings[idx]?.image,
    imageAlt: draft.offerings[idx]?.imageAlt,
  }));
  const cityLine = row.city ? `Serving ${row.city} and nearby.` : draft.localPositioning;
  const baseSub = draft.contactBandSub || "Reach out for a quote or question.";

  return {
    ...draft,
    businessName: row.business_name || draft.businessName,
    heroHeadline: row.headline || draft.heroHeadline,
    heroSub: row.subheadline || draft.heroSub,
    heroPrimaryCta: row.cta_text || draft.heroPrimaryCta,
    phone,
    tagline: row.category ? `${row.category}${row.city ? ` · ${row.city}` : ""}` : draft.tagline,
    localPositioning: cityLine,
    offerings,
    contactBandSub: baseSub,
    contactEmail: row.email?.trim() || draft.contactEmail,
    contactFacebookUrl: row.facebook_url?.trim() || draft.contactFacebookUrl,
    locationName: row.business_name || draft.locationName,
  };
}

function applyContactEnrichmentToDraft(draft: SampleDraft, row: PublicCrmMockupRow): SampleDraft {
  const phone = displayPhoneForDraft(row.phone);
  const baseSub = draft.contactBandSub || inferDefaultContactSub(draft);
  return {
    ...draft,
    phone,
    contactBandSub: baseSub,
    contactEmail: row.email?.trim() || draft.contactEmail,
    contactFacebookUrl: row.facebook_url?.trim() || draft.contactFacebookUrl,
    address: row.city ? `Serving ${row.city}.` : draft.address,
    locationName: row.business_name || draft.locationName,
  };
}

function inferDefaultContactSub(draft: SampleDraft): string {
  return `Questions? Tap below to call ${draft.businessName}.`;
}

function buildGenericLeadSample(row: PublicCrmMockupRow, services: string[], tpl: CrmMockupTemplateInfo): LeadSampleRecord {
  const cityToken = row.city?.split(",")[0]?.trim() || row.city || "";
  const base = buildDefaultLeadSample({
    leadId: "mockup",
    businessName: row.business_name,
    businessType: row.category || "service business",
  });
  let sample = normalizeLeadSampleRecord({
    ...base,
    hero_headline: row.headline,
    hero_subheadline: row.subheadline,
    cta_text: row.cta_text,
    services: services.length ? services.slice(0, 8) : base.services,
    accent_mode: accentModeFromPresets(tpl.stylePreset),
    template_key: "generic-local",
  });

  const filled = autofillLeadSample(
    sample,
    {
      businessName: row.business_name,
      category: row.category || "",
      city: cityToken,
      website: "",
    },
    { forcePersonalizedCopy: true }
  );
  sample = filled.sample;

  return normalizeLeadSampleRecord({
    ...sample,
    hero_headline: row.headline,
    hero_subheadline: row.subheadline,
    cta_text: row.cta_text,
    services: services.length ? services.slice(0, 8) : sample.services,
    accent_mode: accentModeFromPresets(tpl.stylePreset),
  });
}

export type PublicCrmMockupRow = {
  id: string;
  template_key: string;
  business_name: string;
  city: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  facebook_url: string | null;
  headline: string;
  subheadline: string;
  cta_text: string;
  mockup_slug: string;
  raw_payload: Record<string, unknown> | null;
};

function readServicesFromPayload(payload: Record<string, unknown>): string[] {
  if (!Array.isArray(payload.services)) return [];
  return (payload.services as unknown[]).map((s) => String(s || "").trim()).filter(Boolean);
}

function readPreset(
  payload: Record<string, unknown>,
  key: "style_preset" | "color_preset",
  fallback: string
): string {
  const v = payload[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function readHeroImageKey(payload: Record<string, unknown>): string {
  const v = payload.hero_image_key;
  return typeof v === "string" ? v.trim() : "";
}

function applyHeroImageKeyToDraft(draft: SampleDraft, heroKey: string): SampleDraft {
  if (!heroKey) return draft;
  const pool = IMAGE_POOLS[heroKey];
  if (!pool?.length) return draft;
  const hero = pool[0];
  const nextOfferings = draft.offerings.map((o, i) => ({
    ...o,
    image: o.image || pool[Math.min(i + 1, pool.length - 1)] || hero,
  }));
  return { ...draft, heroImageUrl: hero, offerings: nextOfferings };
}

function finalizeDraftWithPayload(draft: SampleDraft, payload: Record<string, unknown>): SampleDraft {
  return applyHeroImageKeyToDraft(draft, readHeroImageKey(payload));
}

function readFunnelContext(payload: Record<string, unknown>): Record<string, unknown> | null {
  const fc = payload.funnel_context;
  if (!fc || typeof fc !== "object" || Array.isArray(fc)) return null;
  return fc as Record<string, unknown>;
}

function applyDraftFunnelPatches(draft: SampleDraft, _payload: Record<string, unknown>): SampleDraft {
  return draft;
}

/**
 * Builds the presentation SampleDraft for a stored CRM mockup (server or client).
 */
export function buildSampleDraftFromPublicMockup(row: PublicCrmMockupRow): {
  draft: SampleDraft;
  imageCategoryKey: SampleImageCategory;
  stylePreset: MockupStylePreset;
  colorPreset: MockupColorPreset;
} {
  const payload = row.raw_payload && typeof row.raw_payload === "object" ? row.raw_payload : {};
  const servicesFromPayload = readServicesFromPayload(payload);

  if (isPortfolioKey(row.template_key)) {
    const found = getPortfolioSampleBySlug(row.template_key);
    if (found) {
      const merged = mergePortfolioDraftWithMockup(found.draft, row, servicesFromPayload);
      const stylePreset =
        (readPreset(payload, "style_preset", found.stylePreset) as MockupStylePreset) ||
        (found.stylePreset as MockupStylePreset);
      const colorPreset =
        (readPreset(payload, "color_preset", found.colorPreset) as MockupColorPreset) ||
        (found.colorPreset as MockupColorPreset);
      let draftOut = finalizeDraftWithPayload(merged, payload);
      draftOut = applyDraftFunnelPatches(draftOut, payload);
      draftOut = applySignatureMockupDraft(draftOut, row, payload);
      return {
        draft: draftOut,
        imageCategoryKey: imageCategoryFromPortfolioRouteSlug(row.template_key),
        stylePreset,
        colorPreset,
      };
    }
  }

  const stylePreset = (readPreset(payload, "style_preset", "clean-modern") as MockupStylePreset) || "clean-modern";
  const colorPreset = (readPreset(payload, "color_preset", "blue") as MockupColorPreset) || "blue";
  const tpl: CrmMockupTemplateInfo = {
    template_key: "generic-local",
    stylePreset,
    colorPreset,
    suggestedCta: row.cta_text,
    suggestedHeadlinePattern: "trusted_in_city",
  };

  const sample = buildGenericLeadSample(row, servicesFromPayload, tpl);
  const draft = leadSampleToDraft(sample);
  const enriched = applyContactEnrichmentToDraft(draft, row);

  const categoryHay = `${row.category || ""}`.toLowerCase();
  let imageKey: SampleImageCategory = "default-service-business";
  if (categoryHay.includes("coffee") || categoryHay.includes("cafe")) imageKey = "coffee";
  else if (categoryHay.includes("church")) imageKey = "church";
  else if (categoryHay.includes("restaurant") || categoryHay.includes("food")) imageKey = "restaurant";
  else if (row.template_key === "wellness") imageKey = "wellness";

  let draftOut = finalizeDraftWithPayload(enriched, payload);
  draftOut = applyDraftFunnelPatches(draftOut, payload);
  draftOut = applySignatureMockupDraft(draftOut, row, payload);

  return {
    draft: draftOut,
    imageCategoryKey: imageKey,
    stylePreset,
    colorPreset,
  };
}

export type FunnelFormSnapshot = {
  business_name: string;
  category: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website_url: string;
  facebook_url: string;
  services_text: string;
  template_mode: string;
  headline_override: string;
  subheadline_override: string;
  cta_override: string;
  style_preset: string;
  color_preset: string;
  hero_preset: string;
  /** Guided design direction id (clean-professional, bold-modern, …). */
  selected_template_key: string;
  desired_outcomes: string[];
  top_services_to_feature: string;
  what_makes_you_different: string;
  special_offer_or_guarantee: string;
  anything_to_avoid: string;
  anything_else_i_should_know: string;
};

export function parseServicesLines(text: string): string[] {
  return text
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function resolveFunnelTemplateChoice(mode: string, lead: LeadRowForMockup): CrmMockupTemplateInfo {
  const m = String(mode || "auto").trim().toLowerCase();
  if (!m || m === "auto") return getMockupTemplateForLead(lead);
  if (m === "generic-local") {
    return {
      template_key: "generic-local",
      stylePreset: "clean-modern",
      colorPreset: "blue",
      suggestedCta: pickCtaForCategoryHay(`${lead.category || ""} ${lead.industry || ""}`),
      suggestedHeadlinePattern: "trusted_in_city",
    };
  }
  if (isPortfolioKey(m)) return pickPortfolioMeta(m);
  return getMockupTemplateForLead(lead);
}

export function buildFunnelPublicMockupRow(snapshot: FunnelFormSnapshot): PublicCrmMockupRow {
  const leadLike: LeadRowForMockup = {
    business_name: snapshot.business_name,
    category: snapshot.category,
    industry: snapshot.category,
    city: snapshot.city,
    state: snapshot.state || null,
    phone: snapshot.phone || null,
    email: snapshot.email || null,
    website: snapshot.website_url || null,
    facebook_url: snapshot.facebook_url || null,
  };
  let tpl = resolveFunnelTemplateChoice(snapshot.template_mode, leadLike);

  const direction = presetsForDesignDirection(String(snapshot.selected_template_key || "").trim());
  if (direction) {
    tpl = {
      ...tpl,
      stylePreset: direction.stylePreset as MockupStylePreset,
      colorPreset: direction.colorPreset as MockupColorPreset,
    };
  } else {
    const sp = String(snapshot.style_preset || "").trim();
    const cp = String(snapshot.color_preset || "").trim();
    if (
      sp &&
      (["clean-modern", "bold-premium", "friendly-local", "minimal-elegant"] as const).includes(sp as MockupStylePreset)
    ) {
      tpl = { ...tpl, stylePreset: sp as MockupStylePreset };
    }
    if (
      cp &&
      (["blue", "green", "dark", "warm-neutral", "bold-accent", "wellness"] as const).includes(cp as MockupColorPreset)
    ) {
      tpl = { ...tpl, colorPreset: cp as MockupColorPreset };
    }
  }

  let content = buildMockupContentFromLead(leadLike, tpl);
  content = enrichMockupContentFromFunnelFields(content, snapshot);

  const fromTop = parseServicesLines(snapshot.top_services_to_feature || "");
  const parsedLegacy = parseServicesLines(snapshot.services_text || "");
  const services = (fromTop.length ? fromTop : parsedLegacy.length ? parsedLegacy : content.services).slice(0, 5);

  const cityHeadline =
    String(snapshot.city || "").split(",")[0]?.trim() || String(snapshot.city || "").trim() || "";
  const primaryOffering =
    services[0]?.trim() ||
    content.services[0]?.trim() ||
    readableBusinessType(String(snapshot.category || "local service"));
  const heroLines = buildPersonalizedMockupHero({
    cityHeadline: cityHeadline || "your area",
    primaryOffering,
  });
  const headlineDefault = heroLines.headline;
  const subheadlineDefault = heroLines.subheadline;
  const ctaDefault = heroLines.cta;

  const headline = String(snapshot.headline_override || "").trim() || headlineDefault;
  const subheadline = String(snapshot.subheadline_override || "").trim() || subheadlineDefault;
  const cta_text = String(snapshot.cta_override || "").trim() || ctaDefault;
  const outcomes = normalizeDesiredOutcomeIds(snapshot.desired_outcomes);
  const funnel_context = {
    desired_outcomes: outcomes,
    what_makes_you_different: String(snapshot.what_makes_you_different || "").trim(),
    special_offer_or_guarantee: String(snapshot.special_offer_or_guarantee || "").trim(),
    anything_to_avoid: String(snapshot.anything_to_avoid || "").trim(),
    anything_else_i_should_know: String(snapshot.anything_else_i_should_know || "").trim(),
    selected_template_key: String(snapshot.selected_template_key || "").trim(),
  };

  const raw: Record<string, unknown> = {
    services,
    style_preset: tpl.stylePreset,
    color_preset: tpl.colorPreset,
    funnel_context,
    mockup_signature: true,
    simple_conversion_layout: true,
  };
  const hp = String(snapshot.hero_preset || "").trim();
  if (hp && IMAGE_POOLS[hp]?.length) raw.hero_image_key = hp;

  return {
    id: "funnel-preview",
    template_key: tpl.template_key,
    business_name: content.business_name,
    city: content.city,
    category: content.category,
    phone: content.phone,
    email: content.email,
    facebook_url: content.facebook_url,
    headline,
    subheadline,
    cta_text,
    mockup_slug: "preview",
    raw_payload: raw,
  };
}

export function buildFunnelPreviewFromSnapshot(snapshot: FunnelFormSnapshot) {
  const row = buildFunnelPublicMockupRow(snapshot);
  return buildSampleDraftFromPublicMockup(row);
}

export const FUNNEL_HERO_PRESET_KEYS = Object.keys(IMAGE_POOLS) as string[];

/** Preferred public slug when sharing the Wise Body Mind Soul CRM mockup (unique in `crm_mockups`). */
export const PREFERRED_WISE_BODY_MIND_SOUL_MOCKUP_SLUG = "wise-body-mind-soul";

export function isWiseBodyMindSoulLead(lead: Pick<LeadRowForMockup, "business_name">): boolean {
  return /wise\s*body\s*mind\s*soul/i.test(String(lead.business_name || "").trim());
}

export const WISE_BODY_MIND_SOUL_ADMIN_TITLE = "Wise Body Mind Soul — Wellness Mockup";

export const WISE_BODY_EMAIL_SUBJECT = "A fresh website idea for Wise Body Mind Soul";

export const WISE_BODY_EMAIL_BODY = `Hi Melissa,

I came across Wise Body Mind Soul and took a look through your site.

You already have a strong message and a lot to offer, but I think the site could feel much more polished, calming, and premium while also making it easier for people to book.

I put together a quick mockup showing how it could look with a cleaner layout, stronger visual flow, and a more modern wellness feel.

If you'd like, I'd be happy to send the preview link over.

Thanks,
Topher
MixedMakerShop`;

/** Extra `raw_payload` fields for the Wise Body Mind Soul lead (admin label + outreach copy). */
export function wiseBodyMindSoulShareRawFields(): Record<string, string> {
  return {
    admin_title: WISE_BODY_MIND_SOUL_ADMIN_TITLE,
    share_email_subject: WISE_BODY_EMAIL_SUBJECT,
    share_email_body: WISE_BODY_EMAIL_BODY,
    share_text:
      "Hi Melissa — I put together a quick website mockup idea for Wise Body Mind Soul. Want me to send the preview link?",
    share_facebook:
      "I put together a sample layout for Wise Body Mind Soul that shows a calmer, more premium wellness feel. Happy to share the preview link if you'd like to see it.",
  };
}

export function generateMockupSlug(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `m-${hex}`;
}

export function buildMockupShareMessages(mockupUrl: string): { email: string; text: string; facebook: string } {
  const url = String(mockupUrl || "").trim();
  return {
    email: buildPreviewShareEmailBody(url),
    text: buildPreviewShareCoreBody(url),
    facebook: buildPreviewShareFacebookBody(url),
  };
}
