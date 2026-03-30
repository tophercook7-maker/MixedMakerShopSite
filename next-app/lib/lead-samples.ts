import type { SampleDraft } from "@/lib/sample-draft-types";

export type LeadSampleStatus = "draft" | "ready" | "sent";
export type LeadSampleSource = "server" | "local";
export type LeadSampleImageSource = "upload" | "url" | "stock";
export type LeadSampleImageRole = "hero" | "gallery";
export type LeadSampleImage = {
  id: string;
  src: string;
  source: LeadSampleImageSource;
  role: LeadSampleImageRole;
  label?: string;
};

export type LeadSampleRecord = {
  id: string;
  lead_id: string;
  template_key: string;
  business_name: string;
  business_type: string;
  site_goal: string;
  headline_style: string;
  cta_style: string;
  visual_theme: string;
  template_type: string;
  suggested_image_category: string;
  hero_headline: string;
  hero_subheadline: string;
  cta_text: string;
  intro_text: string;
  services: string[];
  images: LeadSampleImage[];
  additional_image_urls: string[];
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

type LeadSampleAutofillContext = {
  businessName?: string | null;
  category?: string | null;
  city?: string | null;
  issue?: string | null;
  quickFixSummary?: string | null;
  notes?: string[];
  website?: string | null;
};

export const BUSINESS_TYPE_OPTIONS = [
  "Auto Detailing",
  "Pressure Washing",
  "Landscaping",
  "Roofing",
  "Plumbing",
  "HVAC",
  "Church",
  "Restaurant",
  "Coffee Shop",
  "Small Business",
  "Other",
] as const;

export const SITE_GOAL_OPTIONS = [
  "Get More Calls",
  "Get More Quote Requests",
  "Make Contact Easier",
  "Build Trust",
  "Show Services Clearly",
  "Modernize Online Presence",
] as const;

export const HEADLINE_STYLE_OPTIONS = [
  "Professional [Business Type] in [City]",
  "Get More Calls for Your [Business Type] Business",
  "A Better Website for [Business Name]",
  "Clean, Modern Website for [Business Type]",
] as const;

export const CTA_STYLE_OPTIONS = [
  "Call Now",
  "Get Quote",
  "Request Estimate",
  "Contact Us",
  "Book Service",
] as const;

export const VISUAL_THEME_OPTIONS = [
  "Clean / Modern",
  "Bold / High Contrast",
  "Local Service Pro",
  "Friendly / Community",
  "Premium / Refined",
] as const;

export const TEMPLATE_TYPE_OPTIONS = [
  "Service Business",
  "Before / After Focus",
  "Simple Lead Gen",
  "Local Trust Builder",
] as const;

export type LeadSampleAutofillResult = {
  sample: LeadSampleRecord;
  filledFields: string[];
  sources: Record<string, string>;
};

export type LeadSampleAutofillOptions = {
  /** Overwrite headline, subheadline, services, trust intro, and CTA with smart lead-based defaults. */
  forcePersonalizedCopy?: boolean;
};

const PLACEHOLDER_SUBHEADLINE_SNIPPETS = [
  "this sample shows how your business could look online with clearer messaging and stronger calls to action.",
  "turn more visitors into calls with a cleaner, modern layout.",
];

function isWeakHeroHeadline(value: string): boolean {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return true;
  if (isPlaceholderLike(value, ["a cleaner, more modern website for your business"])) return true;
  if (v === "a better website for business name") return true;
  if (v.startsWith("clean, modern website for service business")) return true;
  if (v.startsWith("get more calls for your service business business")) return true;
  return false;
}

function isWeakSubheadline(value: string): boolean {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return true;
  return PLACEHOLDER_SUBHEADLINE_SNIPPETS.some((s) => v.includes(s)) || v.length < 24;
}

export const IMAGE_POOLS: Record<string, string[]> = {
  detailing: [
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1400&q=80",
  ],
  pressure_washing: [
    "https://images.unsplash.com/photo-1597002973461-1b79a8e3d67f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1400&q=80",
  ],
  landscaping: [
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1400&q=80",
  ],
  service_business: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1400&q=80",
  ],
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

function asLeadSampleImageSource(value: unknown): LeadSampleImageSource {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "upload" || normalized === "url" || normalized === "stock") return normalized;
  return "url";
}

function asLeadSampleImageRole(value: unknown): LeadSampleImageRole {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "hero" ? "hero" : "gallery";
}

function asLeadSampleImages(value: unknown): LeadSampleImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const src = String(record.src || "").trim();
      if (!src) return null;
      return {
        id: String(record.id || "").trim() || crypto.randomUUID(),
        src,
        source: asLeadSampleImageSource(record.source),
        role: asLeadSampleImageRole(record.role),
        label: String(record.label || "").trim() || undefined,
      } as LeadSampleImage;
    })
    .filter((entry): entry is LeadSampleImage => Boolean(entry));
}

function isPlaceholderLike(value: string, placeholders: string[]): boolean {
  const normalized = String(value || "").trim().toLowerCase();
  return placeholders.some((entry) => normalized === String(entry || "").trim().toLowerCase());
}

function categoryTokens(input: string): string[] {
  return String(input || "")
    .split(/[,&/|+]| and /gi)
    .map((item) => item.trim())
    .map((item) => item.replace(/[_-]+/g, " "))
    .filter(Boolean);
}

const CATEGORY_LABELS: Record<string, string> = {
  detailing: "Auto Detailing",
  "auto detailing": "Auto Detailing",
  "car detailing": "Auto Detailing",
  pressure: "Pressure Washing",
  "pressure washing": "Pressure Washing",
  "pressure washer": "Pressure Washing",
  landscaping: "Landscaping",
  plumber: "Plumbing",
  plumbing: "Plumbing",
  hvac: "HVAC",
  roofing: "Roofing",
  roofer: "Roofing",
  lawn: "Lawn Care",
};

export function readableBusinessType(category: string): string {
  const raw = categoryTokens(category);
  if (!raw.length) return "Service Business";
  const labels = raw.map((token) => {
    const lower = token.toLowerCase();
    for (const [key, value] of Object.entries(CATEGORY_LABELS)) {
      if (lower.includes(key)) return value;
    }
    return token
      .split(/\s+/g)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  });
  return Array.from(new Set(labels)).join(" & ");
}

/** Detects common local-service combos from lead category / business type text. */
export function detectLeadOfferingsSegments(text: string): {
  detailing: boolean;
  pressureWashing: boolean;
} {
  const lower = String(text || "").toLowerCase();
  const detailing =
    /\bdetail|\bdetailing|mobile detail|auto detail|car detail|ceramic|wash and wax|interior clean/i.test(lower);
  const pressureWashing =
    /pressure wash|power wash|soft wash|house wash|driveway clean|sidewalk|deck.{0,8}patio|exterior wash/i.test(
      lower
    ) || (lower.includes("washing") && lower.includes("pressure"));
  return { detailing, pressureWashing };
}

export function buildPersonalizedHeadline(input: {
  category: string;
  businessTypeLabel: string;
  businessName: string;
  city?: string | null;
}): string {
  const name = String(input.businessName || "Your Business").trim() || "Your Business";
  const raw = `${input.category || ""} ${input.businessTypeLabel || ""}`;
  const { detailing, pressureWashing } = detectLeadOfferingsSegments(raw);
  if (detailing && pressureWashing) {
    return "Mobile Detailing & Pressure Washing That Helps You Stand Out";
  }
  if (detailing) {
    return "Auto Detailing That Makes Your Vehicle Look Its Best";
  }
  if (pressureWashing) {
    return "Professional Pressure Washing for Homes, Driveways, and More";
  }
  return `A Better Website for ${name}`;
}

export function buildPersonalizedSubheadline(hasWebsite: boolean): string {
  return hasWebsite
    ? "Make it easier for customers to see your services, trust your work, and request a quote."
    : "A clean, modern website can help turn local visitors into real calls.";
}

export function buildLocalTrustLine(input: { city?: string | null; businessName?: string | null }): string {
  const city = String(input.city || "").trim();
  if (city) {
    return `Serving ${city} and nearby customers with reliable service and quick response.`;
  }
  return "Built to help nearby customers find you fast and request a quote.";
}

export function pickCtaPairFromSiteGoal(siteGoal: string): { cta_style: string; cta_text: string } {
  const g = String(siteGoal || "").toLowerCase();
  if (g.includes("call")) return { cta_style: "Call Now", cta_text: "Call Now" };
  if (g.includes("quote request") || g.includes("quote")) return { cta_style: "Request Estimate", cta_text: "Request Estimate" };
  if (g.includes("contact easier") || g.includes("contact")) return { cta_style: "Get Quote", cta_text: "Get Quote" };
  if (g.includes("trust")) return { cta_style: "Request Estimate", cta_text: "Request Estimate" };
  if (g.includes("show service") || g.includes("clearly")) return { cta_style: "Book Service", cta_text: "Book Service" };
  if (g.includes("modern")) return { cta_style: "Get Quote", cta_text: "Get Quote" };
  return { cta_style: "Get Quote", cta_text: "Get Quote" };
}

const SERVICES_BY_CATEGORY: Array<{ key: string; services: string[] }> = [
  {
    key: "detail",
    services: ["Mobile Detailing", "Interior Cleaning", "Exterior Wash & Wax", "Full Detail Packages"],
  },
  {
    key: "pressure wash",
    services: ["Driveway Cleaning", "House Washing", "Deck & Patio Cleaning", "Sidewalk Cleaning"],
  },
  {
    key: "landscap",
    services: ["Lawn Maintenance", "Landscape Design", "Seasonal Cleanup"],
  },
  {
    key: "plumb",
    services: ["Drain Cleaning", "Water Heater Service", "Emergency Plumbing Repair"],
  },
  {
    key: "hvac",
    services: ["AC Repair", "Heating Tune-Ups", "System Installation"],
  },
  {
    key: "roof",
    services: ["Roof Inspections", "Leak Repair", "Shingle Replacement"],
  },
];

function servicesFromCategory(category: string): string[] {
  const lower = String(category || "").toLowerCase();
  const merged: string[] = [];
  for (const entry of SERVICES_BY_CATEGORY) {
    if (lower.includes(entry.key)) {
      for (const service of entry.services) {
        if (!merged.includes(service)) merged.push(service);
      }
    }
  }
  return merged;
}

export function getSuggestedServicesForBusinessType(businessType: string): string[] {
  const mapped = servicesFromCategory(businessType);
  if (mapped.length) return mapped.slice(0, 8);
  return ["Core Service", "Popular Service", "Premium Service"];
}

function inferSiteGoalFromInsights(issue: string, hasWebsite: boolean): string {
  const lower = String(issue || "").toLowerCase();
  if (!hasWebsite || lower.includes("no website")) return "Modernize Online Presence";
  if (lower.includes("contact") || lower.includes("hard to find")) return "Make Contact Easier";
  if (lower.includes("cta") || lower.includes("call")) return "Get More Calls";
  if (lower.includes("trust") || lower.includes("outdated")) return "Build Trust";
  return "Get More Calls";
}

export function buildHeadlineFromStyle(input: {
  style: string;
  businessType: string;
  city?: string | null;
  businessName?: string | null;
}): string {
  const style = String(input.style || "").trim();
  const businessType = String(input.businessType || "Service Business").trim();
  const city = String(input.city || "").trim();
  const businessName = String(input.businessName || "Your Business").trim();
  if (style === "Professional [Business Type] in [City]") {
    return city ? `Professional ${businessType} in ${city}` : `Professional ${businessType}`;
  }
  if (style === "Get More Calls for Your [Business Type] Business") {
    return `Get More Calls for Your ${businessType} Business`;
  }
  if (style === "A Better Website for [Business Name]") {
    return `A Better Website for ${businessName}`;
  }
  return `Clean, Modern Website for ${businessType}`;
}

function mapThemeToAccentMode(theme: string): string {
  const normalized = String(theme || "").toLowerCase();
  if (normalized.includes("bold")) return "bold-premium";
  if (normalized.includes("friendly") || normalized.includes("community")) return "friendly-local";
  if (normalized.includes("premium")) return "minimal-elegant";
  if (normalized.includes("local service")) return "clean-modern";
  return "clean-modern";
}

function mapTemplateTypeToKey(templateType: string): string {
  const normalized = String(templateType || "").toLowerCase();
  if (normalized.includes("before")) return "before-after";
  if (normalized.includes("lead gen")) return "lead-gen";
  if (normalized.includes("trust")) return "local-trust";
  return "service-business";
}

function resolveImagePoolKey(category: string): keyof typeof IMAGE_POOLS {
  const lower = String(category || "").toLowerCase();
  if (lower.includes("detail")) return "detailing";
  if (lower.includes("pressure")) return "pressure_washing";
  if (lower.includes("landscap") || lower.includes("lawn")) return "landscaping";
  return "service_business";
}

function randomSubset(values: string[], count: number): string[] {
  const cloned = [...values];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned.slice(0, Math.max(1, Math.min(count, cloned.length)));
}

export function applyRandomImagesToSample(
  input: Partial<LeadSampleRecord>,
  category: string,
  opts?: { force?: boolean; minAdditional?: number; maxAdditional?: number }
): { sample: LeadSampleRecord; poolKey: keyof typeof IMAGE_POOLS } {
  const sample = normalizeLeadSampleRecord(input);
  const poolKey = resolveImagePoolKey(category || sample.business_type);
  const pool = IMAGE_POOLS[poolKey] || IMAGE_POOLS.service_business;
  const force = Boolean(opts?.force);
  const minAdditional = Math.max(2, Number(opts?.minAdditional ?? 2));
  const maxAdditional = Math.max(minAdditional, Number(opts?.maxAdditional ?? 4));
  const additionalCount = Math.min(pool.length - 1, Math.max(minAdditional, Math.floor(Math.random() * (maxAdditional - minAdditional + 1)) + minAdditional));

  const primaryEmpty = !String(sample.primary_image_url || "").trim();
  const additionalEmpty = sample.image_urls.length === 0 && sample.additional_image_urls.length === 0;
  if (force || primaryEmpty || additionalEmpty) {
    const picked = randomSubset(pool, Math.max(2, additionalCount + 1));
    const primary = picked[0] || pool[0] || "";
    const additional = picked.slice(1, additionalCount + 1);
    const nextImages: LeadSampleImage[] = [
      ...(primary
        ? [
            {
              id: crypto.randomUUID(),
              src: primary,
              source: "stock" as const,
              role: "hero" as const,
              label: "Hero image",
            },
          ]
        : []),
      ...additional.map((url, idx) => ({
        id: crypto.randomUUID(),
        src: url,
        source: "stock" as const,
        role: "gallery" as const,
        label: `Gallery image ${idx + 1}`,
      })),
    ];
    sample.images = nextImages;
    sample.primary_image_url = primary;
    sample.image_urls = additional;
    sample.additional_image_urls = additional;
    sample.gallery_image_urls = additional.slice(0, 3);
  }
  return { sample: normalizeLeadSampleRecord(sample), poolKey };
}

export function autofillLeadSample(
  input: Partial<LeadSampleRecord>,
  context: LeadSampleAutofillContext,
  options?: LeadSampleAutofillOptions
): LeadSampleAutofillResult {
  const sample = normalizeLeadSampleRecord(input);
  const filledFields: string[] = [];
  const sources: Record<string, string> = {};
  const category = String(context.category || "").trim();
  const city = String(context.city || "").trim();
  const businessName = String(context.businessName || sample.business_name || "Business").trim();
  const issue = String(context.issue || "").trim();
  const quickFixSummary = String(context.quickFixSummary || "").trim();
  const notes = Array.isArray(context.notes) ? context.notes.map((n) => String(n || "").trim()).filter(Boolean) : [];
  const typeLabel = readableBusinessType(category || sample.business_type);
  const hasWebsite = Boolean(String(context.website || "").trim());
  const force = Boolean(options?.forcePersonalizedCopy);

  const siteGoalEmpty = !String(sample.site_goal || "").trim();
  if (siteGoalEmpty || force) {
    sample.site_goal = inferSiteGoalFromInsights(issue || quickFixSummary, hasWebsite);
    filledFields.push("site_goal");
    sources.site_goal = force && !siteGoalEmpty ? "lead_insights_refresh" : "lead_insights";
  }

  const visualThemeEmpty = !String(sample.visual_theme || "").trim();
  if (visualThemeEmpty) {
    sample.visual_theme = "Clean / Modern";
    sample.accent_mode = mapThemeToAccentMode(sample.visual_theme);
    filledFields.push("visual_theme");
    sources.visual_theme = "default";
  }

  const templateTypeEmpty = !String(sample.template_type || "").trim();
  if (templateTypeEmpty) {
    sample.template_type = "Service Business";
    sample.template_key = mapTemplateTypeToKey(sample.template_type);
    filledFields.push("template_type");
    sources.template_type = "default";
  }

  const ctaPair = pickCtaPairFromSiteGoal(sample.site_goal);
  const ctaStyleEmpty = !String(sample.cta_style || "").trim();
  if (ctaStyleEmpty || force) {
    sample.cta_style = ctaPair.cta_style;
    filledFields.push("cta_style");
    sources.cta_style = force ? "site_goal_force" : "site_goal";
  }

  const ctaTextEmpty = !String(sample.cta_text || "").trim() || isPlaceholderLike(sample.cta_text, ["get started"]);
  if (ctaTextEmpty || force) {
    sample.cta_text = ctaPair.cta_text;
    filledFields.push("cta_text");
    sources.cta_text = force ? "site_goal_force" : "cta_style";
  }

  const headlineStyleEmpty = !String(sample.headline_style || "").trim();
  if (headlineStyleEmpty) {
    sample.headline_style = city
      ? "Professional [Business Type] in [City]"
      : "Get More Calls for Your [Business Type] Business";
    filledFields.push("headline_style");
    sources.headline_style = city ? "city" : "default";
  }

  const businessTypeEmpty =
    !String(sample.business_type || "").trim() ||
    isPlaceholderLike(sample.business_type, ["service business", "business type"]);
  if (businessTypeEmpty) {
    sample.business_type = typeLabel;
    filledFields.push("business_type");
    sources.business_type = "category";
  }

  const headlineEmpty =
    !String(sample.hero_headline || "").trim() ||
    isPlaceholderLike(sample.hero_headline, ["a cleaner, more modern website for your business"]);
  if (force || headlineEmpty || isWeakHeroHeadline(sample.hero_headline)) {
    sample.hero_headline = buildPersonalizedHeadline({
      category: `${category} ${sample.business_type}`,
      businessTypeLabel: typeLabel,
      businessName,
      city,
    });
    filledFields.push("hero_headline");
    sources.hero_headline = force ? "personalized_force" : "personalized_lead";
  }

  const subheadlineEmpty =
    !String(sample.hero_subheadline || "").trim() ||
    isPlaceholderLike(sample.hero_subheadline, [
      "this sample shows how your business could look online with clearer messaging and stronger calls to action.",
    ]);
  if (force || subheadlineEmpty || isWeakSubheadline(sample.hero_subheadline)) {
    sample.hero_subheadline = buildPersonalizedSubheadline(hasWebsite);
    filledFields.push("hero_subheadline");
    sources.hero_subheadline = force ? "personalized_force" : "personalized_lead";
  }

  const introEmpty =
    !String(sample.intro_text || "").trim() ||
    isPlaceholderLike(sample.intro_text, [
      "we help local businesses make a stronger first impression and turn more visitors into calls.",
      "this sample is tailored for your business and can be refined into a live production site.",
    ]);
  if (force || introEmpty) {
    sample.intro_text = buildLocalTrustLine({ city, businessName });
    filledFields.push("intro_text");
    sources.intro_text = "local_trust_line";
  }

  const servicesEmpty =
    sample.services.length === 0 ||
    sample.services.every((entry) => /^service (one|two|three)$/i.test(String(entry || "").trim()));
  if (force || servicesEmpty) {
    const mapped = servicesFromCategory(`${category} ${sample.business_type}`);
    const nextServices = mapped.length
      ? mapped.slice(0, 8)
      : getSuggestedServicesForBusinessType(typeLabel).slice(0, 6);
    sample.services = nextServices.length ? nextServices : ["Service One", "Service Two", "Service Three"];
    filledFields.push("services");
    sources.services = force ? "category_force" : "category";
  }

  const imageUrlsEmpty = sample.image_urls.length === 0;
  const additionalImageUrlsEmpty = sample.additional_image_urls.length === 0;
  const primaryImageEmpty = !String(sample.primary_image_url || "").trim();
  if (imageUrlsEmpty || additionalImageUrlsEmpty || primaryImageEmpty) {
    const { sample: withImages, poolKey } = applyRandomImagesToSample(sample, category || sample.business_type, {
      force: false,
      minAdditional: 2,
      maxAdditional: 4,
    });
    sample.primary_image_url = withImages.primary_image_url;
    sample.images = withImages.images;
    sample.image_urls = withImages.image_urls;
    sample.additional_image_urls = withImages.additional_image_urls;
    sample.gallery_image_urls = withImages.gallery_image_urls;
    sample.suggested_image_category = String(poolKey || "service_business");
    if (primaryImageEmpty) {
      filledFields.push("primary_image_url");
      sources.primary_image_url = `image_pool:${poolKey}`;
    }
    if (imageUrlsEmpty || additionalImageUrlsEmpty) {
      filledFields.push("additional_image_urls");
      sources.additional_image_urls = `image_pool:${poolKey}`;
    }
  }

  if (!String(sample.business_name || "").trim() && businessName) {
    sample.business_name = businessName;
    filledFields.push("business_name");
    sources.business_name = "lead";
  }

  return {
    sample: normalizeLeadSampleRecord(sample),
    filledFields,
    sources,
  };
}

export function normalizeLeadSampleRecord(input: Partial<LeadSampleRecord>): LeadSampleRecord {
  const now = new Date().toISOString();
  const imagesFromInput = asLeadSampleImages(input.images);
  const additionalImages = asStringArray(input.additional_image_urls);
  const imageUrls = asStringArray(input.image_urls);
  const mergedAdditionalImages = additionalImages.length ? additionalImages : imageUrls;
  const heroFromImages =
    imagesFromInput.find((entry) => entry.role === "hero") || imagesFromInput[0] || null;
  const galleryFromImages = imagesFromInput
    .filter((entry) => entry.role === "gallery")
    .map((entry) => entry.src)
    .filter(Boolean);
  const resolvedPrimaryImage = heroFromImages?.src || asString(input.primary_image_url);
  const resolvedAdditionalImages = galleryFromImages.length
    ? galleryFromImages
    : mergedAdditionalImages.filter((url) => url !== resolvedPrimaryImage);
  const resolvedImages = imagesFromInput.length
    ? imagesFromInput
    : [
        ...(resolvedPrimaryImage
          ? [
              {
                id: crypto.randomUUID(),
                src: resolvedPrimaryImage,
                source: "url" as const,
                role: "hero" as const,
                label: "Hero image",
              },
            ]
          : []),
        ...resolvedAdditionalImages.map((url, idx) => ({
          id: crypto.randomUUID(),
          src: url,
          source: "url" as const,
          role: "gallery" as const,
          label: `Gallery image ${idx + 1}`,
        })),
      ];
  return {
    id: asString(input.id, crypto.randomUUID()),
    lead_id: asString(input.lead_id),
    template_key: asString(input.template_key, "service-business"),
    business_name: asString(input.business_name, "Business Name"),
    business_type: asString(input.business_type, "service business"),
    site_goal: asString(input.site_goal, "Get More Calls"),
    headline_style: asString(input.headline_style, "Get More Calls for Your [Business Type] Business"),
    cta_style: asString(input.cta_style, "Get Quote"),
    visual_theme: asString(input.visual_theme, "Clean / Modern"),
    template_type: asString(input.template_type, "Service Business"),
    suggested_image_category: asString(input.suggested_image_category, "service_business"),
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
    images: resolvedImages,
    additional_image_urls: resolvedAdditionalImages,
    image_urls: resolvedAdditionalImages,
    primary_image_url: resolvedPrimaryImage,
    gallery_image_urls: asStringArray(input.gallery_image_urls).length
      ? asStringArray(input.gallery_image_urls)
      : resolvedAdditionalImages.slice(0, 3),
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
  return "What We Offer";
}

function whyChooseBulletsForBusiness(businessName: string, businessType: string): string[] {
  const t = businessType.toLowerCase();
  const name = businessName.trim() || "our team";
  if (t.includes("church")) {
    return [
      "Clear service times, directions, and ways to get involved — easy for newcomers.",
      "Warm, trustworthy first impression that reflects your community.",
      "Simple contact paths for questions, prayer, and volunteering.",
    ];
  }
  if (t.includes("restaurant") || t.includes("coffee") || t.includes("food")) {
    return [
      "Mouth-watering visuals and menu highlights that drive reservations and orders.",
      "Mobile-friendly layout so hungry customers can find you on the go.",
      "Strong calls to action: call, order, or get directions in one tap.",
    ];
  }
  if (t.includes("lawn") || t.includes("landscap")) {
    return [
      "Before/after style presentation that sells your craftsmanship.",
      "Local SEO-friendly structure so neighbors find you first.",
      "Fast quote requests — fewer back-and-forth texts.",
    ];
  }
  return [
    `${name} looks professional online — builds trust before the first call.`,
    "Clear services, proof of work, and easy ways to reach you.",
    "Built for phones: most customers will browse you from their device.",
  ];
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

function imageSourcePriority(source: LeadSampleImageSource): number {
  if (source === "upload") return 0;
  if (source === "url") return 1;
  return 2;
}

export function leadSampleToDraft(sample: LeadSampleRecord): SampleDraft {
  const services = sample.services.length
    ? sample.services
    : ["Service One", "Service Two", "Service Three"];
  const prioritizedImages = [...sample.images].sort(
    (a, b) => imageSourcePriority(a.source) - imageSourcePriority(b.source)
  );
  const heroImage =
    prioritizedImages.find((entry) => entry.role === "hero")?.src ||
    prioritizedImages[0]?.src ||
    sample.primary_image_url ||
    sample.additional_image_urls[0] ||
    sample.image_urls[0] ||
    undefined;
  const galleryImages = prioritizedImages
    .filter((entry) => entry.role === "gallery")
    .map((entry) => entry.src)
    .filter(Boolean);
  const extraGallery = [...sample.additional_image_urls, ...sample.image_urls, ...sample.gallery_image_urls].filter(
    (url, i, arr) => url && arr.indexOf(url) === i
  );
  const mergedGallery = [...galleryImages, ...extraGallery]
    .filter((url, i, arr) => url && arr.indexOf(url) === i)
    .filter((url) => url !== heroImage)
    .slice(0, 8);
  return {
    businessName: sample.business_name,
    tagline: `${sample.business_type} · local service`,
    localPositioning: sample.intro_text,
    heroImageUrl: heroImage,
    heroImageAlt: `${sample.business_name} featured image`,
    heroHeadline: sample.hero_headline,
    heroSub: sample.hero_subheadline,
    heroPrimaryCta: sample.cta_text,
    heroSecondaryCta: "View Services",
    offeringsTitle: titleFromBusinessType(sample.business_type),
    offerings: services.map((service, idx) => ({
      name: service,
      text: `Clear description and strong call-to-action for ${service} — built around how ${sample.business_name} actually serves customers.`,
      image: galleryImages[idx] || sample.additional_image_urls[idx] || sample.image_urls[idx] || undefined,
    })),
    gallerySectionTitle: "See your business visually",
    galleryImages: mergedGallery,
    whyChooseTitle: `Why customers choose ${sample.business_name}`,
    whyChooseBullets: whyChooseBulletsForBusiness(sample.business_name, sample.business_type),
    aboutTitle: `About ${sample.business_name}`,
    aboutText: `${sample.intro_text} We focus on clear service descriptions, easy contact paths, and a professional first impression.`,
    trustTitle: "What people say",
    trustQuotes: [
      {
        quote: "Fast response, clear communication, and a professional experience from start to finish.",
        by: "Local customer",
      },
      {
        quote: "Easy to get a quote and they follow through — exactly what you want from a local business.",
        by: "Repeat client",
      },
    ],
    locationTitle: "Visit & hours",
    locationName: sample.business_name,
    address: "Serving the local area — we’ll plug in your real address on the live site.",
    phone: "(555) 555-0199",
    hours: sampleHours(sample.business_type),
    contactBandTitle: "Get a quote",
    contactBandSub: "Reach out anytime — we respond quickly during business hours.",
    finalTitle: "Ready for more calls and booked jobs?",
    finalSub: "Tell us what you need — we’ll follow up with next steps and timing.",
    finalCta: "Call now",
  };
}
