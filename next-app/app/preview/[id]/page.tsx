import { createClient } from "@/lib/supabase/server";
import type { CSSProperties } from "react";

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
  try {
    const { data } = await supabase
      .from("leads")
      .select("id,business_name,category,city,phone,address")
      .eq("id", id)
      .maybeSingle<LeadPreviewRow>();
    lead = data || null;
  } catch {
    lead = null;
  }

  const businessName = String(lead?.business_name || qs.business || "Business Name").trim() || "Business Name";
  const category = String(lead?.category || qs.category || "professional service").trim() || "professional service";
  const city = safeCity(String(lead?.city || qs.city || ""));
  const phone = String(lead?.phone || qs.phone || "(555) 555-5555").trim() || "(555) 555-5555";
  const address = String(lead?.address || qs.address || "").trim();
  const copy = categoryPreviewCopy(category, city, businessName);
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
  const servicesInputValue = services.join("\n");

  const contactPhone = hasRealPhone ? phone : "Phone available on request";
  const contactAddress = address || `${city} and nearby neighborhoods`;
  const cssVars = {
    "--bg": copy.palette.background,
    "--surface": copy.palette.surface,
    "--surface-soft": copy.palette.surface_soft,
    "--text": copy.palette.text,
    "--muted": copy.palette.muted,
    "--primary": copy.palette.primary,
    "--primary-text": copy.palette.primary_text,
    "--accent": copy.palette.accent,
    "--border": copy.palette.border,
    "--shadow": copy.palette.shadow,
  } as CSSProperties;

  return (
    <main className="preview-shell" style={cssVars}>
      <style>{`
        .preview-shell {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: "Inter", ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        }
        .preview-wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: ${presentationMode ? "24px 20px 64px" : "26px 20px 68px"};
        }
        .preview-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: var(--shadow);
        }
        .preview-soft {
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 20px;
        }
        .preview-btn-primary, .preview-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 700;
          border-radius: 999px;
          padding: 12px 20px;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .preview-btn-primary {
          background: var(--primary);
          color: var(--primary-text);
          box-shadow: 0 12px 24px color-mix(in srgb, var(--primary) 28%, transparent);
        }
        .preview-btn-secondary {
          background: white;
          color: var(--text);
          border: 1px solid var(--border);
        }
        .preview-btn-primary:hover, .preview-btn-secondary:hover { transform: translateY(-1px); }
        .hero-grid { display: grid; gap: 18px; align-items: start; }
        .hero-copy h1 {
          letter-spacing: -0.03em;
        }
        .hero-copy h2 {
          letter-spacing: -0.02em;
        }
        .section-title {
          font-size: clamp(28px, 4vw, 36px);
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 14px;
        }
        .section-block {
          margin-bottom: 22px;
        }
        .hero-visual {
          min-height: 236px;
          border-radius: 24px;
          border: 1px solid var(--border);
          background:
            linear-gradient(130deg, color-mix(in srgb, var(--primary) 16%, transparent), transparent 52%),
            linear-gradient(25deg, color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%),
            var(--surface-soft);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
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
          border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
          border-radius: 16px;
          box-shadow: 0 10px 26px color-mix(in srgb, var(--primary) 8%, transparent);
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
              <textarea
                name="services"
                defaultValue={servicesInputValue}
                placeholder="Service labels, one per line"
                className="admin-input min-h-[120px]"
              />
              <input type="hidden" name="presentation" value="0" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="submit" className="admin-btn-primary text-xs">Update Preview Copy</button>
                <a href="?presentation=1" className="admin-btn-ghost text-xs">Presentation Mode</a>
              </div>
            </form>
          </section>
        ) : null}

        <section className="preview-card section-block" style={{ padding: 28 }}>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(34px, 8vw, 60px)", lineHeight: 1.02 }}>{safeBusinessName(businessName)}</h1>
              <h2 style={{ margin: "0 0 10px", color: "var(--text)", fontSize: "clamp(24px, 4vw, 40px)", lineHeight: 1.12 }}>{headline}</h2>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "clamp(16px, 2.3vw, 20px)", maxWidth: 780, lineHeight: 1.52 }}>{subheadline}</p>
              <p style={{ margin: "12px 0 0", color: "var(--text)", fontWeight: 600 }}>
                Trusted in {city} for responsive service and clear communication.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                <a href={ctaHref} className="preview-btn-primary">
                  {ctaLabel}
                </a>
                <a href="#contact" className="preview-btn-secondary">
                  {secondaryCta}
                </a>
              </div>
            </div>
            <div className="hero-visual">
              {copy.hero_points.slice(0, 3).map((point) => (
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

        <section className="preview-soft section-block" style={{ padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
            <p style={{ margin: 0, color: "var(--text)", fontWeight: 600 }}>Serving {city}</p>
            <p style={{ margin: 0, color: "var(--muted)", textAlign: "center" }}>Call today: {contactPhone}</p>
            <p style={{ margin: 0, color: "var(--muted)", textAlign: "right" }}>
              Fast response{rating ? ` • ${rating.toFixed(1)} stars` : ""}
            </p>
          </div>
        </section>

        <section className="section-block">
          <h2 className="section-title">Services</h2>
          <div className="service-grid">
            {services.map((service) => (
              <article key={service} className="service-item" style={{ padding: 18 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{service}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  Professional {service.toLowerCase()} from {safeBusinessName(businessName)} in {city}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="preview-card section-block" style={{ padding: 24 }}>
          <h2 className="section-title">About {safeBusinessName(businessName)}</h2>
          <p style={{ margin: "0 0 12px", color: "var(--muted)" }}>
            {copy.trust_statement}
          </p>
          <div className="value-grid">
            {copy.value_props.map((prop) => (
              <article key={prop.title} className="value-item" style={{ padding: 14 }}>
                <strong>{prop.title}</strong>
                <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{prop.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <h2 className="section-title">{copy.testimonial_title}</h2>
          <div className="testimonial-grid">
            {copy.testimonials.map((item) => (
              <article key={item.quote} className="testimonial-item" style={{ padding: 18 }}>
                <p style={{ margin: 0, color: "var(--text)", lineHeight: 1.6 }}>&quot;{item.quote}&quot;</p>
                <p style={{ margin: "10px 0 0", color: "var(--muted)", fontWeight: 600 }}>{item.name}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="preview-card section-block" style={{ padding: 24 }}>
          <h2 className="section-title">Contact</h2>
          <p style={{ margin: "0 0 6px", color: "var(--text)" }}><strong>Phone:</strong> {contactPhone}</p>
          <p style={{ margin: "0 0 6px", color: "var(--text)" }}><strong>Address:</strong> {contactAddress}</p>
          <p style={{ margin: "0 0 14px", color: "var(--text)" }}><strong>City:</strong> {city}</p>
          <a href={`tel:${normalizePhone(phone)}`} className="preview-btn-primary">
            {ctaLabel}
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

