import Link from "next/link";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const metadata = {
  title: "small business web design hot springs | Topher Cook",
  description:
    "Small business web design in Hot Springs for local owners who need clear messaging, mobile-friendly pages, and practical lead capture.",
};

export default function SmallBusinessWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>small business web design hot springs</h1>
          <p className="subhead">
            Topher Cook builds small business websites for Hot Springs owners who need a practical online home, not a
            bloated agency project. The goal is simple: explain what you do, show why people can trust you, and make it
            easy for a local buyer to call, request a quote, or take the next step.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Problems Small Businesses Run Into</h2>
          <div className="grid-2">
            <div className="card">
              <h3>The site is too vague</h3>
              <p className="small">Visitors should know your services, service area, and next step without digging.</p>
            </div>
            <div className="card">
              <h3>Mobile visitors get stuck</h3>
              <p className="small">Most local buyers check you from a phone, so forms, buttons, and content need to be simple.</p>
            </div>
            <div className="card">
              <h3>There is no clear proof</h3>
              <p className="small">Photos, reviews, project examples, and plain service details help customers feel safe reaching out.</p>
            </div>
            <div className="card">
              <h3>The website is hard to update</h3>
              <p className="small">Small businesses need pages that can grow as offers, teams, and photos change.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>The Solution</h2>
          <p className="small">
            I build focused pages with service sections, local context, trust-building content, and calls to action that
            make sense for your business. That might be a one-page starter site, a 3-5 page service website, or a more
            complete system with forms, booking, payments, or simple admin tools.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Pricing Direction</h2>
          <p className="small">
            A small landing page usually costs less than a full website with multiple services and custom forms. Review
            current starting points on the <Link href="/pricing">pricing page</Link>, then use the{" "}
            <Link href="/contact">contact page</Link> if you want Topher to look at your situation.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Service Area</h2>
          <p className="small">
            MixedMakerShop serves small businesses in Hot Springs, Hot Springs Village, Lake Hamilton, Malvern, Benton,
            Arkadelphia, and surrounding Arkansas markets.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Related Service Pages</h2>
          <p className="small">
            If you are comparing options, see <Link href="/web-design-hot-springs-ar">web designer hot springs ar</Link>,{" "}
            <Link href="/restaurant-websites-hot-springs">restaurant website design hot springs</Link>, and{" "}
            <Link href="/church-websites-hot-springs">church website design hot springs</Link>.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>FAQs</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Can I start with one page?</h3>
              <p className="small">Yes. A focused landing page can be a good first step before a larger site.</p>
            </div>
            <div className="card">
              <h3>Will the site be local-search friendly?</h3>
              <p className="small">Yes. I structure pages with clear services, locations, headings, internal links, and practical copy.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>Call to Action</h2>
          <p className="small">
            Send a few details about your business and what the website needs to do. Topher can recommend the simplest
            useful path before you spend money on extras.
          </p>

          <div className="btn-row" style={{ marginTop: 22 }}>
            <Link href={publicFreeMockupFunnelHref} className="btn gold">
              Get My Free Preview
            </Link>
            <Link href="/contact" className="btn ghost">
              Contact Topher
            </Link>
            <Link href="/pricing" className="btn ghost">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
