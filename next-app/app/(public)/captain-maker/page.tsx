import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CaptainMakerGuide } from "@/components/public/CaptainMakerGuide";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { publicFreeMockupFunnelHref, publicShellClass } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";
import {
  mmsH2OnGlass,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = `${SITE_URL}/captain-maker`;

export const metadata: Metadata = {
  title: "Captain Maker | MixedMakerShop",
  description:
    "Meet Captain Maker — MixedMakerShop's friendly AI helper for quick project estimates. Get pointed toward a free website mockup, web estimate, 3D print request, or your next idea.",
  alternates: { canonical },
  openGraph: {
    title: "Captain Maker | MixedMakerShop",
    description:
      "Not sure what you need? Captain Maker helps you pick the right path — website mockup, estimate, 3D printing, or a general project idea.",
    url: canonical,
  },
};

const startingPaths = [
  {
    title: "Free website mockup",
    body: "See a homepage direction before you spend — no contract required.",
    href: publicFreeMockupFunnelHref,
  },
  {
    title: "Website estimate",
    body: "Landing pages, full sites, local SEO, and add-ons like AI helpers.",
    href: "/pricing",
  },
  {
    title: "3D print request",
    body: "Custom prints, keychains, bookmarks, and promo gear from GiGi's Print Shop.",
    href: "/custom-3d-printing",
  },
  {
    title: "General project idea",
    body: "Flyers, tools, automation, or something you are still figuring out.",
    href: "/contact",
  },
] as const;

export default function CaptainMakerPage() {
  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(publicShellClass, mmsSectionY, "pb-16 md:pb-24")}>
            <div className="public-glass-box public-glass-box--pad mx-auto max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>MixedMakerShop</p>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Meet Captain Maker
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Get a quick project estimate from our friendly AI helper. Tell the Captain what you are trying to build,
                fix, or promote — and he will point you to the right next step.
              </p>
              <p className={cn("mt-4 text-sm leading-relaxed", mmsOnGlassSecondary)}>
                Prefer the main web design path first?{" "}
                <Link href={publicFreeMockupFunnelHref} className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  Start with a free homepage mockup
                </Link>{" "}
                — Captain Maker is here when you are not sure which service fits.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <h2 className={cn(mmsH2OnGlass, "sm:col-span-2 text-2xl md:text-3xl")}>Common starting paths</h2>
              {startingPaths.map((path) => (
                <Link
                  key={path.href}
                  href={path.href}
                  className="public-glass-box--soft public-glass-box--pad flex h-full flex-col border border-white/10 no-underline transition hover:border-white/20 hover:no-underline"
                >
                  <h3 className="text-lg font-bold text-white">{path.title}</h3>
                  <p className={cn("mt-3 flex-1 text-sm leading-relaxed", mmsOnGlassSecondary)}>{path.body}</p>
                  <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#f0c49a]">
                    Open path
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </p>
                </Link>
              ))}
            </div>

            <div id="captain-maker" className="scroll-mt-28 mt-12 md:mt-16">
              <CaptainMakerGuide />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
