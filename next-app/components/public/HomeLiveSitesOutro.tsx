"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicBodyMutedClass, publicShellClass } from "@/lib/public-brand";
import { trackPublicEvent } from "@/lib/public-analytics";
import { cn } from "@/lib/utils";

const shell = publicShellClass;
const body = publicBodyMutedClass;

/** Closing CTA after featured work — avoids duplicating the live site grid lower on the page. */
export function HomeLiveSitesOutro() {
  return (
    <section
      className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]"
      aria-labelledby="live-sites-outro-heading"
    >
      <div className={cn(shell, "py-16 md:py-20 lg:py-24")}>
        <div className="home-reveal mx-auto max-w-2xl text-center">
          <h2
            id="live-sites-outro-heading"
            className="text-2xl font-semibold tracking-tight text-[#E8FDF5] md:text-3xl"
          >
            Want a website that performs like these?
          </h2>
          <p className={cn("mx-auto mt-4 max-w-lg text-base md:text-[17px]", body)}>
            Web design is what most clients hire MixedMakerShop for. Start with a free preview and we&apos;ll see if
            we&apos;re a fit.
          </p>
          <Link
            href="/free-mockup"
            onClick={() =>
              trackPublicEvent("public_contact_cta_click", {
                location: "web_design",
                target: "free_mockup",
                section: "live_sites_outro",
              })
            }
            className="home-btn-primary home-btn-primary--hero mx-auto mt-8 inline-flex min-h-[52px] w-full max-w-md items-center justify-center gap-2 font-semibold text-[#0c0e0d] no-underline sm:w-auto"
          >
            Get My Free Preview
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
