import Link from "next/link";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicGoogleMapsSearchHref } from "@/lib/public-brand";

export function PublicFooter() {
  const linkGroups = [
    {
      title: "MixedMakerShop",
      links: [
        { href: "/start-here", label: "Start Here" },
        { href: "/about", label: "About" },
        { href: "/examples", label: "Examples" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Websites & Tools",
      links: [
        { href: "/web-design", label: "Web Design" },
        { href: publicFreeMockupFunnelHref, label: "Free Website Preview" },
        { href: "/tools", label: "Digital Tools" },
        { href: "/websites-tools#templates-kits", label: "Templates & Kits" },
        { href: "/idea-lab", label: "Idea Lab" },
      ],
    },
    {
      title: "GiGi’s Print Shop",
      links: [
        { href: "/3d-printing", label: "Custom 3D Printing" },
        { href: "/3d-printing#what-gigi-makes", label: "Useful Prints" },
        { href: "/3d-printing#seasonal-prints", label: "Bookmarks & Gifts" },
        { href: "/3d-printing#print-request", label: "Print Request" },
      ],
    },
    {
      title: "Property Care",
      links: [
        { href: "/property-care#lawn-care", label: "Lawn Care" },
        { href: "/property-care#yard-cleanup", label: "Yard Cleanup" },
        { href: "/property-care#property-cleanup", label: "Property Cleanup" },
      ],
    },
  ] as const;

  return (
    <footer className="footer footer--premium" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h2 className="small footer-premium-heading mb-2.5 font-semibold">
              MixedMakerShop
            </h2>
            <p className="small m-0 leading-[1.55] opacity-[0.92]">
              MixedMakerShop is Topher &amp; GiGi&apos;s practical creative studio for useful things built online, outside,
              and in the workshop.
            </p>
            <p className="small mt-2.5">
              Hot Springs, Arkansas • Serving nearby towns and clients nationwide
            </p>
            <p className="small mt-1.5">Topher@mixedmakershop.com</p>
            <p className="small mt-2.5">
              <a href={publicGoogleMapsSearchHref} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
              </a>
            </p>
          </div>
          {linkGroups.slice(1).map((group) => (
            <div key={group.title} className="footer-col">
              <h2 className="small footer-premium-heading mb-2.5 font-semibold">
                {group.title}
              </h2>
              <ul className="footer-links m-0 list-none p-0">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <nav className="footer-sitemap" aria-label="Site overview">
          {linkGroups.map((group) => (
          <div key={group.title} className="footer-sitemap__group">
            <p className="footer-sitemap__label">{group.title}</p>
            <div className="footer-sitemap__links">
              {group.links.map((link, index) => (
                <span key={`${group.title}-${link.href}`}>
                  {index > 0 ? (
                    <span className="footer-sitemap__sep" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {link.href === "/contact" ? (
                    <TrackedPublicLink
                      href={link.href}
                      eventName="public_contact_cta_click"
                      eventProps={{ location: "footer" }}
                    >
                      {link.label}
                    </TrackedPublicLink>
                  ) : (
                    <Link href={link.href}>{link.label}</Link>
                  )}
                </span>
              ))}
            </div>
          </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
