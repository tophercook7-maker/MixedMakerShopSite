import Link from "next/link";
import { notFound } from "next/navigation";
import { getSampleBySlug } from "@/lib/website-samples";

type ShowcaseType = "coffee" | "restaurant" | "church" | "service";

function getShowcaseType(category: string): ShowcaseType {
  if (category === "coffee") return "coffee";
  if (category === "restaurant") return "restaurant";
  if (category === "church") return "church";
  return "service";
}

function getShowcaseCopy(type: ShowcaseType, businessName: string) {
  if (type === "coffee") {
    return {
      heroTitle: `A modern coffee shop website for ${businessName}`,
      heroSub:
        "Designed to turn first-time visitors into regulars with clear menu highlights, local vibe, and fast mobile browsing.",
      ctaPrimary: "Get My Free Website Draft",
      ctaSecondary: "View Website Samples",
      servicesTitle: "What This Site Highlights",
      services: [
        { name: "Signature Drinks Menu", text: "Showcase top drinks, seasonal specials, and best sellers in one clean flow." },
        { name: "Visit + Hours", text: "Make it effortless for customers to find your location and current opening hours." },
        { name: "Order / Pickup CTA", text: "Place clear order and pickup actions where mobile users can act fast." },
      ],
      trustTitle: "Why This Works for Coffee Shops",
      trustBullets: [
        "Warm visual style that reflects your in-store experience",
        "Mobile-first layout for busy on-the-go customers",
        "Clear calls to action for order, visit, and contact",
      ],
      testimonial:
        "“This layout finally feels like our brand. Customers can see our drinks, hours, and order options in seconds.”",
      testimonialBy: "Local Coffee Shop Owner",
      contactTitle: "Contact & Location",
      contactText: "Built to make directions, hours, and contact details obvious for local customers.",
    };
  }
  if (type === "restaurant") {
    return {
      heroTitle: `A conversion-focused restaurant homepage for ${businessName}`,
      heroSub:
        "Built to promote reservations, menu browsing, and in-person visits with a clean, premium first impression.",
      ctaPrimary: "Get My Free Website Draft",
      ctaSecondary: "View Website Samples",
      servicesTitle: "What This Site Highlights",
      services: [
        { name: "Menu-First Experience", text: "Guide visitors quickly from homepage to menu without friction." },
        { name: "Reservations + Call CTA", text: "Put booking and call actions where hungry visitors actually tap." },
        { name: "Hours + Location Clarity", text: "Reduce confusion with straightforward location and open-hours sections." },
      ],
      trustTitle: "Why This Works for Restaurants",
      trustBullets: [
        "Clear actions for reserve, order, and call now",
        "Strong food-forward visuals without clutter",
        "Fast mobile structure for local search traffic",
      ],
      testimonial:
        "“Customers now find our menu and booking button immediately. The website finally supports our business goals.”",
      testimonialBy: "Restaurant Owner",
      contactTitle: "Contact & Location",
      contactText: "Designed so new customers can find you, contact you, and book fast.",
    };
  }
  if (type === "church") {
    return {
      heroTitle: `A welcoming church website for ${businessName}`,
      heroSub:
        "Designed to help new visitors feel comfortable and informed with clear service times, ministries, and next steps.",
      ctaPrimary: "Get My Free Website Draft",
      ctaSecondary: "View Website Samples",
      servicesTitle: "What This Site Highlights",
      services: [
        { name: "Service Times + Location", text: "Help first-time guests immediately find where and when to attend." },
        { name: "Next Steps", text: "Promote ministries, events, and ways to get connected in a simple structure." },
        { name: "Giving + Contact", text: "Present giving and contact options clearly for members and visitors." },
      ],
      trustTitle: "Why This Works for Churches",
      trustBullets: [
        "Warm, welcoming language and layout",
        "Clear information for first-time visitors",
        "Straightforward paths for ministries and connection",
      ],
      testimonial:
        "“New families now tell us the website made visiting easy. Service times and next steps are finally clear.”",
      testimonialBy: "Church Leadership Team",
      contactTitle: "Contact & Location",
      contactText: "Built so visitors can quickly find service details, location, and church contact info.",
    };
  }
  return {
    heroTitle: `A practical service-business homepage for ${businessName}`,
    heroSub:
      "Structured to build trust fast and turn visitors into calls and quote requests with clear messaging.",
    ctaPrimary: "Get My Free Website Draft",
    ctaSecondary: "View Website Samples",
    servicesTitle: "What This Site Highlights",
    services: [
      { name: "Service Clarity", text: "Present your services in plain language customers understand right away." },
      { name: "Trust Signals", text: "Use reviews, credibility points, and clean visuals to increase confidence." },
      { name: "Lead Capture CTAs", text: "Guide users toward calls, forms, and quote requests at the right moments." },
    ],
    trustTitle: "Why This Works for Service Businesses",
    trustBullets: [
      "Messaging built around customer intent",
      "Credibility and trust sections above the fold",
      "Conversion-focused page flow from top to contact",
    ],
    testimonial:
      "“This design makes our services clear and professional. We started getting better inquiries almost immediately.”",
    testimonialBy: "Service Business Owner",
    contactTitle: "Contact & Location",
    contactText: "Made to help customers contact you quickly when they are ready to buy.",
  };
}

export default async function WebsiteSamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sample = getSampleBySlug(slug);
  if (!sample || sample.externalHref) notFound();
  const type = getShowcaseType(sample.category);
  const copy = getShowcaseCopy(type, sample.name);

  return (
    <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,.02), transparent)", paddingBottom: 24 }}>
      {/* Hero */}
      <section className="section" style={{ paddingBottom: 8 }}>
        <div className="container">
          <div className="panel">
            <p className="small" style={{ margin: "0 0 6px", opacity: 0.8 }}>
              {sample.name}
            </p>
            <h1 style={{ margin: "0 0 10px" }}>{copy.heroTitle}</h1>
            <p className="subhead" style={{ marginBottom: 16 }}>{copy.heroSub}</p>
            <div className="btn-row" style={{ marginBottom: 18 }}>
              <Link href="/contact" className="btn gold">
                {copy.ctaPrimary}
              </Link>
              <Link href="/website-samples" className="btn ghost">
                {copy.ctaSecondary}
              </Link>
            </div>
            {sample.imageUrl && (
              <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.imageUrl}
                  alt={`${sample.name} homepage preview`}
                  style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 12px" }}>{copy.servicesTitle}</h2>
            <div className="how-it-works-grid">
              {copy.services.map((item) => (
                <article key={item.name} className="how-it-works-card">
                  <h3 className="how-it-works-title">{item.name}</h3>
                  <p className="how-it-works-copy">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 12px" }}>{copy.trustTitle}</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {copy.trustBullets.map((line) => (
                <li key={line} className="small" style={{ marginBottom: 8 }}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Client Feedback</h2>
            <blockquote className="card" style={{ margin: 0 }}>
              <p style={{ margin: "0 0 10px" }}>{copy.testimonial}</p>
              <p className="small" style={{ margin: 0, opacity: 0.8 }}>— {copy.testimonialBy}</p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Contact / location */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>{copy.contactTitle}</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>{copy.contactText}</p>
            <div className="btn-row">
              <Link href="/contact" className="btn gold">
                {copy.ctaPrimary}
              </Link>
              <Link href="/website-samples" className="btn ghost">
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="panel">
            <p className="small" style={{ margin: 0, textAlign: "center", opacity: 0.8 }}>
              MixedMakerShop Web Design • Built for small businesses that want better websites and better conversion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
