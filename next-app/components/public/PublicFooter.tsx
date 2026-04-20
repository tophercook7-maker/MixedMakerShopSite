import Link from "next/link";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicGoogleMapsSearchHref } from "@/lib/public-brand";

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
              MixedMakerShop is Topher&apos;s studio for practical web design, custom 3D printing, and useful digital tools.
            </p>
            <p className="small" style={{ margin: "10px 0 0" }}>
              Hot Springs, Arkansas • Serving nearby towns and clients nationwide
            </p>
            <p className="small" style={{ marginTop: 6 }}>Topher@mixedmakershop.com</p>
            <p className="small" style={{ marginTop: 10 }}>
              <a href={publicGoogleMapsSearchHref} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
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

        <nav className="footer-sitemap" aria-label="Site overview">
          <div className="footer-sitemap__group">
            <p className="footer-sitemap__label">Explore</p>
            <div className="footer-sitemap__links">
              <Link href="/">Home</Link>
              <span className="footer-sitemap__sep" aria-hidden>
                ·
              </span>
              <Link href="/web-design">Web Design</Link>
              <span className="footer-sitemap__sep" aria-hidden>
                ·
              </span>
              <Link href="/examples">Examples</Link>
              <span className="footer-sitemap__sep" aria-hidden>
                ·
              </span>
              <Link href="/3d-printing">3D Printing</Link>
            </div>
          </div>
          <div className="footer-sitemap__group">
            <p className="footer-sitemap__label">Tools &amp; labs</p>
            <div className="footer-sitemap__links">
              <Link href="/tools">Tools</Link>
              <span className="footer-sitemap__sep" aria-hidden>
                ·
              </span>
              <Link href="/ad-lab">Ad Lab</Link>
              <span className="footer-sitemap__sep" aria-hidden>
                ·
              </span>
              <Link href="/website-roast">Website Roast</Link>
            </div>
          </div>
          <div className="footer-sitemap__group">
            <p className="footer-sitemap__label">Studio</p>
            <div className="footer-sitemap__links">
              <Link href="/about">About</Link>
              <span className="footer-sitemap__sep" aria-hidden>
                ·
              </span>
              <TrackedPublicLink
                href="/contact"
                eventName="public_contact_cta_click"
                eventProps={{ location: "footer" }}
              >
                Contact
              </TrackedPublicLink>
              <span className="footer-sitemap__sep" aria-hidden>
                ·
              </span>
              <Link href={publicFreeMockupFunnelHref}>Free Preview</Link>
            </div>
          </div>
        </nav>
      </div>
    </footer>
  );
}
