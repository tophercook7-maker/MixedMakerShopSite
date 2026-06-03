import Link from "next/link";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const metadata = {
  title: "church website design hot springs | Topher Cook",
  description:
    "Church website design in Hot Springs for service times, visitor next steps, ministries, events, and clear local communication.",
};

export default function ChurchWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>church website design hot springs</h1>
          <p className="subhead">
            Topher Cook builds clear, welcoming church websites for Hot Springs congregations that need service times,
            location details, ministries, events, and next steps to be easy for first-time visitors and members to find.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Problems Churches Often Face Online</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Visitors cannot find basics</h3>
              <p className="small">Service times, parking, kids ministry, and location should be visible fast.</p>
            </div>
            <div className="card">
              <h3>Events are scattered</h3>
              <p className="small">Important church activity should be organized instead of buried in social feeds.</p>
            </div>
            <div className="card">
              <h3>The site feels outdated</h3>
              <p className="small">An old design can make a healthy church feel harder to approach than it really is.</p>
            </div>
            <div className="card">
              <h3>There is no clear next step</h3>
              <p className="small">Visitors need simple paths to plan a visit, ask a question, or connect with a ministry.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>The Solution</h2>
          <p className="small">
            A church website should reduce uncertainty. I build pages around service times, beliefs, leadership,
            ministries, events, giving links, contact forms, and visitor-friendly language that helps people know what to
            expect before they walk in.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Pricing Direction</h2>
          <p className="small">
            A simple church refresh may only need a few core pages. Larger builds can include events, sermons, ministry
            pages, giving links, and volunteer forms. Check <Link href="/pricing.html">pricing</Link> for starting
            points, then use <Link href="/contact.html">contact</Link> to explain what your church needs.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Service Area</h2>
          <p className="small">
            MixedMakerShop serves churches and ministries in Hot Springs, Hot Springs Village, Lake Hamilton, Malvern,
            Benton, Arkadelphia, and surrounding Arkansas communities.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Related Service Pages</h2>
          <p className="small">
            For broader help, see <Link href="/web-design-hot-springs-ar">web designer hot springs ar</Link>,{" "}
            <Link href="/website-designer-hot-springs-ar">website designer hot springs ar</Link>, and{" "}
            <Link href="/small-business-websites-hot-springs">small business web design hot springs</Link>. Food service
            pages are covered under <Link href="/restaurant-websites-hot-springs">restaurant website design hot springs</Link>.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>FAQs</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Can you help organize ministry content?</h3>
              <p className="small">Yes. I can help group ministries, events, service details, and visitor information clearly.</p>
            </div>
            <div className="card">
              <h3>Can we keep giving or livestream links?</h3>
              <p className="small">Yes. Existing tools can be linked or embedded where they make sense for visitors and members.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>Call to Action</h2>
          <p className="small">
            If your church website needs to feel clearer and more welcoming, send Topher a short note about your current
            site and the pages you need.
          </p>

          <div className="btn-row" style={{ marginTop: 22 }}>
            <Link href={publicFreeMockupFunnelHref} className="btn gold">
              Get My Free Preview
            </Link>
            <Link href="/contact.html" className="btn ghost">
              Contact Topher
            </Link>
            <Link href="/pricing.html" className="btn ghost">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
