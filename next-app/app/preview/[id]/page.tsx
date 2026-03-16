type PreviewParams = {
  business?: string;
  category?: string;
  email?: string;
  phone?: string;
  website?: string;
};

type Template = {
  heroTitle: string;
  heroSubtitle: string;
  cta: string;
  services: string[];
  testimonials: string[];
};

function categoryTemplate(category: string): Template {
  const c = String(category || "").toLowerCase();
  if (c.includes("restaurant") || c.includes("cafe")) {
    return {
      heroTitle: "Fresh flavors, simple online ordering.",
      heroSubtitle: "A faster path from hungry visitor to paying customer.",
      cta: "View Menu & Order",
      services: ["Featured Menu Sections", "Online Ordering", "Hours & Location", "Private Events"],
      testimonials: ["Best local food, easy to order online.", "Loved the new menu layout and booking flow."],
    };
  }
  if (c.includes("gym")) {
    return {
      heroTitle: "Build strength with a better member experience.",
      heroSubtitle: "Turn website visitors into trial signups and monthly memberships.",
      cta: "Book a Free Trial",
      services: ["Class Schedule", "Trainer Profiles", "Membership Plans", "Transformation Stories"],
      testimonials: ["Signed up in two minutes.", "The new site made joining easy."],
    };
  }
  if (c.includes("dentist")) {
    return {
      heroTitle: "Comfort-first dental care for your whole family.",
      heroSubtitle: "A trust-building homepage designed to convert new patients.",
      cta: "Book Appointment",
      services: ["Preventive Care", "Cosmetic Dentistry", "Emergency Visits", "Insurance Support"],
      testimonials: ["Great experience from first click to first visit.", "Scheduling was quick and clear."],
    };
  }
  if (c.includes("plumber") || c.includes("contractor")) {
    return {
      heroTitle: "Fast, reliable service when it matters most.",
      heroSubtitle: "A lead-focused website for calls, quotes, and booked jobs.",
      cta: "Request Service",
      services: ["Emergency Repairs", "Installations", "Maintenance Plans", "Upfront Pricing"],
      testimonials: ["Same-day service and clear communication.", "Quote form was easy and fast."],
    };
  }
  if (c.includes("hvac") || c.includes("heating") || c.includes("cooling")) {
    return {
      heroTitle: "Comfort starts with one quick call.",
      heroSubtitle: "A conversion-focused HVAC homepage built for service calls and quote requests.",
      cta: "Call Now / Get Quote",
      services: ["Emergency HVAC Repair", "Seasonal Tune-Ups", "System Installation", "Indoor Air Quality"],
      testimonials: ["Fast response and clear communication.", "Easy to request service online."],
    };
  }
  if (c.includes("roof")) {
    return {
      heroTitle: "Protect your home with trusted roofing service.",
      heroSubtitle: "A lead-ready website concept designed for inspections, quotes, and booked jobs.",
      cta: "Request Roof Inspection",
      services: ["Roof Repair", "Roof Replacement", "Storm Damage", "Insurance Support"],
      testimonials: ["They made the estimate process simple.", "Easy scheduling and fast follow-up."],
    };
  }
  if (c.includes("church")) {
    return {
      heroTitle: "Welcome home.",
      heroSubtitle: "A clear church homepage to help visitors find service times, location, and next steps.",
      cta: "Plan Your Visit",
      services: ["Service Times", "Ministries", "Events Calendar", "Prayer Request"],
      testimonials: ["Easy to find where and when to attend.", "The new site feels warm and welcoming."],
    };
  }
  if (c.includes("auto")) {
    return {
      heroTitle: "Reliable auto care, easy to schedule.",
      heroSubtitle: "A practical auto repair homepage focused on calls, trust, and booked appointments.",
      cta: "Schedule Service",
      services: ["Diagnostics", "Brakes & Suspension", "Oil & Maintenance", "Engine Repair"],
      testimonials: ["Quick estimate and easy booking.", "Trusted local shop with a great new site."],
    };
  }
  if (c.includes("landscap")) {
    return {
      heroTitle: "Outdoor spaces that stand out.",
      heroSubtitle: "A lead-focused landscaping site concept for quote requests and seasonal service plans.",
      cta: "Get Landscaping Quote",
      services: ["Lawn Maintenance", "Landscape Design", "Hardscape Projects", "Seasonal Cleanup"],
      testimonials: ["Quote request took less than a minute.", "Beautiful work and great communication."],
    };
  }
  if (c.includes("salon")) {
    return {
      heroTitle: "Look great. Book instantly.",
      heroSubtitle: "A visual-first salon homepage built for appointments and repeat clients.",
      cta: "Book Your Appointment",
      services: ["Hair Services", "Color & Style", "Special Occasion", "Product Recommendations"],
      testimonials: ["Loved how easy online booking is now.", "Beautiful site and smooth checkout."],
    };
  }
  return {
    heroTitle: "A modern website concept built to convert.",
    heroSubtitle: "Clear messaging, stronger trust, and more customer actions.",
    cta: "Get Started",
    services: ["Primary Services", "Why Choose Us", "Recent Work", "Contact & Booking"],
    testimonials: ["Easy to use and professional.", "The redesign feels modern and trustworthy."],
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
  const business = String(qs.business || "Business Name");
  const category = String(qs.category || "service");
  const email = String(qs.email || "hello@example.com");
  const phone = String(qs.phone || "(555) 555-5555");
  const website = String(qs.website || "");
  const tpl = categoryTemplate(category);

  return (
    <main style={{ background: "#0b1114", color: "#f5f7f9", minHeight: "100vh" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px 24px" }}>
        <p style={{ color: "#9cb0bd", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
          Redesign Concept · Preview {id}
        </p>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: "12px 0 10px" }}>{business}</h1>
        <p style={{ color: "#9cb0bd", maxWidth: 680 }}>{tpl.heroTitle}</p>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 20px 36px",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 20,
        }}
      >
        <div style={{ background: "#132026", border: "1px solid #22363f", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 28, marginBottom: 10 }}>{tpl.heroSubtitle}</h2>
          <p style={{ color: "#9cb0bd", marginBottom: 18 }}>
            Built for {category} teams that need more leads, bookings, and trust from first-time visitors.
          </p>
          <button
            style={{
              background: "#f0a51a",
              color: "#161a1d",
              border: "none",
              borderRadius: 999,
              padding: "10px 18px",
              fontWeight: 700,
            }}
          >
            {tpl.cta}
          </button>
        </div>
        <div style={{ background: "#132026", border: "1px solid #22363f", borderRadius: 16, padding: 24 }}>
          <h3 style={{ marginBottom: 10 }}>Contact</h3>
          <p style={{ margin: "6px 0", color: "#c9d5dc" }}>{phone}</p>
          <p style={{ margin: "6px 0", color: "#c9d5dc" }}>{email}</p>
          <p style={{ margin: "6px 0", color: "#9cb0bd" }}>{website || "Website coming soon"}</p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 36px" }}>
        <h3 style={{ marginBottom: 12 }}>Services</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
          {tpl.services.map((service) => (
            <article key={service} style={{ background: "#132026", border: "1px solid #22363f", borderRadius: 14, padding: 16 }}>
              <strong>{service}</strong>
              <p style={{ marginTop: 6, color: "#9cb0bd", fontSize: 14 }}>
                Conversion-focused section block with clear CTA and trust indicators.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 36px" }}>
        <h3 style={{ marginBottom: 12 }}>Testimonials</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {tpl.testimonials.map((quote) => (
            <blockquote key={quote} style={{ background: "#132026", border: "1px solid #22363f", borderRadius: 14, padding: 16 }}>
              "{quote}"
            </blockquote>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" }}>
        <div style={{ background: "#132026", border: "1px solid #22363f", borderRadius: 16, padding: 24 }}>
          <h3>Call To Action</h3>
          <p style={{ color: "#9cb0bd", marginBottom: 12 }}>
            Ready to turn visitors into customers? This concept focuses on faster loading, clearer offer framing, and easier contact.
          </p>
          <button
            style={{
              background: "#f0a51a",
              color: "#161a1d",
              border: "none",
              borderRadius: 999,
              padding: "10px 18px",
              fontWeight: 700,
            }}
          >
            {tpl.cta}
          </button>
        </div>
      </section>
    </main>
  );
}

