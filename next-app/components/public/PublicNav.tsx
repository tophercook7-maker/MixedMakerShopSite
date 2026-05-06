"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { trackPublicEvent } from "@/lib/public-analytics";

const TOPHER_TEXT_HREF = "sms:+15015758017";

const navItems: {
  href: string;
  label: string;
  event?: { name: string; props?: Record<string, string | number | boolean | undefined> };
}[] = [
  { href: "/start-here", label: "Start Here" },
  { href: "/websites-tools", label: "Websites & Tools" },
  { href: "/3d-printing", label: "GiGi’s Print Shop" },
  { href: "/property-care", label: "Property Care" },
  { href: "/idea-lab", label: "Idea Lab" },
  { href: "/examples", label: "Examples" },
  { href: "/contact", label: "Contact", event: { name: "public_contact_cta_click", props: { location: "nav" } } },
];

export function PublicNav() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const [logoFailed, setLogoFailed] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const toggle = toggleRef.current;
    const nav = navRef.current;
    if (!toggle || !nav) return;
    const handler = () => nav.classList.toggle("open");
    toggle.addEventListener("click", handler);
    return () => toggle.removeEventListener("click", handler);
  }, []);

  return (
    <header className={cn("nav nav--premium", isHome && "nav--gateway")}>
      <div className="nav-inner">
        <Link href="/" className="brand">
          {logoFailed ? (
            <div className="logo">M³</div>
          ) : (
            <Image
              src="/images/m3-logo.png"
              alt="MixedMakerShop M³ logo"
              width={56}
              height={56}
              className="nav-brand-logo rounded-xl shrink-0 object-contain"
              priority
              onError={() => setLogoFailed(true)}
            />
          )}
          <div className="brand-title">
            <div className="name">MixedMakerShop</div>
            <div className="sub">
              <strong>Useful things built online, outside, and in the workshop</strong>
            </div>
            <div className="small nav-brand-meta">Topher &amp; GiGi · Hot Springs, Arkansas</div>
          </div>
        </Link>
        <button ref={toggleRef} className="menu-toggle" type="button" aria-label="Open menu">
          ☰
        </button>
        <nav ref={navRef} className="main-nav nav-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "pill",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                  ? "pill--active"
                  : null,
              )}
              onClick={() => {
                if (item.event) trackPublicEvent(item.event.name, item.event.props);
              }}
            >
              {item.label}
            </Link>
          ))}
          <span className="nav-cta-divider" aria-hidden="true" />
          <a
            href={TOPHER_TEXT_HREF}
            className="pill cta"
            onClick={() =>
              trackPublicEvent("public_contact_cta_click", { location: "nav", target: "text_topher" })
            }
          >
            Text Topher
          </a>
          <Link
            href={publicFreeMockupFunnelHref}
            className="pill cta"
            onClick={() =>
              trackPublicEvent("public_contact_cta_click", { location: "nav", target: "free_mockup" })
            }
          >
            Free Website Preview
          </Link>
        </nav>
      </div>
    </header>
  );
}
