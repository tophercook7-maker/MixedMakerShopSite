"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";

export function PublicNav() {
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
          <div className="logo">M³</div>
          <div className="brand-title">
            <div className="name">MIXEDMAKERSHOP</div>
            <div className="sub">
              <strong>Owned & Operated by Topher Cook</strong>
            </div>
            <div className="small" style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>
              Custom Web Design • Local Visibility • 3D Printing
            </div>
            <div className="tag">From ideas to websites, tools, and builds you can hold.</div>
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
          <Link href="/website-samples" className="pill">
            Website Samples
          </Link>
          <Link href="/3d-printing" className="pill">
            3D Printing
          </Link>
          <Link href="/website-roast" className="pill">
            Free Website Roast
          </Link>
          <Link href="/#free-mockup-request" className="pill cta">
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
