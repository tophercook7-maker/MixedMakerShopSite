import Link from "next/link";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";

export function PublicFooter() {
  return (
    <footer className="footer footer--premium" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h2 className="small footer-premium-heading" style={{ margin: "0 0 10px", fontWeight: 600 }}>
              MixedMakerShop
            </h2>
            <p className="small" style={{ margin: 0, opacity: 0.92, lineHeight: 1.55 }}>
              MixedMakerShop is Topher&apos;s studio for practical web design, custom 3D printing, and useful digital builds.
            </p>
            <p className="small" style={{ margin: "10px 0 0" }}>
              Hot Springs, Arkansas • Serving nearby towns and clients nationwide
            </p>
            <p className="small" style={{ marginTop: 6 }}>Topher@mixedmakershop.com</p>
            <p className="small" style={{ marginTop: 10 }}>
              <a href="https://share.google.com/cJA3CmiybFK1WNE5D" target="_blank" rel="noopener noreferrer">
                Find MixedMakerShop on Google
              </a>
            </p>
          </div>
          <div className="footer-col">
            <h2 className="small footer-premium-heading" style={{ margin: "0 0 10px", fontWeight: 600 }}>
              Web Design
            </h2>
            <ul className="footer-links" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              <li>
                <Link href="/web-design-hot-springs-ar">Web Design in Hot Springs</Link>
              </li>
              <li>
                <Link href="/restaurant-websites-hot-springs">Restaurant Websites</Link>
              </li>
              <li>
                <Link href="/coffee-shop-websites-hot-springs">Coffee Shop Websites</Link>
              </li>
              <li>
                <Link href="/church-websites-hot-springs">Church Websites</Link>
              </li>
              <li>
                <Link href="/small-business-websites-hot-springs">Small Business Websites</Link>
              </li>
              <li>
                <Link href="/lawn-care-hot-springs-ar">Lawn Care (Hot Springs)</Link>
              </li>
              <li>
                <Link href="/pressure-washing-hot-springs-ar">Pressure Washing (Hot Springs)</Link>
              </li>
              <li>
                <Link href="/yard-cleanup-hot-springs-ar">Yard Cleanup (Hot Springs)</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="small" style={{ marginTop: 20, lineHeight: 1.55 }}>
          <Link href="/">Home</Link>
          {" · "}
          <Link href="/web-design">Web Design</Link>
          {" · "}
          <Link href="/examples">Examples</Link>
          {" · "}
          <Link href="/3d-printing">3D Printing</Link>
          {" · "}
          <Link href="/builds">Builds</Link>
          {" · "}
          <Link href="/about">About</Link>
          {" · "}
          <TrackedPublicLink
            href="/contact"
            eventName="public_contact_cta_click"
            eventProps={{ location: "footer" }}
          >
            Contact
          </TrackedPublicLink>
          {" · "}
          <Link href="/free-mockup">Free Preview</Link>
          {" · "}
          <Link href="/website-roast">Website Roast</Link>
        </div>
      </div>
    </footer>
  );
}
