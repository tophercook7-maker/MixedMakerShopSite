import type { SampleDraft } from "@/app/(public)/website-samples/[slug]/sample-draft-client";

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

type LeadSampleAutofillResult = {
  sample: LeadSampleRecord;
  filledFields: string[];
  sources: Record<string, string>;
};

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

function readableBusinessType(category: string): string {
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

const SERVICES_BY_CATEGORY: Array<{ key: string; services: string[] }> = [
  {
    key: "detail",
    services: ["Exterior Detailing", "Interior Detailing", "Full Detail Packages"],
  },
  {
    key: "pressure wash",
    services: ["Driveway Cleaning", "House Washing", "Deck & Patio Cleaning"],
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

function introFromInsights(args: {
  issue: string;
  quickFixSummary: string;
  notes: string[];
  hasWebsite: boolean;
}): string {
  const source = [args.issue, args.quickFixSummary, ...args.notes].join(" ").toLowerCase();
  if (!args.hasWebsite || source.includes("no website")) {
    return "Right now, customers may not have a clear online place to learn about your business or contact you. This sample shows how a modern site can build trust and turn visitors into real inquiries.";
  }
  if (source.includes("contact") || source.includes("hard to find")) {
    return "Right now, customers may have trouble quickly finding your contact info. This sample shows how a clearer layout can help turn visitors into real inquiries.";
  }
  return "Make it easier for customers to find you, trust your work, and contact you. This sample focuses on a cleaner layout built to convert visits into calls.";
}

export function autofillLeadSample(
  input: Partial<LeadSampleRecord>,
  context: LeadSampleAutofillContext
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
  if (headlineEmpty) {
    sample.hero_headline = city
      ? `Professional ${typeLabel} in ${city}`
      : typeLabel
        ? `Get More Calls for Your ${typeLabel} Business`
        : `A Better Website for ${businessName}`;
    filledFields.push("hero_headline");
    sources.hero_headline = city ? "category+city" : "category";
  }

  const subheadlineEmpty =
    !String(sample.hero_subheadline || "").trim() ||
    isPlaceholderLike(sample.hero_subheadline, [
      "this sample shows how your business could look online with clearer messaging and stronger calls to action.",
    ]);
  if (subheadlineEmpty) {
    sample.hero_subheadline = "Turn more visitors into calls with a cleaner, modern layout.";
    filledFields.push("hero_subheadline");
    sources.hero_subheadline = "benefit_template";
  }

  const introEmpty =
    !String(sample.intro_text || "").trim() ||
    isPlaceholderLike(sample.intro_text, [
      "we help local businesses make a stronger first impression and turn more visitors into calls.",
      "this sample is tailored for your business and can be refined into a live production site.",
    ]);
  if (introEmpty) {
    sample.intro_text = introFromInsights({
      issue,
      quickFixSummary,
      notes,
      hasWebsite: Boolean(String(context.website || "").trim()),
    });
    filledFields.push("intro_text");
    sources.intro_text = "lead_insights";
  }

  const servicesEmpty =
    sample.services.length === 0 ||
    sample.services.every((entry) => /^service (one|two|three)$/i.test(String(entry || "").trim()));
  if (servicesEmpty) {
    const mapped = servicesFromCategory(category || sample.business_type);
    sample.services = mapped.length ? mapped.slice(0, 6) : ["Service One", "Service Two", "Service Three"];
    if (mapped.length) {
      filledFields.push("services");
      sources.services = "category";
    }
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
    sample.image_urls = withImages.image_urls;
    sample.additional_image_urls = withImages.additional_image_urls;
    sample.gallery_image_urls = withImages.gallery_image_urls;
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
  const heroImage =
    sample.images.find((entry) => entry.role === "hero")?.src ||
    sample.primary_image_url ||
    sample.additional_image_urls[0] ||
    sample.image_urls[0] ||
    undefined;
  const galleryImages = sample.images
    .filter((entry) => entry.role === "gallery")
    .map((entry) => entry.src)
    .filter(Boolean);
  return {
    businessName: sample.business_name,
    tagline: `${sample.business_type} website concept`,
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
      text: `Professional ${service.toLowerCase()} tailored for ${sample.business_name}.`,
      image: galleryImages[idx] || sample.additional_image_urls[idx] || sample.image_urls[idx] || undefined,
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
