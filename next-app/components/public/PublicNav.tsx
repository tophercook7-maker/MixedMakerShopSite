"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export function PublicNav() {
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
    <header className="nav">
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
              className="rounded-xl shadow-[0_0_15px_rgba(255,140,0,0.6)] shrink-0 object-contain"
              priority
              onError={() => setLogoFailed(true)}
            />
          )}
          <div className="brand-title">
            <div className="name">MixedMakerShop</div>
            <div className="sub">
              <strong>Custom 3D Printing</strong>
            </div>
            <div className="small" style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>
              Web design • Hot Springs, Arkansas • Owned by Topher Cook
            </div>
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
            Work With Topher
          </Link>
          <Link href="/website-samples" className="pill">
            Website Samples
          </Link>
          <Link href="/3d-printing" className="pill">
            3D Printing
          </Link>
          <Link href="/upload-print" className="pill">
            Upload print
          </Link>
          <Link href="/website-roast" className="pill">
            Free Website Roast
          </Link>
          <Link href="/web-design" className="pill cta">
            Get My Free Mockup ➜
          </Link>
          <Link href="/auth/login" className="pill">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
