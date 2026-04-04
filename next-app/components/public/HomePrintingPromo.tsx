import Image from "next/image";
import Link from "next/link";
import { Printer } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { PRINTING_HERO_WORKSTATION_IMAGE } from "@/components/printing/printing-assets";
import { publicShellClass, publicBodyMutedClass } from "@/lib/public-brand";

const shell = publicShellClass;
const body = publicBodyMutedClass;
const sectionY = "py-20 md:py-28";

/**
 * Cross-link from the web-design homepage to the 3D printing funnel — uses the real Bambu fleet photo.
 */
export function HomePrintingPromo() {
  return (
    <section
      id="3d-printing-promo"
      className="home-band home-band--deep border-y border-[rgba(232,253,245,0.06)]"
      aria-labelledby="home-printing-promo-heading"
    >
      <div className={`${shell} ${sectionY}`}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,1fr)] lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="home-reveal flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#e09a5a]">
              <Printer className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Also from MixedMakerShop
            </p>
            <h2
              id="home-printing-promo-heading"
              className="home-reveal mt-4 text-3xl font-semibold tracking-tight text-[#E8FDF5] md:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
            >
              Professional 3D printing — Bambu Lab print farm
            </h2>
            <p className={`home-reveal mt-6 max-w-xl ${body} text-base md:text-[17px] leading-relaxed`}>
              Triple-monitor workflow behind{" "}
              <span className="text-[#E8FDF5]/90 font-medium">
                one A1 + AMS Lite and two P1S + AMS Pro
              </span>{" "}
              enclosures. Custom PLA work for replacement parts, tools, mounts, and prototypes — right here in Hot
              Springs.
            </p>
            <div className="home-reveal mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedPublicLink
                href="/3d-printing"
                eventName="public_gateway_nav"
                eventProps={{ target: "3d_printing", location: "home_printing_promo" }}
                className="home-btn-primary home-btn-primary--hero inline-flex justify-center sm:w-auto"
              >
                Explore 3D printing services
              </TrackedPublicLink>
              <Link
                href="/upload-print"
                className="home-btn-secondary--hero inline-flex justify-center sm:w-auto text-center"
              >
                Upload a print file
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <TrackedPublicLink
              href="/3d-printing"
              eventName="public_gateway_nav"
              eventProps={{ target: "3d_printing", location: "home_printing_promo_visual" }}
              className="home-reveal group relative block overflow-hidden rounded-2xl border border-[rgba(232,149,92,0.22)] shadow-[0_24px_70px_rgba(0,0,0,0.35)] ring-1 ring-[rgba(0,255,178,0.08)]"
            >
              <div className="relative aspect-[4/3] w-full bg-[#0b0f0e]">
                <Image
                  src={PRINTING_HERO_WORKSTATION_IMAGE}
                  alt="MixedMakerShop 3D printing workstation with three monitors and Bambu Lab printers with AMS in the background"
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F0E]/90 via-transparent to-[#0B0F0E]/40" />
                <p className="pointer-events-none absolute bottom-4 left-4 right-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#e09a5a]/95">
                  A1 + AMS Lite · 2× P1S + AMS Pro
                </p>
              </div>
            </TrackedPublicLink>
          </div>
        </div>
      </div>
    </section>
  );
}
