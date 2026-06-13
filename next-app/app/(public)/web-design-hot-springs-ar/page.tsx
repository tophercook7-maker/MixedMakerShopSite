import Link from "next/link";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const metadata = {
  title: "web designer hot springs ar | Topher Cook",
  description:
    "Founder-led web design in Hot Springs, AR for small businesses that need a clear, practical website built by Topher Cook.",
};

export default function WebDesignHotSpringsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>web designer hot springs ar</h1>
          <p className="subhead">
            MixedMakerShop is the founder-led studio of Topher Cook in Hot Springs, Arkansas. I build practical websites
            for local service businesses that need clearer messaging, stronger trust, and an easier path from visitor to
            phone call, quote request, or booking.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Problems I Help Fix</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Visitors cannot tell what you do</h3>
              <p className="small">A vague homepage makes people leave before they understand your service area or offer.</p>
            </div>
            <div className="card">
              <h3>The site does not feel local</h3>
              <p className="small">Hot Springs customers need fast proof that you serve their area and can solve their problem.</p>
            </div>
            <div className="card">
              <h3>Calls to action are buried</h3>
              <p className="small">Your phone number, form, and next step should be obvious on mobile and desktop.</p>
            </div>
            <div className="card">
              <h3>Updates take too long</h3>
              <p className="small">A practical website should be easy to adjust as services, offers, and photos change.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>Solutions Built Around Local Buyers</h2>
          <p className="small">
            I focus on clean page structure, plain-language service copy, mobile-first layouts, local trust signals,
            and direct calls to action. You work with Topher Cook from the first conversation through launch, so the site
            reflects how your business actually works.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Pricing Direction</h2>
          <p className="small">
            Simple landing pages usually start lower than full multi-page builds. Most small business sites depend on
            the number of pages, forms, galleries, booking tools, and copy needs. See the <Link href="/pricing">pricing page</Link>{" "}
            for current starting points.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Service Area</h2>
          <p className="small">
            Based in Hot Springs, I work with businesses in Hot Springs, Hot Springs Village, Lake Hamilton, Malvern,
            Benton, Arkadelphia, and nearby Arkansas communities.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Related Web Design Pages</h2>
          <p className="small">
            Compare this page with <Link href="/website-designer-hot-springs-ar">website designer hot springs ar</Link>,{" "}
            <Link href="/small-business-websites-hot-springs">small business web design hot springs</Link>,{" "}
            <Link href="/restaurant-websites-hot-springs">restaurant website design hot springs</Link>, and{" "}
            <Link href="/church-websites-hot-springs">church website design hot springs</Link>.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>FAQs</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Do you work with brand-new businesses?</h3>
              <p className="small">Yes. A lean first site can explain your offer, location, proof, and contact path.</p>
            </div>
            <div className="card">
              <h3>Can you improve an existing site?</h3>
              <p className="small">Yes. I can redesign pages, clarify copy, improve local structure, or build a cleaner replacement.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>Start With a Clear Next Step</h2>
          <p className="small">
            If you want a practical local website without agency runaround, send the details through the{" "}
            <Link href="/contact">contact page</Link> or start with a free preview.
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
