import Link from "next/link";

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
              MixedMakerShop — Websites, SEO, and growth support for local businesses. Based in Hot Springs, Arkansas.
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
          <Link href="/">Home</Link> • <Link href="/web-design">Work With Topher</Link> •{" "}
          <Link href="/website-roast">Free Website Roast</Link> • <Link href="/tools">Tools</Link> •{" "}
          <Link href="/restaurant-website-redesign">Restaurant Redesign Demo</Link> •{" "}
          <Link href="/3d-printing">3D Printing</Link> • <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
