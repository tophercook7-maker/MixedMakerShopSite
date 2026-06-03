import Link from "next/link";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const metadata = {
  title: "website designer hot springs ar | Topher Cook",
  description:
    "Website designer in Hot Springs, AR for local businesses that need clear pages, practical copy, and direct founder-led support.",
};

export default function WebsiteDesignerHotSpringsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>website designer hot springs ar</h1>
          <p className="subhead">
            If you need a website designer in Hot Springs, AR who can talk plainly, organize the content, and build
            something useful, MixedMakerShop is the founder-led path. Topher Cook works directly with local owners to
            turn scattered ideas, services, photos, and calls to action into a website customers can understand.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Problems This Solves</h2>
          <div className="grid-2">
            <div className="card">
              <h3>No clear homepage message</h3>
              <p className="small">A good site should quickly explain who you help, what you do, and how to start.</p>
            </div>
            <div className="card">
              <h3>Too much friction for buyers</h3>
              <p className="small">Calls, forms, pricing direction, service areas, and proof should not be hard to find.</p>
            </div>
            <div className="card">
              <h3>Outdated local presence</h3>
              <p className="small">A dated or thin website can make a real business look less active than it is.</p>
            </div>
            <div className="card">
              <h3>Too many handoffs</h3>
              <p className="small">With Topher, you work with the person shaping the copy, structure, and build.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>The Solution</h2>
          <p className="small">
            I build practical websites with service-focused sections, local context, mobile-friendly layouts, clear forms,
            and simple calls to action. The work can start as a landing page, a 3-5 page business site, or a more custom
            web system depending on what your customers need to do.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Pricing Direction</h2>
          <p className="small">
            Pricing depends on page count, content needs, integrations, and whether you need extras like booking, forms,
            payments, galleries, or automation. See <Link href="/pricing.html">pricing</Link> for starting points, then
            use <Link href="/contact.html">contact</Link> to ask about your specific project.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Service Area</h2>
          <p className="small">
            MixedMakerShop is based in Hot Springs and serves local businesses across Hot Springs, Hot Springs Village,
            Lake Hamilton, Malvern, Benton, Arkadelphia, and nearby Arkansas communities.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Related Service Pages</h2>
          <p className="small">
            You may also want <Link href="/web-design-hot-springs-ar">web designer hot springs ar</Link>,{" "}
            <Link href="/small-business-websites-hot-springs">small business web design hot springs</Link>,{" "}
            <Link href="/restaurant-websites-hot-springs">restaurant website design hot springs</Link>, or{" "}
            <Link href="/church-websites-hot-springs">church website design hot springs</Link>.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>FAQs</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Do you write the website copy?</h3>
              <p className="small">Yes. I can help shape practical copy from your services, notes, photos, and customer questions.</p>
            </div>
            <div className="card">
              <h3>Can you build around my current brand?</h3>
              <p className="small">Yes. I can use existing colors, logos, and photos, or help simplify the visual direction.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>Call to Action</h2>
          <p className="small">
            Start by sending the business name, current website if you have one, and what you want customers to do next.
            Topher will point you toward the simplest useful website path.
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
