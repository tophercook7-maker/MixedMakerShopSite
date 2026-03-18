import { createClient } from "@/lib/supabase/server";
import type { CSSProperties } from "react";
import { ExportBuildBox } from "@/components/admin/export-build-box";

type PreviewParams = {
  business?: string;
  category?: string;
  city?: string;
  phone?: string;
  address?: string;
  rating?: string;
  reviews?: string;
  hide_banner?: string;
  presentation?: string;
  headline?: string;
  subheadline?: string;
  cta?: string;
  secondary_cta?: string;
  services?: string;
  service_1?: string;
  service_2?: string;
  service_3?: string;
  service_4?: string;
  service_5?: string;
  service_6?: string;
  export?: string;
  style_preset?: string;
  color_preset?: string;
};

type LeadPreviewRow = {
  id: string;
  business_name?: string | null;
  category?: string | null;
  city?: string | null;
  phone?: string | null;
  address?: string | null;
};

type PreviewCopy = {
  trust_statement: string;
  headline: string;
  subheadline: string;
  primary_cta: string;
  secondary_cta: string;
  services: string[];
  value_props: Array<{ title: string; description: string }>;
  testimonial_title: string;
  testimonials: Array<{ quote: string; name: string }>;
  hero_points: string[];
  footer_note: string;
  palette: {
    background: string;
    surface: string;
    surface_soft: string;
    text: string;
    muted: string;
    primary: string;
    primary_text: string;
    accent: string;
    border: string;
    shadow: string;
  };
  hero_layout: "contractor" | "auto" | "church" | "restaurant" | "clinic" | "outdoor";
};

type DraftSection =
  | {
      type: "hero";
      headline: string;
      subheadline: string;
      cta_primary: string;
      cta_secondary: string;
    }
  | {
      type: "services";
      items: string[];
    }
  | {
      type: "trust";
      bullets: string[];
    }
  | {
      type: "about";
      title: string;
      body: string;
      bullets: string[];
    }
  | {
      type: "testimonial";
      items: Array<{ quote: string; name: string }>;
    }
  | {
      type: "contact";
      phone: string;
      address: string;
      cta: string;
    };

type ClientSiteDraft = {
  business_name: string;
  category: string;
  city: string;
  sections: DraftSection[];
  style: {
    theme: PreviewCopy["hero_layout"];
    style_preset: StylePreset;
    color_preset: ColorPreset;
    colors: PreviewCopy["palette"];
    spacing: "compact" | "comfortable" | "airy";
    font_scale: "md" | "lg" | "xl";
    button_style: "pill" | "rounded" | "soft-square" | "minimal";
    border_radius: "soft" | "rounded" | "curved";
    shadows: "subtle" | "medium" | "strong";
    section_contrast: "low" | "medium" | "high";
    card_style: "outlined" | "soft" | "elevated";
    visual_mood: "clean" | "bold" | "friendly" | "elegant";
  };
};

type StylePreset = "clean_modern" | "bold_premium" | "friendly_local" | "minimal_elegant";
type ColorPreset = "blue" | "green" | "dark" | "warm_neutral" | "bold_accent";

function isInCategory(category: string, keywords: string[]): boolean {
  const c = String(category || "").toLowerCase();
  return keywords.some((k) => c.includes(k));
}

function safeBusinessName(name: string): string {
  const cleaned = String(name || "").trim();
  return cleaned || "Business Name";
}

function safeCity(city: string): string {
  const cleaned = String(city || "").trim();
  return cleaned || "the local community";
}

function parseNumber(value: string | undefined): number | null {
  const parsed = Number(String(value || "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseStylePreset(value: string | undefined): StylePreset {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "bold_premium") return "bold_premium";
  if (raw === "friendly_local") return "friendly_local";
  if (raw === "minimal_elegant") return "minimal_elegant";
  return "clean_modern";
}

function parseColorPreset(value: string | undefined): ColorPreset {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "green") return "green";
  if (raw === "dark") return "dark";
  if (raw === "warm_neutral") return "warm_neutral";
  if (raw === "bold_accent") return "bold_accent";
  return "blue";
}

function defaultColorForStyle(stylePreset: StylePreset): ColorPreset {
  if (stylePreset === "bold_premium") return "dark";
  if (stylePreset === "friendly_local") return "warm_neutral";
  if (stylePreset === "minimal_elegant") return "warm_neutral";
  return "blue";
}

function paletteForColorPreset(preset: ColorPreset): PreviewCopy["palette"] {
  if (preset === "green") {
    return {
      background: "#edf7f1",
      surface: "#ffffff",
      surface_soft: "#e3f2e8",
      text: "#173229",
      muted: "#4a6358",
      primary: "#1f7a4b",
      primary_text: "#ffffff",
      accent: "#66a44a",
      border: "#cce1d3",
      shadow: "0 22px 52px rgba(31, 122, 75, 0.16)",
    };
  }
  if (preset === "dark") {
    return {
      background: "#0f1115",
      surface: "#171b23",
      surface_soft: "#1f2631",
      text: "#f3f4f6",
      muted: "#b5bdc9",
      primary: "#d4a63d",
      primary_text: "#111318",
      accent: "#4f8cff",
      border: "#2b3445",
      shadow: "0 26px 60px rgba(0, 0, 0, 0.48)",
    };
  }
  if (preset === "warm_neutral") {
    return {
      background: "#f6f2ea",
      surface: "#fffdfa",
      surface_soft: "#f1eadf",
      text: "#2d2a24",
      muted: "#676057",
      primary: "#335f54",
      primary_text: "#ffffff",
      accent: "#a97542",
      border: "#ddd2c3",
      shadow: "0 20px 46px rgba(103, 96, 87, 0.18)",
    };
  }
  if (preset === "bold_accent") {
    return {
      background: "#f6f7ff",
      surface: "#ffffff",
      surface_soft: "#ecefff",
      text: "#17153a",
      muted: "#54507e",
      primary: "#3f34ff",
      primary_text: "#ffffff",
      accent: "#ff6a3d",
      border: "#d8ddff",
      shadow: "0 24px 56px rgba(63, 52, 255, 0.2)",
    };
  }
  return {
    background: "#f4f7fb",
    surface: "#ffffff",
    surface_soft: "#ebf1ff",
    text: "#0f172a",
    muted: "#475569",
    primary: "#1d4ed8",
    primary_text: "#ffffff",
    accent: "#f97316",
    border: "#d8e4ff",
    shadow: "0 22px 52px rgba(29, 78, 216, 0.14)",
  };
}

function styleTokensForPreset(preset: StylePreset) {
  if (preset === "bold_premium") {
    return {
      font_scale: "xl" as const,
      spacing: "airy" as const,
      button_style: "soft-square" as const,
      border_radius: "rounded" as const,
      shadows: "strong" as const,
      section_contrast: "high" as const,
      card_style: "elevated" as const,
      visual_mood: "bold" as const,
      hero_title_size: "clamp(38px, 8vw, 72px)",
      hero_subtitle_size: "clamp(26px, 4vw, 46px)",
      body_size: "clamp(17px, 2.3vw, 21px)",
      section_gap: "28px",
      card_padding: "28px",
      card_radius_px: "18px",
      soft_radius_px: "16px",
      button_radius_px: "12px",
      button_padding: "13px 22px",
      border_weight: "1px",
      card_shadow: "0 24px 54px color-mix(in srgb, var(--primary) 22%, transparent)",
      soft_shadow: "0 14px 32px color-mix(in srgb, var(--primary) 16%, transparent)",
      section_tint: "color-mix(in srgb, var(--primary) 14%, var(--surface-soft))",
      font_family: "\"Sora\", ui-sans-serif, system-ui, sans-serif",
      heading_weight: "800",
    };
  }
  if (preset === "friendly_local") {
    return {
      font_scale: "lg" as const,
      spacing: "comfortable" as const,
      button_style: "rounded" as const,
      border_radius: "curved" as const,
      shadows: "medium" as const,
      section_contrast: "medium" as const,
      card_style: "soft" as const,
      visual_mood: "friendly" as const,
      hero_title_size: "clamp(34px, 7vw, 62px)",
      hero_subtitle_size: "clamp(24px, 3.7vw, 40px)",
      body_size: "clamp(16px, 2.15vw, 19px)",
      section_gap: "24px",
      card_padding: "26px",
      card_radius_px: "24px",
      soft_radius_px: "22px",
      button_radius_px: "999px",
      button_padding: "12px 22px",
      border_weight: "1px",
      card_shadow: "0 16px 36px color-mix(in srgb, var(--primary) 14%, transparent)",
      soft_shadow: "0 8px 20px color-mix(in srgb, var(--primary) 10%, transparent)",
      section_tint: "color-mix(in srgb, var(--accent) 12%, var(--surface-soft))",
      font_family: "\"Manrope\", ui-sans-serif, system-ui, sans-serif",
      heading_weight: "700",
    };
  }
  if (preset === "minimal_elegant") {
    return {
      font_scale: "md" as const,
      spacing: "airy" as const,
      button_style: "minimal" as const,
      border_radius: "soft" as const,
      shadows: "subtle" as const,
      section_contrast: "low" as const,
      card_style: "outlined" as const,
      visual_mood: "elegant" as const,
      hero_title_size: "clamp(34px, 7vw, 58px)",
      hero_subtitle_size: "clamp(22px, 3.4vw, 34px)",
      body_size: "clamp(15px, 2vw, 18px)",
      section_gap: "30px",
      card_padding: "30px",
      card_radius_px: "10px",
      soft_radius_px: "10px",
      button_radius_px: "8px",
      button_padding: "11px 18px",
      border_weight: "1px",
      card_shadow: "0 3px 16px color-mix(in srgb, var(--text) 6%, transparent)",
      soft_shadow: "none",
      section_tint: "var(--surface-soft)",
      font_family: "\"DM Sans\", ui-sans-serif, system-ui, sans-serif",
      heading_weight: "700",
    };
  }
  return {
    font_scale: "lg" as const,
    spacing: "comfortable" as const,
    button_style: "pill" as const,
    border_radius: "rounded" as const,
    shadows: "medium" as const,
    section_contrast: "medium" as const,
    card_style: "elevated" as const,
    visual_mood: "clean" as const,
    hero_title_size: "clamp(34px, 8vw, 60px)",
    hero_subtitle_size: "clamp(24px, 4vw, 40px)",
    body_size: "clamp(16px, 2.3vw, 20px)",
    section_gap: "22px",
    card_padding: "28px",
    card_radius_px: "20px",
    soft_radius_px: "18px",
    button_radius_px: "999px",
    button_padding: "12px 20px",
    border_weight: "1px",
    card_shadow: "0 14px 30px color-mix(in srgb, var(--primary) 12%, transparent)",
    soft_shadow: "0 6px 16px color-mix(in srgb, var(--primary) 8%, transparent)",
    section_tint: "color-mix(in srgb, var(--primary) 8%, var(--surface-soft))",
    font_family: "\"Inter\", ui-sans-serif, system-ui, sans-serif",
    heading_weight: "750",
  };
}

function categoryPreviewCopy(category: string, city: string, businessName: string): PreviewCopy {
  const local = safeCity(city);
  const business = safeBusinessName(businessName);
  if (isInCategory(category, ["tire", "auto", "mechanic", "repair shop", "automotive", "brake"])) {
    return {
      trust_statement: `${business} serves drivers across ${local} with dependable turnaround and honest recommendations.`,
      headline: `Auto Service That Gets ${local} Drivers Back on the Road`,
      subheadline:
        `Book repairs, maintenance, and tire service with a team known for clear communication, transparent pricing, and quality workmanship.`,
      primary_cta: "Book Service",
      secondary_cta: "Call Now",
      services: ["Tire Repair & Replacement", "Brake Service", "Oil & Filter Change", "Diagnostics", "Alignment", "Battery Service"],
      value_props: [
        { title: "Straightforward estimates", description: "Clear pricing before work begins so customers can decide confidently." },
        { title: "Fast turnaround", description: "Same-day and next-day scheduling options for common maintenance and repairs." },
        { title: "Skilled technicians", description: "Experienced techs who explain findings in plain language." },
      ],
      testimonial_title: "What Drivers Say",
      testimonials: [
        { quote: "Quick diagnosis, fair pricing, and no pressure. Exactly what we hoped for.", name: "Satisfied customer in " + local },
        { quote: "They kept me updated from drop-off to pickup and got me back on schedule.", name: "Local fleet customer" },
      ],
      hero_points: ["ASE-ready service approach", "Convenient scheduling", "Trusted by repeat local customers"],
      footer_note: `Proudly serving ${local} with reliable automotive care.`,
      palette: {
        background: "#f4f7fb",
        surface: "#ffffff",
        surface_soft: "#eef3ff",
        text: "#0f172a",
        muted: "#475569",
        primary: "#1d4ed8",
        primary_text: "#ffffff",
        accent: "#f97316",
        border: "#dbe5f5",
        shadow: "0 24px 60px rgba(29, 78, 216, 0.12)",
      },
      hero_layout: "auto",
    };
  }
  if (isInCategory(category, ["church", "ministry", "chapel", "fellowship", "worship"])) {
    return {
      trust_statement: `${business} welcomes individuals and families from ${local} with a warm, community-first experience.`,
      headline: "A Welcoming Church Home with Clear Next Steps",
      subheadline:
        `Help first-time visitors find service times, ministries, and ways to get connected before they ever walk through the doors.`,
      primary_cta: "Plan a Visit",
      secondary_cta: "Service Times",
      services: ["Sunday Service Times", "Children & Youth Ministries", "Small Groups", "Prayer Requests", "Community Outreach", "Events Calendar"],
      value_props: [
        { title: "Visitor-friendly flow", description: "Everything newcomers need is easy to find in one place." },
        { title: "Community connection", description: "Clear pathways for joining groups, serving, and upcoming events." },
        { title: "Pastoral accessibility", description: "Simple contact options for prayer, support, and questions." },
      ],
      testimonial_title: "Community Voices",
      testimonials: [
        { quote: "The website made it easy to know where to go and what to expect.", name: "First-time visitor" },
        { quote: "Warm, clear, and welcoming from the first click to the first visit.", name: "Member family" },
      ],
      hero_points: ["Easy first-visit guidance", "Clear ministries overview", "Events and updates in one place"],
      footer_note: `Serving ${local} with faith, care, and community.`,
      palette: {
        background: "#f8f5ef",
        surface: "#ffffff",
        surface_soft: "#fff7e8",
        text: "#1f2937",
        muted: "#4b5563",
        primary: "#7c3aed",
        primary_text: "#ffffff",
        accent: "#f59e0b",
        border: "#e8dfcf",
        shadow: "0 24px 60px rgba(124, 58, 237, 0.13)",
      },
      hero_layout: "church",
    };
  }
  if (isInCategory(category, ["restaurant", "cafe", "coffee", "food", "bistro", "diner", "bar"])) {
    return {
      trust_statement: `${business} is a favorite in ${local} for quality, hospitality, and a smooth ordering experience.`,
      headline: `A Beautiful Online Experience for ${local} Food Lovers`,
      subheadline:
        `Show your menu, hours, and ordering options in a polished format that helps guests decide fast and visit often.`,
      primary_cta: "View Menu",
      secondary_cta: "Order Now",
      services: ["Signature Menu Highlights", "Online Ordering", "Catering Requests", "Reservations", "Private Events", "Seasonal Specials"],
      value_props: [
        { title: "Menu clarity", description: "Make specials, favorites, and ordering options easy to scan on mobile." },
        { title: "Higher order intent", description: "Strong calls-to-action that guide visitors from browsing to ordering." },
        { title: "Brand presentation", description: "A premium look that reflects your in-store experience." },
      ],
      testimonial_title: "Guest Favorites",
      testimonials: [
        { quote: "The menu and online ordering are so easy, we use it every week.", name: "Regular customer in " + local },
        { quote: "Great food and an easy site to navigate when planning group meals.", name: "Local office manager" },
      ],
      hero_points: ["Menu-first navigation", "Fast mobile ordering", "Stronger first impression"],
      footer_note: `Serving ${local} with flavor, hospitality, and consistency.`,
      palette: {
        background: "#fff8f5",
        surface: "#ffffff",
        surface_soft: "#fff1ea",
        text: "#1f2937",
        muted: "#4b5563",
        primary: "#b91c1c",
        primary_text: "#ffffff",
        accent: "#f97316",
        border: "#f3d4c5",
        shadow: "0 24px 60px rgba(185, 28, 28, 0.13)",
      },
      hero_layout: "restaurant",
    };
  }
  if (isInCategory(category, ["chiropractor", "clinic", "medical", "wellness", "physical therapy"])) {
    return {
      trust_statement: `${business} helps patients in ${local} feel better with trusted care and an easy appointment experience.`,
      headline: "Professional Care with a Calm, Confident First Impression",
      subheadline:
        `Present your services, care philosophy, and booking options in a way that builds trust before the first appointment.`,
      primary_cta: "Book Appointment",
      secondary_cta: "Call Today",
      services: ["Initial Consultation", "Chiropractic Adjustments", "Therapeutic Care", "Rehabilitation Planning", "Wellness Programs", "Patient Resources"],
      value_props: [
        { title: "Trust-first messaging", description: "Professional tone and structure that reassures new patients." },
        { title: "Simple booking path", description: "Fewer steps from search to scheduled appointment." },
        { title: "Clear care overview", description: "Explain services and treatment approach in plain, patient-friendly language." },
      ],
      testimonial_title: "Patient Feedback",
      testimonials: [
        { quote: "Easy to book and very clear about what to expect from day one.", name: "Patient in " + local },
        { quote: "Professional, welcoming, and responsive before and after appointments.", name: "Returning patient" },
      ],
      hero_points: ["Patient-centered communication", "Streamlined appointment flow", "Professional clinic brand"],
      footer_note: `Supporting healthier lives across ${local}.`,
      palette: {
        background: "#f3faf8",
        surface: "#ffffff",
        surface_soft: "#e9f7f2",
        text: "#0f172a",
        muted: "#475569",
        primary: "#0f766e",
        primary_text: "#ffffff",
        accent: "#0ea5e9",
        border: "#cfe9e2",
        shadow: "0 24px 60px rgba(15, 118, 110, 0.13)",
      },
      hero_layout: "clinic",
    };
  }
  if (isInCategory(category, ["landscap", "clean", "pressure wash", "power wash", "janitorial"])) {
    return {
      trust_statement: `${business} helps properties across ${local} look their best with dependable scheduling and quality results.`,
      headline: "Professional Property Care with a Premium Local Presence",
      subheadline:
        `Highlight your most requested services, showcase reliability, and make quotes easy to request from any device.`,
      primary_cta: "Get a Quote",
      secondary_cta: "Schedule Service",
      services: ["Landscape Maintenance", "Seasonal Cleanups", "Pressure Washing", "Exterior Cleaning", "Recurring Service Plans", "Commercial Property Care"],
      value_props: [
        { title: "Dependable scheduling", description: "Set clear expectations with transparent service windows." },
        { title: "Visible before-and-after value", description: "Showcase results that motivate customers to book." },
        { title: "Residential and commercial fit", description: "Serve homeowners and local businesses from one polished site." },
      ],
      testimonial_title: "Client Results",
      testimonials: [
        { quote: "Our property has never looked better, and communication has been excellent.", name: "Property owner in " + local },
        { quote: "Reliable team, quality work, and consistent follow-through every visit.", name: "Commercial client" },
      ],
      hero_points: ["Fast quote requests", "Recurring plan visibility", "Professional project presentation"],
      footer_note: `Keeping ${local} properties clean, sharp, and welcoming.`,
      palette: {
        background: "#f2f8f2",
        surface: "#ffffff",
        surface_soft: "#e8f4e8",
        text: "#1f2937",
        muted: "#4b5563",
        primary: "#166534",
        primary_text: "#ffffff",
        accent: "#65a30d",
        border: "#d6e6d6",
        shadow: "0 24px 60px rgba(22, 101, 52, 0.13)",
      },
      hero_layout: "outdoor",
    };
  }
  if (isInCategory(category, ["plumber", "hvac", "electrician", "roof", "contractor", "construction"])) {
    return {
      trust_statement: `${business} is trusted across ${local} for responsive service, clear estimates, and dependable project delivery.`,
      headline: `Reliable ${category || "Contractor"} Service for Homes and Businesses in ${local}`,
      subheadline:
        `Convert more calls with a polished site that emphasizes speed, trust, and straightforward quote requests.`,
      primary_cta: "Get a Quote",
      secondary_cta: "Call Now",
      services: ["Emergency Repair", "Installations", "System Upgrades", "Inspections", "Maintenance Plans", "Same-Day Service"],
      value_props: [
        { title: "Rapid response", description: "Show customers you can respond quickly when issues are urgent." },
        { title: "Clear estimate flow", description: "Guide visitors from first click to quote request without friction." },
        { title: "Licensed, trusted team", description: "Present credentials and quality standards with confidence." },
      ],
      testimonial_title: "Homeowner Confidence",
      testimonials: [
        { quote: "Fast response, professional work, and clear pricing from start to finish.", name: "Homeowner in " + local },
        { quote: "The team showed up on time and delivered exactly what was promised.", name: "Local business owner" },
      ],
      hero_points: ["Quote-focused conversion path", "Emergency-ready positioning", "Trust-forward service messaging"],
      footer_note: `Proudly serving ${local} with reliable, high-quality workmanship.`,
      palette: {
        background: "#f4f6fa",
        surface: "#ffffff",
        surface_soft: "#eaf0ff",
        text: "#0f172a",
        muted: "#475569",
        primary: "#1e3a8a",
        primary_text: "#ffffff",
        accent: "#f97316",
        border: "#d9e2f3",
        shadow: "0 24px 60px rgba(30, 58, 138, 0.14)",
      },
      hero_layout: "contractor",
    };
  }
  return {
    trust_statement: `${business} provides dependable professional service in ${local}.`,
    headline: `A Refined Website Presence for ${business}`,
    subheadline:
      `Present your services clearly, build trust fast, and make it simple for customers to contact your team.`,
    primary_cta: "Contact Us",
    secondary_cta: "Request Info",
    services: ["Consultations", "Service Packages", "Fast Support", "Project Planning"],
    value_props: [
      { title: "Professional brand feel", description: "A premium layout that elevates first impressions immediately." },
      { title: "Clarity and confidence", description: "Service details and trust signals that reduce hesitation." },
      { title: "Action-ready design", description: "Clear calls-to-action throughout the page to increase inquiries." },
    ],
    testimonial_title: "Client Perspective",
    testimonials: [
      { quote: "Clear, professional, and easy to use on mobile.", name: "Recent customer" },
      { quote: "Exactly the kind of polished presence a local company needs.", name: "Business owner" },
    ],
    hero_points: ["Premium design direction", "Mobile-first readability", "Conversion-focused structure"],
    footer_note: `Built to help ${business} stand out in ${local}.`,
    palette: {
      background: "#f6f7fb",
      surface: "#ffffff",
      surface_soft: "#eef2ff",
      text: "#111827",
      muted: "#4b5563",
      primary: "#4338ca",
      primary_text: "#ffffff",
      accent: "#f59e0b",
      border: "#dce2f3",
      shadow: "0 24px 60px rgba(67, 56, 202, 0.14)",
    },
    hero_layout: "contractor",
  };
}

function normalizePhone(phone: string): string {
  const cleaned = String(phone || "").replace(/[^\d+]/g, "");
  return cleaned || "15550100000";
}

function parseServicesFromQuery(qs: PreviewParams, fallback: string[]): string[] {
  const packed = String(qs.services || "").trim();
  let provided: string[] = [];
  if (packed) {
    provided = packed
      .split(/\n|,/g)
      .map((v) => v.trim())
      .filter(Boolean);
  } else {
    provided = [
      String(qs.service_1 || "").trim(),
      String(qs.service_2 || "").trim(),
      String(qs.service_3 || "").trim(),
      String(qs.service_4 || "").trim(),
      String(qs.service_5 || "").trim(),
      String(qs.service_6 || "").trim(),
    ].filter(Boolean);
  }
  const merged = provided.length ? provided : fallback;
  return merged.slice(0, 6);
}

function sectionByType<T extends DraftSection["type"]>(
  draft: ClientSiteDraft,
  type: T
): Extract<DraftSection, { type: T }> {
  const section = draft.sections.find((item) => item.type === type);
  return section as Extract<DraftSection, { type: T }>;
}

function buildClientSiteDraft(input: {
  businessName: string;
  category: string;
  city: string;
  contactPhone: string;
  contactAddress: string;
  copy: PreviewCopy;
  stylePreset: StylePreset;
  colorPreset: ColorPreset;
  palette: PreviewCopy["palette"];
  styleTokens: ReturnType<typeof styleTokensForPreset>;
  services: string[];
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  rating: number | null;
}): ClientSiteDraft {
  const localTrustLine = input.rating
    ? `${input.rating.toFixed(1)}-star rated by local customers`
    : `Trusted local team serving ${input.city}`;
  return {
    business_name: input.businessName,
    category: input.category,
    city: input.city,
    sections: [
      {
        type: "hero",
        headline: input.headline,
        subheadline: input.subheadline,
        cta_primary: input.primaryCta,
        cta_secondary: input.secondaryCta,
      },
      {
        type: "trust",
        bullets: [`Serving ${input.city}`, `Call today: ${input.contactPhone}`, localTrustLine],
      },
      {
        type: "services",
        items: input.services,
      },
      {
        type: "about",
        title: `Why ${input.businessName}`,
        body: input.copy.trust_statement,
        bullets: input.copy.value_props.map((prop) => `${prop.title} - ${prop.description}`),
      },
      {
        type: "testimonial",
        items: input.copy.testimonials,
      },
      {
        type: "contact",
        phone: input.contactPhone,
        address: input.contactAddress,
        cta: input.primaryCta,
      },
    ],
    style: {
      theme: input.copy.hero_layout,
      style_preset: input.stylePreset,
      color_preset: input.colorPreset,
      colors: input.palette,
      spacing: input.styleTokens.spacing,
      font_scale: input.styleTokens.font_scale,
      button_style: input.styleTokens.button_style,
      border_radius: input.styleTokens.border_radius,
      shadows: input.styleTokens.shadows,
      section_contrast: input.styleTokens.section_contrast,
      card_style: input.styleTokens.card_style,
      visual_mood: input.styleTokens.visual_mood,
    },
  };
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<PreviewParams>;
}) {
  const { id } = await params;
  const qs = await searchParams;
  const supabase = await createClient();

  let lead: LeadPreviewRow | null = null;
  let leadLoadError: string | null = null;
  let previewWarning: string | null = null;
  try {
    console.info("[Client Site Draft] preview request received", { lead_id: id, query_keys: Object.keys(qs || {}) });
    const isMissingColumnError = (message: string): boolean => {
      const text = String(message || "").toLowerCase();
      return text.includes("column ") && text.includes(" does not exist");
    };
    const selectVariants = [
      "id,business_name,category,city,phone,address",
      "id,business_name,category,phone,address",
      "id,business_name,category,phone",
      "id,business_name,category",
      "id,business_name",
      "id",
    ];
    for (const selectClause of selectVariants) {
      const { data, error } = await supabase
        .from("leads")
        .select(selectClause)
        .eq("id", id)
        .maybeSingle<LeadPreviewRow>();
      if (error) {
        leadLoadError = error.message;
        if (!isMissingColumnError(error.message)) {
          console.warn("[Client Site Draft] lead lookup select variant failed", {
            lead_id: id,
            select_clause: selectClause,
            error: error.message,
          });
        }
        continue;
      }
      lead = (data || null) as LeadPreviewRow | null;
      if (lead) leadLoadError = null;
      break;
    }
    if (leadLoadError && !lead) {
      console.error("[Client Site Draft] lead lookup failed", {
        lead_id: id,
        error: leadLoadError,
      });
    }
    if (!lead) {
      previewWarning = "No data returned";
      console.warn("[Client Site Draft] no lead row returned for preview", { lead_id: id });
    } else {
      console.info("[Client Site Draft] lead row loaded for preview", {
        lead_id: id,
        has_business_name: Boolean(String(lead.business_name || "").trim()),
        has_category: Boolean(String(lead.category || "").trim()),
        has_city: Boolean(String(lead.city || "").trim()),
        has_phone: Boolean(String(lead.phone || "").trim()),
      });
    }
  } catch {
    lead = null;
    leadLoadError = "Preview failed to load";
    previewWarning = "API error";
    console.error("[Client Site Draft] lead lookup threw", { lead_id: id });
  }

  const businessName = String(lead?.business_name || qs.business || "Business Name").trim() || "Business Name";
  const category = String(lead?.category || qs.category || "professional service").trim() || "professional service";
  const city = safeCity(String(lead?.city || qs.city || ""));
  const phone = String(lead?.phone || qs.phone || "(555) 555-5555").trim() || "(555) 555-5555";
  const address = String(lead?.address || qs.address || "").trim();
  const generationStartedAt = Date.now();
  const copy = categoryPreviewCopy(category, city, businessName);
  const stylePreset = parseStylePreset(qs.style_preset);
  const colorPreset = qs.color_preset
    ? parseColorPreset(qs.color_preset)
    : defaultColorForStyle(stylePreset);
  const palette = paletteForColorPreset(colorPreset);
  const styleTokens = styleTokensForPreset(stylePreset);
  const rating = parseNumber(qs.rating);
  const headline = String(qs.headline || copy.headline).trim() || copy.headline;
  const subheadline = String(qs.subheadline || copy.subheadline).trim() || copy.subheadline;
  const ctaLabel = String(qs.cta || copy.primary_cta).trim() || copy.primary_cta;
  const secondaryCta = String(qs.secondary_cta || copy.secondary_cta).trim() || copy.secondary_cta;
  const services = parseServicesFromQuery(qs, copy.services);
  const hasRealPhone = Boolean(String(lead?.phone || qs.phone || "").trim());
  const ctaHref = hasRealPhone ? `tel:${normalizePhone(phone)}` : "#contact";
  const presentationMode = String(qs.presentation || "").trim() === "1";
  const showEditBar = !presentationMode;
  const showExport = !presentationMode && String(qs.export || "").trim() === "1";
  const servicesInputValue = services.join("\n");

  const contactPhone = hasRealPhone ? phone : "Phone available on request";
  const contactAddress = address || `${city} and nearby neighborhoods`;
  const clientSiteDraft = buildClientSiteDraft({
    businessName: safeBusinessName(businessName),
    category,
    city,
    contactPhone,
    contactAddress,
    copy,
    stylePreset,
    colorPreset,
    palette,
    styleTokens,
    services,
    headline,
    subheadline,
    primaryCta: ctaLabel,
    secondaryCta: secondaryCta,
    rating,
  });
  const hero = sectionByType(clientSiteDraft, "hero");
  const trust = sectionByType(clientSiteDraft, "trust");
  const servicesSection = sectionByType(clientSiteDraft, "services");
  const about = sectionByType(clientSiteDraft, "about");
  const testimonial = sectionByType(clientSiteDraft, "testimonial");
  const contact = sectionByType(clientSiteDraft, "contact");
  const exportPrompt = [
    "Build a responsive website using this structure:",
    JSON.stringify(clientSiteDraft, null, 2),
    "Use modern React + Tailwind.",
    "Componentize each section.",
  ].join("\n\n");
  const generationMs = Date.now() - generationStartedAt;
  const cssVars = {
    "--bg": palette.background,
    "--surface": palette.surface,
    "--surface-soft": palette.surface_soft,
    "--text": palette.text,
    "--muted": palette.muted,
    "--primary": palette.primary,
    "--primary-text": palette.primary_text,
    "--accent": palette.accent,
    "--border": palette.border,
    "--shadow": palette.shadow,
    "--hero-title-size": styleTokens.hero_title_size,
    "--hero-subtitle-size": styleTokens.hero_subtitle_size,
    "--body-size": styleTokens.body_size,
    "--section-gap": styleTokens.section_gap,
    "--card-padding": styleTokens.card_padding,
    "--card-radius": styleTokens.card_radius_px,
    "--soft-radius": styleTokens.soft_radius_px,
    "--button-radius": styleTokens.button_radius_px,
    "--button-padding": styleTokens.button_padding,
    "--border-weight": styleTokens.border_weight,
    "--card-shadow": styleTokens.card_shadow,
    "--soft-shadow": styleTokens.soft_shadow,
    "--section-tint": styleTokens.section_tint,
    "--heading-weight": styleTokens.heading_weight,
    "--font-family": styleTokens.font_family,
  } as CSSProperties;

  return (
    <main className="preview-shell" data-style-preset={stylePreset} data-color-preset={colorPreset} style={cssVars}>
      <style>{`
        .preview-shell {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-family);
          font-size: var(--body-size);
        }
        .preview-wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: ${presentationMode ? "24px 20px 64px" : "26px 20px 68px"};
        }
        .preview-card {
          background: var(--surface);
          border: var(--border-weight) solid var(--border);
          border-radius: var(--card-radius);
          box-shadow: var(--card-shadow);
        }
        .preview-soft {
          background: var(--surface-soft);
          border: var(--border-weight) solid var(--border);
          border-radius: var(--soft-radius);
          box-shadow: var(--soft-shadow);
        }
        .preview-btn-primary, .preview-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 700;
          border-radius: var(--button-radius);
          padding: var(--button-padding);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .preview-btn-primary {
          background: var(--primary);
          color: var(--primary-text);
          box-shadow: 0 12px 24px color-mix(in srgb, var(--primary) 28%, transparent);
        }
        .preview-btn-secondary {
          background: color-mix(in srgb, var(--surface) 88%, white);
          color: var(--text);
          border: var(--border-weight) solid var(--border);
        }
        .preview-btn-primary:hover, .preview-btn-secondary:hover { transform: translateY(-1px); }
        .hero-grid { display: grid; gap: 18px; align-items: start; }
        .hero-copy h1 {
          letter-spacing: -0.03em;
          font-size: var(--hero-title-size);
          font-weight: var(--heading-weight);
        }
        .hero-copy h2 {
          letter-spacing: -0.02em;
          font-size: var(--hero-subtitle-size);
          font-weight: var(--heading-weight);
        }
        .section-title {
          font-size: clamp(28px, 4vw, 36px);
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 14px;
          font-weight: var(--heading-weight);
        }
        .section-block {
          margin-bottom: var(--section-gap);
        }
        .hero-visual {
          min-height: 236px;
          border-radius: var(--card-radius);
          border: var(--border-weight) solid var(--border);
          background:
            linear-gradient(130deg, color-mix(in srgb, var(--primary) 16%, transparent), transparent 52%),
            linear-gradient(25deg, color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%),
            var(--surface-soft);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), var(--soft-shadow);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          padding: 16px;
        }
        .service-grid, .value-grid, .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .service-item, .value-item, .testimonial-item, .trust-chip {
          background: var(--surface);
          border: var(--border-weight) solid color-mix(in srgb, var(--border) 78%, transparent);
          border-radius: calc(var(--soft-radius) - 2px);
          box-shadow: var(--soft-shadow);
        }
        .trust-band {
          background: var(--section-tint);
          border: var(--border-weight) solid color-mix(in srgb, var(--border) 82%, transparent);
        }
        .preview-shell[data-style-preset="minimal_elegant"] .preview-btn-primary {
          box-shadow: none;
          border: 1px solid var(--primary);
        }
        .preview-shell[data-style-preset="minimal_elegant"] .preview-btn-secondary {
          background: transparent;
        }
        .preview-shell[data-style-preset="bold_premium"] .preview-btn-primary {
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .preview-shell[data-style-preset="friendly_local"] .preview-btn-primary,
        .preview-shell[data-style-preset="friendly_local"] .preview-btn-secondary {
          font-weight: 700;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 20px;
          align-items: center;
        }
        @media (max-width: 1180px) {
          .preview-wrap { max-width: 100%; padding: ${presentationMode ? "20px 16px 60px" : "22px 16px 62px"}; }
          .hero-visual { min-height: 220px; }
        }
        @media (max-width: 980px) {
          .service-grid, .value-grid, .testimonial-grid { grid-template-columns: 1fr 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
          .hero-visual { grid-template-columns: 1fr; min-height: auto; }
        }
        @media (max-width: 640px) {
          .service-grid, .value-grid, .testimonial-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="preview-wrap">
        {showEditBar ? (
          <section className="preview-card" style={{ marginBottom: 14, padding: 14 }}>
            <form method="get" style={{ display: "grid", gap: 8 }}>
              <div className="grid gap-2 md:grid-cols-2">
                <input name="headline" defaultValue={headline} placeholder="Headline" className="admin-input h-9" />
                <input name="subheadline" defaultValue={subheadline} placeholder="Subheadline" className="admin-input h-9" />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input name="cta" defaultValue={ctaLabel} placeholder="CTA text" className="admin-input h-9" />
                <input name="secondary_cta" defaultValue={secondaryCta} placeholder="Secondary CTA text" className="admin-input h-9" />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <select name="style_preset" defaultValue={stylePreset} className="admin-input h-9">
                  <option value="clean_modern">Clean / Modern</option>
                  <option value="bold_premium">Bold / Premium</option>
                  <option value="friendly_local">Friendly / Local</option>
                  <option value="minimal_elegant">Minimal / Elegant</option>
                </select>
                <select name="color_preset" defaultValue={colorPreset} className="admin-input h-9">
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="dark">Dark</option>
                  <option value="warm_neutral">Warm Neutral</option>
                  <option value="bold_accent">Bold Accent</option>
                </select>
              </div>
              <textarea
                name="services"
                defaultValue={servicesInputValue}
                placeholder="Service labels, one per line"
                className="admin-input min-h-[120px]"
              />
              <input type="hidden" name="presentation" value="0" />
              <input type="hidden" name="export" value={showExport ? "1" : "0"} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="submit" className="admin-btn-primary text-xs">Update Preview Copy</button>
                <a href="?presentation=1" className="admin-btn-ghost text-xs">Presentation Mode</a>
                <button type="submit" name="export" value="1" className="admin-btn-ghost text-xs">
                  Export to Build
                </button>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)", margin: 0 }}>
                Generate Client Site Draft ({generationMs}ms)
              </p>
            </form>
          </section>
        ) : null}
        {showEditBar && (leadLoadError || previewWarning) ? (
          <section className="preview-card" style={{ marginBottom: 14, padding: 12, borderColor: "rgba(252, 165, 165, 0.45)" }}>
            <p className="text-xs" style={{ color: "#fca5a5", margin: 0 }}>
              {leadLoadError ? `Preview failed to load: ${leadLoadError}` : "No data returned"}
            </p>
            {!lead ? (
              <p className="text-xs" style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                Rendering from URL fallback values only.
              </p>
            ) : null}
          </section>
        ) : null}

        {showExport ? <ExportBuildBox prompt={exportPrompt} /> : null}

        <section className="preview-card section-block" style={{ padding: "var(--card-padding)" }}>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 style={{ margin: "8px 0 10px", lineHeight: 1.02 }}>{clientSiteDraft.business_name}</h1>
              <h2 style={{ margin: "0 0 10px", color: "var(--text)", lineHeight: 1.12 }}>{hero.headline}</h2>
              <p style={{ margin: 0, color: "var(--muted)", maxWidth: 780, lineHeight: 1.52 }}>{hero.subheadline}</p>
              <p style={{ margin: "12px 0 0", color: "var(--text)", fontWeight: 600 }}>
                Trusted in {city} for responsive service and clear communication.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                <a href={ctaHref} className="preview-btn-primary">
                  {hero.cta_primary}
                </a>
                <a href="#contact" className="preview-btn-secondary">
                  {hero.cta_secondary}
                </a>
              </div>
            </div>
            <div className="hero-visual">
              {trust.bullets.slice(0, 3).map((point) => (
                <div key={point} className="trust-chip" style={{ padding: 12, background: "color-mix(in srgb, var(--surface) 90%, white)" }}>
                  <strong style={{ display: "block", marginBottom: 4 }}>{point}</strong>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>
                    {safeBusinessName(businessName)} serves {city}.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="preview-soft trust-band section-block" style={{ padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
            <p style={{ margin: 0, color: "var(--text)", fontWeight: 600 }}>{trust.bullets[0] || `Serving ${city}`}</p>
            <p style={{ margin: 0, color: "var(--muted)", textAlign: "center" }}>{trust.bullets[1] || `Call today: ${contactPhone}`}</p>
            <p style={{ margin: 0, color: "var(--muted)", textAlign: "right" }}>
              {trust.bullets[2] || "Fast response"}
            </p>
          </div>
        </section>

        <section className="section-block">
          <h2 className="section-title">Services</h2>
          <div className="service-grid">
            {servicesSection.items.map((service) => (
              <article key={service} className="service-item" style={{ padding: 18 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{service}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  Professional {service.toLowerCase()} from {safeBusinessName(businessName)} in {city}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="preview-card section-block" style={{ padding: "var(--card-padding)" }}>
          <h2 className="section-title">{about.title}</h2>
          <p style={{ margin: "0 0 12px", color: "var(--muted)" }}>
            {about.body}
          </p>
          <div className="value-grid">
            {about.bullets.map((bullet) => (
              <article key={bullet} className="value-item" style={{ padding: 14 }}>
                <p style={{ margin: 0, color: "var(--muted)" }}>{bullet}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <h2 className="section-title">Client Feedback</h2>
          <div className="testimonial-grid">
            {testimonial.items.map((item) => (
              <article key={item.quote} className="testimonial-item" style={{ padding: 18 }}>
                <p style={{ margin: 0, color: "var(--text)", lineHeight: 1.6 }}>&quot;{item.quote}&quot;</p>
                <p style={{ margin: "10px 0 0", color: "var(--muted)", fontWeight: 600 }}>{item.name}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="preview-card section-block" style={{ padding: "var(--card-padding)" }}>
          <h2 className="section-title">Contact</h2>
          <p style={{ margin: "0 0 6px", color: "var(--text)" }}><strong>Phone:</strong> {contact.phone}</p>
          <p style={{ margin: "0 0 6px", color: "var(--text)" }}><strong>Address:</strong> {contact.address}</p>
          <p style={{ margin: "0 0 14px", color: "var(--text)" }}><strong>City:</strong> {city}</p>
          <a href={`tel:${normalizePhone(phone)}`} className="preview-btn-primary">
            {contact.cta}
          </a>
        </section>

        <footer className="preview-soft" style={{ padding: 18 }}>
          <div className="footer-grid">
            <div>
              <strong>{safeBusinessName(businessName)}</strong>
              <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{copy.footer_note}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <a href={ctaHref} className="preview-btn-primary">
                {ctaLabel}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

