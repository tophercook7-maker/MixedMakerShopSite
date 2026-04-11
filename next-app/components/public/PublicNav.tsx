"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { trackPublicEvent } from "@/lib/public-analytics";

const navItems: {
  href: string;
  label: string;
  event?: { name: string; props?: Record<string, string | number | boolean | undefined> };
}[] = [
  { href: "/", label: "Home" },
  { href: "/web-design", label: "Web Design" },
  { href: "/examples", label: "Examples" },
  { href: "/3d-printing", label: "3D Printing" },
  { href: "/builds", label: "Builds" },
  { href: "/about", label: "About" },
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
              <strong>Web design, 3D printing &amp; digital builds by Topher</strong>
            </div>
            <div className="small nav-brand-meta">Hot Springs, Arkansas</div>
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
              className="pill"
              onClick={() => {
                if (item.event) trackPublicEvent(item.event.name, item.event.props);
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/free-mockup"
            className="pill cta"
            onClick={() =>
              trackPublicEvent("public_contact_cta_click", { location: "nav", target: "free_mockup" })
            }
          >
            Free Preview
          </Link>
        </nav>
      </div>
    </header>
  );
}
