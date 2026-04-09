import type { SampleDraft } from "@/lib/sample-draft-types";
import {
  applySignatureMockupDraft,
  buildPersonalizedMockupHero,
  buildSignatureWhyBullets,
  getMockupTemplateForLead,
  parseServicesLines,
  SIGNATURE_MOCKUP_FINAL_CTA,
  type MockupColorPreset,
  type MockupStylePreset,
} from "@/lib/crm-mockup";
import { presetsForDesignDirection } from "@/lib/funnel-design-directions";
import {
  autofillLeadSample,
  buildDefaultLeadSample,
  getSuggestedServicesForBusinessType,
  leadSampleToDraft,
  normalizeLeadSampleRecord,
  readableBusinessType,
  type LeadSampleRecord,
} from "@/lib/lead-samples";
import { type SampleImageCategory } from "@/lib/sample-fallback-images";

export type AdminGeneratedStructuredMockup = {
  hero: { headline: string; subheadline: string; cta: string };
  services: string[];
  why_choose_us: string[];
  about: string;
  cta_section: { title: string; sub: string; cta: string };
};

export type AdminStoredGeneratedMockup = {
  generated_at: string;
  template_key: string;
  selected_template_key: string;
  structured: AdminGeneratedStructuredMockup;
  sampleDraft: SampleDraft;
  stylePreset: MockupStylePreset;
  colorPreset: MockupColorPreset;
  imageCategoryKey: SampleImageCategory;
  lead_sample_id: string | null;
};

function primaryServiceLabel(services: string[], category: string): string {
  if (services.length) return services[0]!.trim();
  const c = category.trim();
  return c || "Services";
}

function mergeServicesThreeToFive(parsed: string[], category: string): string[] {
  const typeLabel = readableBusinessType(category);
  const suggested = getSuggestedServicesForBusinessType(typeLabel);
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const s of [...parsed, ...suggested]) {
    const t = s.trim();
    const key = t.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(t);
    if (merged.length >= 5) break;
  }
  while (merged.length < 3 && suggested.length) {
    let added = false;
    for (const s of suggested) {
      const t = s.trim();
      const key = t.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(t);
      added = true;
      break;
    }
    if (!added) break;
  }
  return merged.slice(0, 5);
}

function clampAbout(text: string, maxSentences = 2): string {
  const t = text.trim();
  if (!t) return "";
  const parts = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length <= maxSentences) return parts.join(" ");
  return parts.slice(0, maxSentences).join(" ");
}

function inferImageCategory(category: string, templateKey: string): SampleImageCategory {
  const hay = `${category}`.toLowerCase();
  if (templateKey === "wellness" || /massage|yoga|wellness|holistic/i.test(hay)) return "wellness";
  if (hay.includes("coffee") || hay.includes("cafe")) return "coffee";
  if (hay.includes("church")) return "church";
  if (hay.includes("restaurant") || hay.includes("food")) return "restaurant";
  return "default-service-business";
}

export type AdminMockupSubmissionInput = {
  business_name: string;
  category: string;
  city: string;
  top_services_text: string;
  legacy_services_text: string;
  /** Design direction: clean-professional, … */
  selected_template_key: string;
  what_makes_you_different: string;
  special_offer_or_guarantee: string;
  lead_id: string;
};

export function generateStructuredAdminMockup(input: AdminMockupSubmissionInput): AdminGeneratedStructuredMockup {
  const parsed = parseServicesLines(
    [input.top_services_text, input.legacy_services_text].filter(Boolean).join("\n")
  );
  const services = mergeServicesThreeToFive(parsed, input.category);
  const serviceLabel = primaryServiceLabel(services, input.category);
  const city = input.city.trim() || "your area";

  const hero = buildPersonalizedMockupHero({
    cityHeadline: city,
    primaryOffering: serviceLabel,
  });

  const diff = input.what_makes_you_different.trim();
  const why = buildSignatureWhyBullets(diff);

  const about = clampAbout(
    diff || `${input.business_name} serves ${city} with dependable work, tidy crews, and clear communication.`
  );

  const offer = input.special_offer_or_guarantee.trim();
  const cta_section = {
    title: "Ready when you are",
    sub:
      offer ||
      `Questions or timing? Call us today — we serve ${city} and nearby areas with responsive scheduling.`,
    cta: SIGNATURE_MOCKUP_FINAL_CTA,
  };

  return {
    hero,
    services,
    why_choose_us: why,
    about,
    cta_section,
  };
}

function accentFromPresets(style: MockupStylePreset): string {
  if (style === "bold-premium") return "bold-premium";
  if (style === "friendly-local") return "friendly-local";
  if (style === "minimal-elegant") return "minimal-elegant";
  return "clean-modern";
}

/**
 * Builds a SampleDraft + presentation presets from funnel submission fields (rules-based, no AI).
 */
export function buildAdminQuickMockupDraft(input: AdminMockupSubmissionInput): {
  structured: AdminGeneratedStructuredMockup;
  draft: SampleDraft;
  stylePreset: MockupStylePreset;
  colorPreset: MockupColorPreset;
  imageCategoryKey: SampleImageCategory;
  template_key: string;
  leadSample: LeadSampleRecord;
} {
  const structured = generateStructuredAdminMockup(input);
  const leadLike = {
    business_name: input.business_name,
    category: input.category,
    industry: input.category,
    city: input.city,
    state: null as string | null,
    phone: null,
    email: null,
    facebook_url: null,
    website: null,
  };
  const tpl = getMockupTemplateForLead(leadLike);
  const direction = presetsForDesignDirection(input.selected_template_key.trim());
  const stylePreset = (direction?.stylePreset as MockupStylePreset) || tpl.stylePreset;
  const colorPreset = (direction?.colorPreset as MockupColorPreset) || tpl.colorPreset;
  const template_key = tpl.template_key;

  const lid = String(input.lead_id || "").trim() || "no-lead";
  const base = buildDefaultLeadSample({
    leadId: lid,
    businessName: input.business_name,
    businessType: input.category || "service business",
  });
  const typeLabel = readableBusinessType(input.category);
  const cityLine = input.city.trim();
  const filled = autofillLeadSample(
    base,
    {
      businessName: input.business_name,
      category: input.category,
      city: input.city,
      website: null,
    },
    { forcePersonalizedCopy: true }
  );
  let sample = normalizeLeadSampleRecord({
    ...filled.sample,
    hero_headline: structured.hero.headline,
    hero_subheadline: structured.hero.subheadline,
    cta_text: structured.hero.cta,
    services: structured.services,
    intro_text: structured.about,
    accent_mode: accentFromPresets(stylePreset),
    visual_theme:
      input.selected_template_key === "premium-polished"
        ? "Premium / Refined"
        : input.selected_template_key === "bold-modern"
          ? "Bold / High Contrast"
          : input.selected_template_key === "local-trust"
            ? "Local Service Pro"
            : input.selected_template_key === "simple-direct"
              ? "Clean / Modern"
              : "Clean / Modern",
  });

  sample = normalizeLeadSampleRecord(sample);

  let draft = leadSampleToDraft(sample);
  draft = {
    ...draft,
    businessName: input.business_name,
    tagline: cityLine ? `${typeLabel} · ${cityLine}` : typeLabel,
    heroHeadline: structured.hero.headline,
    heroSub: structured.hero.subheadline,
    aboutText: "",
    galleryImages: [],
    gallerySectionTitle: undefined,
    trustQuotes: [],
    offerings: structured.services.map((name, idx) => ({
      name,
      text: "",
      image: draft.offerings[idx]?.image,
      imageAlt: draft.offerings[idx]?.imageAlt,
    })),
  };

  draft = applySignatureMockupDraft(draft, { city: cityLine || null }, {
    funnel_context: {
      what_makes_you_different: input.what_makes_you_different,
    },
  } as Record<string, unknown>);

  draft = {
    ...draft,
    finalTitle: structured.cta_section.title,
    finalSub: structured.cta_section.sub,
    finalCta: structured.cta_section.cta,
  };

  const imageCategoryKey = inferImageCategory(input.category, template_key);

  return {
    structured,
    draft,
    stylePreset,
    colorPreset,
    imageCategoryKey,
    template_key,
    leadSample: sample,
  };
}
