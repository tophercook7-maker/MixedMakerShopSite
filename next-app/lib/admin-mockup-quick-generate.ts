import type { SampleDraft } from "@/lib/sample-draft-types";
import {
  getMockupTemplateForLead,
  parseServicesLines,
  type MockupColorPreset,
  type MockupStylePreset,
} from "@/lib/crm-mockup";
import { presetsForDesignDirection } from "@/lib/funnel-design-directions";
import {
  autofillLeadSample,
  buildDefaultLeadSample,
  leadSampleToDraft,
  normalizeLeadSampleRecord,
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

const DEFAULT_WHY = ["Local & reliable", "Fast response", "Quality work"];

function primaryServiceLabel(services: string[], category: string): string {
  if (services.length) return services[0]!.trim();
  const c = category.trim();
  return c || "Services";
}

function servicePhraseForSubheadline(serviceLabel: string): string {
  const s = serviceLabel.trim().toLowerCase();
  if (!s) return "service";
  if (s.endsWith("services")) return s;
  if (s.endsWith("service")) return s;
  return `${s} service`;
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
  const services = parseServicesLines(
    [input.top_services_text, input.legacy_services_text].filter(Boolean).join("\n")
  ).slice(0, 5);

  const serviceLabel = primaryServiceLabel(services, input.category);
  const city = input.city.trim() || "your area";
  const subSvc = servicePhraseForSubheadline(serviceLabel);

  const hero = {
    headline: `${serviceLabel} in ${city}`,
    subheadline: `Reliable ${subSvc} services for homeowners and businesses in ${city}`,
    cta: "Get a Free Quote",
  };

  const diff = input.what_makes_you_different.trim();
  const why: string[] = [];
  if (diff) {
    for (const line of diff.split(/\n+/).map((s) => s.trim()).filter(Boolean)) {
      if (why.length >= 3) break;
      why.push(line);
    }
  }
  for (const d of DEFAULT_WHY) {
    if (why.length >= 6) break;
    if (!why.some((b) => b.toLowerCase().includes(d.slice(0, 6).toLowerCase()))) why.push(d);
  }

  const about = clampAbout(diff || `${input.business_name} serves ${city} with dependable work and clear communication.`);

  const offer = input.special_offer_or_guarantee.trim();
  const cta_section = {
    title: "Ready to get started?",
    sub: offer || "Tell us what you need — we'll follow up with next steps and timing.",
    cta: hero.cta,
  };

  return {
    hero,
    services: services.length ? services : [serviceLabel],
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
    heroHeadline: structured.hero.headline,
    heroSub: structured.hero.subheadline,
    heroPrimaryCta: structured.hero.cta,
    whyChooseBullets: structured.why_choose_us,
    aboutText: structured.about,
    offerings: structured.services.map((name, idx) => ({
      name,
      text:
        draft.offerings[idx]?.text ||
        `Straightforward ${name} for local customers — clear scope and responsive service.`,
      image: draft.offerings[idx]?.image,
      imageAlt: draft.offerings[idx]?.imageAlt,
    })),
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
