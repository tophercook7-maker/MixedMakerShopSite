"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "main .section .section-heading",
  "main .section .transformations-subhead",
  "main .section .how-it-works-card",
  "main .section .card",
  "main .section .panel",
  "main .section .sample-card",
  "main .section .transformation-card",
  "main .section .testimonial-card",
  "main .section .roast-promo-card",
  "main .section .website-score-card",
  "main .sample-standalone .sample-section",
  "main .offer-page .offer-section-title",
  "main .offer-page .offer-reveal-line",
  "main .offer-page .offer-card",
  "main .home-premium .home-reveal",
  /* Homepage hero must stay visible on first paint — never hide it behind scroll-reveal */
  "main .home-page--immersive .home-gateway-pop:not(.home-gateway-pop--hero)",
  "main .web-design-page--immersive .price-card",
  "main .web-design-page--immersive .wd-cta-panel",
  "main .web-design-page--immersive .wd-lead",
  "main .web-design-page--immersive .wd-punch",
  "main .web-design-page--immersive .wd-monthly-body",
  "main .web-design-page--immersive .wd-scan-list",
  "main .web-design-page--immersive .web-design-pricing-intro",
  "main .web-design-page--immersive .hero .hero-copy > *",
].join(", ");

function assignStaggerDelays(nodes: HTMLElement[]) {
  const byScope = new Map<Element, HTMLElement[]>();
  for (const el of nodes) {
    const scope =
      el.closest(".section") ??
      el.closest(".sample-section") ??
      el.closest(".home-band") ??
      el.closest(".wd-motion-scope") ??
      el.closest(".home-gateway-motion-scope");
    if (!scope) continue;
    if (!byScope.has(scope)) byScope.set(scope, []);
    byScope.get(scope)!.push(el);
  }
  Array.from(byScope.entries()).forEach(([scope, list]) => {
    const step =
      scope instanceof HTMLElement &&
      scope.classList.contains("home-band--hero")
        ? 0.11
        : scope instanceof HTMLElement &&
            scope.classList.contains("wd-motion-scope")
          ? 0.09
          : scope instanceof HTMLElement &&
              scope.classList.contains("home-gateway-motion-scope")
            ? 0.085
            : 0.07;
    list.forEach((el: HTMLElement, i: number) => {
      el.style.setProperty("--motion-delay", `${Math.min(i, 14) * step}s`);
    });
  });
}

export function PublicMotionInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const found = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    ).filter((el) => {
      if (!el.classList.contains("panel")) return true;
      return !el.querySelector(".price-card");
    });
    if (!found.length) return;

    assignStaggerDelays(found);
    found.forEach((el) => el.classList.add("motion-reveal-target"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    found.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
