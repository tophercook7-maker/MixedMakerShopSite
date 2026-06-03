import Link from "next/link";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const metadata = {
  title: "restaurant website design hot springs | Topher Cook",
  description:
    "Restaurant website design in Hot Springs for menus, hours, location details, reservations, and mobile-first customer action.",
};

export default function RestaurantWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>restaurant website design hot springs</h1>
          <p className="subhead">
            Topher Cook builds practical restaurant websites for Hot Springs food businesses that need customers to find
            the menu, hours, location, phone number, and next step fast. The page should help someone decide where to eat
            from their phone without hunting through social posts or outdated PDFs.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Common Restaurant Website Problems</h2>
          <div className="grid-2">
            <div className="card">
              <h3>The menu is hard to find</h3>
              <p className="small">Customers need menu highlights, categories, and pricing direction without opening a clunky file.</p>
            </div>
            <div className="card">
              <h3>Hours and location are unclear</h3>
              <p className="small">A hungry visitor should quickly know whether you are open and how to get there.</p>
            </div>
            <div className="card">
              <h3>Mobile users cannot act</h3>
              <p className="small">Call, directions, order, and reservation buttons should be easy to tap.</p>
            </div>
            <div className="card">
              <h3>The site does not show the vibe</h3>
              <p className="small">Good photos, featured dishes, and plain copy help first-time guests know what to expect.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>The Solution</h2>
          <p className="small">
            A restaurant site should be fast, visual, and useful. I can build menu sections, hours, location blocks,
            photo highlights, reservation or order links, private event notes, catering details, and local SEO structure
            that supports how people search in Hot Springs.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Pricing Direction</h2>
          <p className="small">
            Pricing depends on whether you need a simple landing page, full menu pages, online ordering links, catering
            pages, or regular updates. Start with the <Link href="/pricing.html">pricing page</Link>, then use{" "}
            <Link href="/contact.html">contact</Link> to describe your restaurant.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Service Area</h2>
          <p className="small">
            I serve restaurants, cafes, food trucks, caterers, and local food brands in Hot Springs, Lake Hamilton, Hot
            Springs Village, Malvern, Benton, and nearby Arkansas communities.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Related Service Pages</h2>
          <p className="small">
            For broader website help, visit <Link href="/web-design-hot-springs-ar">web designer hot springs ar</Link>,{" "}
            <Link href="/website-designer-hot-springs-ar">website designer hot springs ar</Link>, or{" "}
            <Link href="/small-business-websites-hot-springs">small business web design hot springs</Link>. Churches can
            visit <Link href="/church-websites-hot-springs">church website design hot springs</Link>.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>FAQs</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Can you work from our current menu?</h3>
              <p className="small">Yes. I can turn your existing menu into cleaner website sections and link to ordering if needed.</p>
            </div>
            <div className="card">
              <h3>Can the site promote catering or events?</h3>
              <p className="small">Yes. Catering, private dining, specials, and seasonal offers can each get clear sections or pages.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>Call to Action</h2>
          <p className="small">
            Send Topher your restaurant name, current menu, and the main action you want customers to take. I will point
            you toward a practical starting build.
          </p>

          <div className="btn-row" style={{ marginTop: 20 }}>
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
