import Link from "next/link";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicGoogleMapsSearchHref, publicGoogleReviewHref } from "@/lib/public-brand";
import { PUBLIC_POPULAR_PAGES } from "@/lib/public-popular-pages";
import { publicTopherPhoneDisplay, publicTopherTextHref } from "@/lib/public-brand";

export function PublicFooter() {
  const linkGroups = [
    {
      title: "Everything I Do",
      links: [
        { href: "/web-design", label: "Websites, Apps & Software" },
        { href: "/ai-business-tools", label: "AI & Automation" },
        { href: "/lab#books", label: "Books, Audio & Creative" },
        { href: "/in-home-computer-repair", label: "In-Home Computer Help" },
        { href: "/3d-printing", label: "3D Printing" },
        { href: "/family-history", label: "Genealogy & Family History" },
        { href: "/contact?topic=ideas", label: "Ideas, Experiments & Inventions" },
      ],
    },
    {
      title: "MixedMakerShop",
      links: [
        { href: publicGoogleReviewHref, label: "⭐ Leave a Review", external: true },
        { href: "/start-here", label: "Start Here" },
        { href: "/pricing", label: "Pricing" },
        { href: publicFreeMockupFunnelHref, label: "Free Website Preview" },
        { href: "/examples", label: "Examples" },
        { href: "/pay", label: "Pay an Invoice" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Websites",
      links: PUBLIC_POPULAR_PAGES.filter((p) => !["/pricing", "/portfolio", "/builds", "/lab"].includes(p.href)),
    },
    {
      title: "The Lab",
      links: [
        { href: "/lab", label: "Inside the Lab" },
        { href: "/builds", label: "Builds & Experiments" },
        { href: "/portfolio/index.html", label: "Books, Apps & Games" },
        { href: "/3d-scenes", label: "Pop-Out Video Ads" },
        { href: "/idea-lab", label: "Idea Lab" },
        { href: "/blog", label: "Blog" },
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
              One guy, a lot of skills. Websites and apps, AI and automation, books and audio, in-home computer help,
              3D printing, family history, and ideas that need building — all by one person in Hot Springs.
            </p>
            <p className="small mt-2.5">
              Hot Springs, Arkansas • Serving nearby towns and clients nationwide
            </p>
            <p className="small mt-1.5">
              Topher@mixedmakershop.com · <a href={publicTopherTextHref}>Text {publicTopherPhoneDisplay}</a>
            </p>
            <p className="small mt-2.5">
              <a href={publicGoogleMapsSearchHref} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
              </a>
            </p>
            <p className="small mt-3 m-0 leading-[1.55]">
              <Link href="/privacy">Privacy Policy</Link>
              <span className="mx-1.5 opacity-60" aria-hidden>
                ·
              </span>
              <Link href="/terms">Terms of Service</Link>
              <span className="mx-1.5 opacity-60" aria-hidden>
                ·
              </span>
              <Link href="/llms.txt">For AI assistants</Link>
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
