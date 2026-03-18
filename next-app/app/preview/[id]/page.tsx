import { createClient } from "@/lib/supabase/server";

type PreviewParams = {
  business?: string;
  category?: string;
  city?: string;
  phone?: string;
  address?: string;
  hide_banner?: string;
  presentation?: string;
  headline?: string;
  subheadline?: string;
  cta?: string;
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
  headline: string;
  subheadline: string;
  cta: string;
  services: string[];
};

function isInCategory(category: string, keywords: string[]): boolean {
  const c = String(category || "").toLowerCase();
  return keywords.some((k) => c.includes(k));
}

function categoryPreviewCopy(category: string, city: string): PreviewCopy {
  const local = city || "your area";
  if (isInCategory(category, ["tire", "auto", "mechanic", "repair shop"])) {
    return {
      headline: `Fast, Reliable Tire Service in ${local}`,
      subheadline:
        `Built to earn trust in ${local}, make contact simple, and help mobile visitors call or request service in seconds.`,
      cta: "Call Now / Get a Quote",
      services: ["Tire Repair", "Brake Service", "Oil Change"],
    };
  }
  if (isInCategory(category, ["plumber", "plumbing"])) {
    return {
      headline: `Trusted Local Plumbing in ${local}`,
      subheadline:
        `A mobile-friendly site that builds local trust, makes it easy to reach you, and helps customers take action quickly.`,
      cta: "Call Now / Get a Quote",
      services: ["Leak Repair", "Drain Cleaning", "Emergency Service"],
    };
  }
  if (isInCategory(category, ["contractor", "roofer", "roofing", "hvac", "electrician", "landscap"])) {
    return {
      headline: `Dependable Service You Can Count On in ${local}`,
      subheadline:
        `Designed for local trust, easy contact, and clear mobile calls-to-action that convert visitors into customers.`,
      cta: "Call Now / Get a Quote",
      services: ["Free Estimates", "Repair & Install", "Emergency Visits"],
    };
  }
  if (isInCategory(category, ["church", "ministry"])) {
    return {
      headline: "A Simple Way to Find Service Times and Get Connected",
      subheadline:
        `A clear, welcoming, mobile-first experience that helps people in ${local} trust your church and take the next step.`,
      cta: "Plan a Visit",
      services: ["Service Times", "Ministries", "Get Connected"],
    };
  }
  if (isInCategory(category, ["restaurant", "cafe", "coffee", "food"])) {
    return {
      headline: `Great Food, Easy Ordering in ${local}`,
      subheadline:
        `A local-trust focused website that helps people find your menu, contact your team, and order quickly on mobile.`,
      cta: "View Menu / Order Now",
      services: ["Menu", "Catering", "Order Pickup"],
    };
  }
  return {
    headline: `Trusted Local Service in ${local}`,
    subheadline:
      `A clean, mobile-friendly website that builds local trust, improves contact clarity, and helps customers take action fast.`,
    cta: "Contact Us",
    services: ["Primary Service", "Friendly Support", "Easy Booking"],
  };
}

function normalizePhone(phone: string): string {
  const cleaned = String(phone || "").replace(/[^\d+]/g, "");
  return cleaned || "15555555555";
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

  const businessName = String(lead?.business_name || qs.business || "Local Business").trim() || "Local Business";
  const category = String(lead?.category || qs.category || "service business").trim() || "service business";
  const city = String(lead?.city || qs.city || "your area").trim() || "your area";
  const phone = String(lead?.phone || qs.phone || "(555) 555-5555").trim() || "(555) 555-5555";
  const address = String(lead?.address || qs.address || "").trim();
  const copy = categoryPreviewCopy(category, city);
  const headline = String(qs.headline || copy.headline).trim() || copy.headline;
  const subheadline = String(qs.subheadline || copy.subheadline).trim() || copy.subheadline;
  const ctaLabel = String(qs.cta || copy.cta).trim() || copy.cta;
  const services = copy.services;
  const hasRealPhone = Boolean(String(lead?.phone || qs.phone || "").trim());
  const ctaHref = hasRealPhone ? `tel:${normalizePhone(phone)}` : "#contact";
  const presentationMode = String(qs.presentation || "").trim() === "1";
  const showBanner = !presentationMode && String(qs.hide_banner || "").trim() !== "1";
  const showEditBar = !presentationMode;

  const shell = {
    background: "#f3f6fb",
    color: "#0f172a",
    minHeight: "100vh",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  };
  const container = {
    maxWidth: 1020,
    margin: "0 auto",
    padding: presentationMode ? "18px 14px 54px" : "20px 16px 56px",
  };
  const card = { background: "#ffffff", border: "1px solid #dbe3ee", borderRadius: 20, padding: 22 };
  const primaryBtn = {
    display: "inline-block",
    background: "#0b1324",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
    padding: "12px 20px",
    borderRadius: 999,
    boxShadow: "0 10px 18px rgba(11, 19, 36, 0.22)",
  };
  const ghostBtn = {
    display: "inline-block",
    background: "#ffffff",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 700,
    padding: "12px 18px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
  };

  const contactPhone = hasRealPhone ? phone : "Phone available on request";
  const contactAddress = address || "Address available on request";

  return (
    <main style={shell}>
      <div style={container}>
        {showEditBar ? (
          <section style={{ ...card, marginBottom: 14, padding: 14 }}>
            <form method="get" style={{ display: "grid", gap: 8 }}>
              <div className="grid gap-2 md:grid-cols-3">
                <input name="headline" defaultValue={headline} placeholder="Headline" className="admin-input h-9" />
                <input name="subheadline" defaultValue={subheadline} placeholder="Subheadline" className="admin-input h-9" />
                <input name="cta" defaultValue={ctaLabel} placeholder="CTA text" className="admin-input h-9" />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="submit" className="admin-btn-primary text-xs">Update Copy</button>
                <a href="?presentation=1" className="admin-btn-ghost text-xs">Presentation Mode</a>
              </div>
            </form>
          </section>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <a href="?" style={{ color: "#334155", fontSize: 13 }}>
              Exit Presentation Mode
            </a>
          </div>
        )}

        {showBanner ? (
          <div style={{ ...card, background: "#e0f2fe", borderColor: "#7dd3fc", marginBottom: 14, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>This is a quick preview of your potential website</strong>
              <a href="?hide_banner=1" style={{ color: "#0c4a6e", fontSize: 13 }}>
                Hide banner for presentation
              </a>
            </div>
          </div>
        ) : !presentationMode ? (
          <div style={{ textAlign: "right", marginBottom: 10 }}>
            <a href="?" style={{ color: "#334155", fontSize: 13 }}>
              Show preview banner
            </a>
          </div>
        ) : null}

        <section style={{ ...card, marginBottom: 14 }}>
          {!presentationMode ? (
            <p style={{ margin: 0, color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Website Preview - {city}
            </p>
          ) : null}
          <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(36px, 9vw, 62px)", lineHeight: 1.02 }}>{businessName}</h1>
          <h2 style={{ margin: "0 0 10px", color: "#0f172a", fontSize: "clamp(22px, 4vw, 34px)", lineHeight: 1.15 }}>{headline}</h2>
          <p style={{ margin: 0, color: "#334155", fontSize: 19, maxWidth: 780, lineHeight: 1.5 }}>{subheadline}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <a href={ctaHref} style={primaryBtn}>
              {ctaLabel}
            </a>
            <a href="#contact" style={ghostBtn}>
              Get a Quote
            </a>
          </div>
        </section>

        <section style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>Services</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
            {services.map((service) => (
              <article key={service} style={card}>
                <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{service}</h3>
                <p style={{ margin: 0, color: "#64748b" }}>
                  Clear service section designed to help visitors understand your offer and take action quickly.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ ...card, marginBottom: 14 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>Why People Choose {businessName}</h2>
          <p style={{ margin: "0 0 10px", color: "#64748b" }}>
            Local customers in {city} choose businesses that are responsive, easy to reach, and dependable.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
            <div><strong>Local & Trusted</strong><p style={{ margin: "6px 0 0", color: "#64748b" }}>Built for your local market and customer expectations.</p></div>
            <div><strong>Fast Response</strong><p style={{ margin: "6px 0 0", color: "#64748b" }}>Simple contact paths so customers can reach you quickly.</p></div>
            <div><strong>Friendly Service</strong><p style={{ margin: "6px 0 0", color: "#64748b" }}>Clear messaging that makes your team feel approachable and reliable.</p></div>
          </div>
        </section>

        <section id="contact" style={card}>
          <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>Contact</h2>
          <p style={{ margin: "0 0 6px", color: "#0f172a" }}><strong>Phone:</strong> {contactPhone}</p>
          <p style={{ margin: "0 0 6px", color: "#0f172a" }}><strong>Address:</strong> {contactAddress}</p>
          <p style={{ margin: "0 0 14px", color: "#0f172a" }}><strong>City:</strong> {city || "Serving local area"}</p>
          <a href={`tel:${normalizePhone(phone)}`} style={primaryBtn}>
            Call Now
          </a>
        </section>
      </div>
    </main>
  );
}

