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
].join(", ");

function assignStaggerDelays(nodes: HTMLElement[]) {
  const byScope = new Map<Element, HTMLElement[]>();
  for (const el of nodes) {
    const scope = el.closest(".section") ?? el.closest(".sample-section");
    if (!scope) continue;
    if (!byScope.has(scope)) byScope.set(scope, []);
    byScope.get(scope)!.push(el);
  }
  for (const list of Array.from(byScope.values())) {
    list.forEach((el: HTMLElement, i: number) => {
      el.style.setProperty("--motion-delay", `${Math.min(i, 14) * 0.07}s`);
    });
  }
}

export function PublicMotionInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const found = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
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
