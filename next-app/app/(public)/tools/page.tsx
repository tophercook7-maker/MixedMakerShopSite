import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsBulletOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsOnGlassMuted,
  mmsSectionEyebrowOnGlass,
  mmsTextLinkOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdrop,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const buildCategories = [
  "Lead capture tools",
  "Quote and request forms",
  "Booking helpers",
  "Internal dashboards",
  "Client portals",
  "Chat and help bots",
  "Follow-up helpers",
  "Small workflow automations",
] as const;

const outcomes = [
  "Save time on repetitive tasks",
  "Keep leads and follow-up organized",
  "Make it easier for customers to take action",
  "Reduce friction in day-to-day operations",
] as const;

const goodFor = [
  "Local service businesses that rely on calls and form leads",
  "Small business owners who need simpler systems, not more software sprawl",
  "Teams that juggle bookings, follow-up, and customer communication",
] as const;

export const metadata: Metadata = {
  title: "Apps & Tools | MixedMakerShop",
  description:
    "Practical apps, tools, bots, and lightweight business systems built for real businesses. Designed to save time, support leads, and improve operations.",
};

export default function ToolsPage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#2f3e34]">
      <FixedHeroMedia />

      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Apps &amp; Tools</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Apps, tools, and business systems built to make work easier.
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Beyond websites, I build lightweight practical tools for real businesses. These can run on phone or
                computer and help with leads, follow-up, quoting, organization, and automation.
              </p>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                Built to solve day-to-day friction, not to add another bloated system.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>What can be built</h2>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                Compact tools that support how your business already works.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {buildCategories.map((item) => (
                <div key={item} className="public-glass-box--soft public-glass-box--pad">
                  <p className={cn("text-base leading-relaxed md:text-[17px]", mmsOnGlassPrimary)}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>Why this matters</h2>
              <ul className={cn("mt-5 space-y-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                {outcomes.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className={mmsBulletOnGlass} aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className={cn("mt-6 text-sm leading-relaxed md:text-[15px]", mmsOnGlassMuted)}>
                Tools support what happens after attention shows up. For promo angles and ad concepts, see{" "}
                <Link href="/ad-lab" className={mmsTextLinkOnGlass}>
                  Ad Lab
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdrop}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box--soft public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>Who this is good for</h2>
              <ul className={cn("mt-5 space-y-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                {goodFor.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className={mmsBulletOnGlass} aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={cn(mmsUmbrellaSectionBackdrop, "border-b-0")}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <h2 className={mmsH2OnGlass}>Need something custom?</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Tell me what you wish your business could do faster. I&apos;ll help you map a practical tool or system
                that fits your workflow.
              </p>
              <PublicCtaRow className="mt-9">
                <TrackedPublicLink
                  href="/contact"
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "apps_tools_page", target: "contact" }}
                  className={cn(
                    mmsBtnPrimary,
                    "inline-flex min-h-[3rem] items-center justify-center gap-2 px-8 no-underline hover:no-underline",
                  )}
                >
                  Tell me what you need
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </TrackedPublicLink>
                <TrackedPublicLink
                  href={publicFreeMockupFunnelHref}
                  eventName="public_contact_cta_click"
                  eventProps={{ location: "apps_tools_page", target: "free_mockup" }}
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "inline-flex min-h-[3rem] items-center justify-center px-8 no-underline hover:no-underline",
                  )}
                >
                  Start with a free preview
                </TrackedPublicLink>
              </PublicCtaRow>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
