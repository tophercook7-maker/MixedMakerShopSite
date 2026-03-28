"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { trackPublicEvent } from "@/lib/public-analytics";

export function PublicNav() {
  const pathname = usePathname();
  const isGatewayHome = pathname === "/" || pathname === "";
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
    <header className={cn("nav nav--premium", isGatewayHome && "nav--gateway")}>
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
              <strong>Web design &amp; 3D printing</strong>
            </div>
            <div className="small nav-brand-meta">Hot Springs, Arkansas</div>
          </div>
        </Link>
        <button ref={toggleRef} className="menu-toggle" type="button" aria-label="Open menu">
          ☰
        </button>
        <nav ref={navRef} className="main-nav nav-links">
          <Link href="/" className="pill">
            Home
          </Link>
          <Link href="/web-design" className="pill">
            Web Design
          </Link>
          <Link href="/3d-printing" className="pill">
            3D Printing
          </Link>
          <Link href="/examples" className="pill">
            Examples
          </Link>
          <Link
            href="/contact"
            className="pill"
            onClick={() => trackPublicEvent("public_contact_cta_click", { location: "nav" })}
          >
            Contact
          </Link>
          <Link
            href="/free-mockup"
            className="pill cta"
            onClick={() =>
              trackPublicEvent("public_contact_cta_click", { location: "nav", target: "free_mockup" })
            }
          >
            Free mockup
          </Link>
          <Link href="/auth/login" className="pill pill--muted">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
