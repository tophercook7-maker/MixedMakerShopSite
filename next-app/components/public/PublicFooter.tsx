import Link from "next/link";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicGoogleMapsSearchHref } from "@/lib/public-brand";

export function PublicFooter() {
  const linkGroups = [
    {
      title: "MixedMakerShop",
      links: [
        { href: "/start-here", label: "Start Here" },
        { href: "/examples", label: "Examples" },
        { href: "/idea-lab", label: "Idea Lab" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Websites & Tools",
      links: [
        { href: "/websites-tools", label: "Websites & Tools" },
        { href: publicFreeMockupFunnelHref, label: "Free Website Preview" },
        { href: "/web-design", label: "Web Design" },
        { href: "/tools", label: "Digital Tools" },
      ],
    },
    {
      title: "GiGi’s Print Shop",
      links: [
        { href: "/3d-printing", label: "GiGi’s Print Shop" },
        { href: "/3d-printing#print-request", label: "Start a Print Request" },
        { href: "/3d-printing#seasonal-prints", label: "Bookmarks & Gifts" },
        { href: "/3d-printing#what-gigi-makes", label: "Useful Prints" },
      ],
    },
    {
      title: "Property Care",
      links: [
        { href: "/property-care", label: "Property Care" },
        { href: "https://freshcutpropertycare.com/", label: "Fresh Cut Property Care", external: true },
        { href: "https://freshcutpropertycare.com/contact/", label: "Request Fresh Cut Estimate", external: true },
      ],
    },
  ] as const;

  function renderFooterLink(link: (typeof linkGroups)[number]["links"][number]) {
    if ("external" in link && link.external) {
      return (
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      );
    }
    if (link.href === "/contact") {
      return (
        <TrackedPublicLink href={link.href} eventName="public_contact_cta_click" eventProps={{ location: "footer" }}>
          {link.label}
        </TrackedPublicLink>
      );
    }
    return <Link href={link.href}>{link.label}</Link>;
  }

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
            <ul className="footer-links mt-4 list-none p-0">
              {linkGroups[0].links.map((link) => (
                <li key={`MixedMakerShop-${link.href}`}>{renderFooterLink(link)}</li>
              ))}
            </ul>
          </div>
          {linkGroups.slice(1).map((group) => (
            <div key={group.title} className="footer-col">
              <h2 className="small footer-premium-heading mb-2.5 font-semibold">
                {group.title}
              </h2>
              <ul className="footer-links m-0 list-none p-0">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    {renderFooterLink(link)}
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
                  {renderFooterLink(link)}
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
