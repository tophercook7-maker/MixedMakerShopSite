import Link from "next/link";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";

export function PublicFooter() {
  return (
    <footer className="footer footer--premium" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h2 className="small footer-premium-heading" style={{ margin: "0 0 10px", fontWeight: 600 }}>
              Contact
            </h2>
            <p className="small" style={{ margin: 0, opacity: 0.9 }}>
              MixedMakerShop — Umbrella studio for Topher&apos;s Web Design and 3D printing / problem-solving.
            </p>
            <p className="small" style={{ margin: "6px 0 0" }}>
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
              Web Design Services
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
            </ul>
          </div>
        </div>
        <div className="small" style={{ marginTop: 20 }}>
          MixedMakerShop is the studio. Topher Web Design is the client-service side for business websites.
        </div>
        <div className="small" style={{ marginTop: 10 }}>
          <Link href="/">Home</Link> • <Link href="/web-design">Web Design</Link> •{" "}
          <Link href="/3d-printing">3D Printing</Link> • <Link href="/examples">Examples</Link> •{" "}
          <Link href="/free-mockup">Free Mockup</Link> • <Link href="/website-roast">Website Roast</Link> •{" "}
          <TrackedPublicLink
            href="/contact"
            eventName="public_contact_cta_click"
            eventProps={{ location: "footer" }}
          >
            Contact
          </TrackedPublicLink>
        </div>
      </div>
    </footer>
  );
}
