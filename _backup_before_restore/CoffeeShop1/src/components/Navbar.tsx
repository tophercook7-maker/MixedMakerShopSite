"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#visit", label: "Visit Us" },
  { href: "#contact", label: "Contact" }
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("bb_theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.1 }
    );

    links.forEach((link) => {
      const target = document.querySelector(link.href);
      if (target) observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);

  function toggleTheme() {
    const nextValue = !darkMode;
    setDarkMode(nextValue);
    localStorage.setItem("bb_theme", nextValue ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextValue);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-coffee text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#home" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500 text-xl shadow-inner">
            ☕
          </span>
          <span className="logo-font text-3xl font-bold tracking-tight">Bean Bliss</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const isActive = activeId === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition hover:text-amber-400 ${
                  isActive ? "text-amber-400" : "text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-full border border-white/20 px-3 py-2 text-sm transition hover:border-white/40 hover:bg-white/10"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <a
            href="#contact"
            className="hidden rounded-full bg-amber-500 px-5 py-2.5 font-semibold text-coffee transition hover:bg-amber-400 md:inline-block"
          >
            Order
          </a>
          <button
            type="button"
            className="text-2xl md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`border-t border-white/10 bg-[#332727] md:hidden ${mobileOpen ? "block" : "hidden"}`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-lg font-medium hover:text-amber-400"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
