import type { SampleDraft } from "@/app/(public)/website-samples/[slug]/sample-draft-client";

export type LeadSampleStatus = "draft" | "ready" | "sent";
export type LeadSampleSource = "server" | "local";

export type LeadSampleRecord = {
  id: string;
  lead_id: string;
  template_key: string;
  business_name: string;
  business_type: string;
  hero_headline: string;
  hero_subheadline: string;
  cta_text: string;
  intro_text: string;
  services: string[];
  image_urls: string[];
  primary_image_url: string;
  gallery_image_urls: string[];
  accent_mode: string;
  preview_slug: string;
  status: LeadSampleStatus;
  created_at: string;
  updated_at: string;
  source: LeadSampleSource;
  isLocalOnly: boolean;
};

export function buildLeadSampleId(leadId: string): string {
  return `sample-${String(leadId || "").trim() || crypto.randomUUID()}`;
}

function asString(value: unknown, fallback = ""): string {
  const next = String(value ?? "").trim();
  return next || fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return [];
}

export function normalizeLeadSampleRecord(input: Partial<LeadSampleRecord>): LeadSampleRecord {
  const now = new Date().toISOString();
  return {
    id: asString(input.id, crypto.randomUUID()),
    lead_id: asString(input.lead_id),
    template_key: asString(input.template_key, "service-business"),
    business_name: asString(input.business_name, "Business Name"),
    business_type: asString(input.business_type, "service business"),
    hero_headline: asString(input.hero_headline, "A cleaner, more modern website for your business"),
    hero_subheadline: asString(
      input.hero_subheadline,
      "This sample shows how your business could look online with clearer messaging and stronger calls to action."
    ),
    cta_text: asString(input.cta_text, "Get Started"),
    intro_text: asString(
      input.intro_text,
      "We help local businesses make a stronger first impression and turn more visitors into calls."
    ),
    services: asStringArray(input.services).slice(0, 6),
    image_urls: asStringArray(input.image_urls),
    primary_image_url: asString(input.primary_image_url),
    gallery_image_urls: asStringArray(input.gallery_image_urls),
    accent_mode: asString(input.accent_mode, "clean-modern"),
    preview_slug: asString(input.preview_slug, "sample"),
    status: (asString(input.status, "draft") as LeadSampleStatus) || "draft",
    created_at: asString(input.created_at, now),
    updated_at: asString(input.updated_at, now),
    source: (asString(input.source, "local") as LeadSampleSource) || "local",
    isLocalOnly: Boolean(input.isLocalOnly ?? true),
  };
}

export function buildDefaultLeadSample(input: {
  leadId: string;
  businessName?: string | null;
  businessType?: string | null;
  note?: string | null;
}): LeadSampleRecord {
  const base = normalizeLeadSampleRecord({
    id: crypto.randomUUID(),
    lead_id: asString(input.leadId),
    business_name: asString(input.businessName, "Business Name"),
    business_type: asString(input.businessType, "service business"),
    intro_text: asString(
      input.note,
      "This sample is tailored for your business and can be refined into a live production site."
    ),
  });
  return {
    ...base,
    services: ["Service One", "Service Two", "Service Three"],
  };
}

function titleFromBusinessType(businessType: string): string {
  const normalized = businessType.toLowerCase();
  if (normalized.includes("coffee")) return "Menu Favorites";
  if (normalized.includes("restaurant")) return "Popular Dishes";
  if (normalized.includes("church")) return "Ways to Get Connected";
  if (normalized.includes("plumb")) return "Core Services";
  if (normalized.includes("lawn")) return "Lawn Care Services";
  return "Services";
}

function sampleHours(businessType: string): string[] {
  const normalized = businessType.toLowerCase();
  if (normalized.includes("church")) {
    return ["Sunday Worship 10:00 AM", "Wednesday Groups 6:30 PM", "Office Hours Mon-Thu 9:00 AM-3:00 PM"];
  }
  if (normalized.includes("restaurant") || normalized.includes("coffee")) {
    return ["Mon-Fri 7:00 AM-6:00 PM", "Saturday 8:00 AM-7:00 PM", "Sunday 8:00 AM-2:00 PM"];
  }
  return ["Mon-Fri 8:00 AM-5:00 PM", "Saturday 9:00 AM-2:00 PM", "Sunday Closed"];
}

export function leadSampleToDraft(sample: LeadSampleRecord): SampleDraft {
  const services = sample.services.length
    ? sample.services
    : ["Service One", "Service Two", "Service Three"];
  return {
    businessName: sample.business_name,
    tagline: `${sample.business_type} website concept`,
    localPositioning: sample.intro_text,
    heroImageUrl: sample.primary_image_url || sample.image_urls[0] || undefined,
    heroImageAlt: `${sample.business_name} featured image`,
    heroHeadline: sample.hero_headline,
    heroSub: sample.hero_subheadline,
    heroPrimaryCta: sample.cta_text,
    heroSecondaryCta: "View Services",
    offeringsTitle: titleFromBusinessType(sample.business_type),
    offerings: services.map((service) => ({
      name: service,
      text: `Professional ${service.toLowerCase()} tailored for ${sample.business_name}.`,
    })),
    aboutTitle: `About ${sample.business_name}`,
    aboutText: sample.intro_text,
    trustTitle: "What customers say",
    trustQuotes: [
      {
        quote: "Fast response, clear communication, and a professional experience from start to finish.",
        by: "Local customer",
      },
      {
        quote: "This business is easy to work with and consistently delivers quality results.",
        by: "Repeat client",
      },
    ],
    locationTitle: "Location & Contact",
    locationName: sample.business_name,
    address: "Serving the local area",
    phone: "(555) 555-0199",
    hours: sampleHours(sample.business_type),
    finalTitle: "Like this direction?",
    finalSub: "I can turn this sample into your real live website with your exact content and branding.",
    finalCta: "Request Build",
  };
}
