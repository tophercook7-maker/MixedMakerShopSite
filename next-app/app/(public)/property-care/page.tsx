import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Property Care by Fresh Cut Property Care | MixedMakerShop",
  description:
    "Fresh Cut Property Care is the dedicated lawn and property-care service connected with MixedMakerShop, serving Hot Springs, Lonsdale, and surrounding Arkansas communities.",
};

const shell = publicShellClass;
const freshCutHome = "https://freshcutpropertycare.com/";
const freshCutContact = "https://freshcutpropertycare.com/contact/";

const services = [
  {
    title: "Lawn Mowing",
    body: "Routine cuts, trimming, edging, and cleanup for yards that need to stay presentable.",
  },
  {
    title: "Yard Cleanup",
    body: "Overgrowth, rough spots, neglected areas, and general outdoor cleanup.",
  },
  {
    title: "Brush Clearing",
    body: "Help getting messy areas under control around homes, rentals, and properties.",
  },
  {
    title: "Pressure Washing",
    body: "Driveways, sidewalks, fences, and outdoor surfaces that need a cleaner look.",
  },
  {
    title: "Light Hauling",
    body: "Small yard debris and cleanup material from outdoor property jobs.",
  },
] as const;

export default function PropertyCarePage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY, "grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center")}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl border-emerald-300/20 bg-gradient-to-br from-emerald-500/12 via-white/8 to-orange-400/8">
              <p className={mmsSectionEyebrowOnGlass}>Property Care</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
                Property Care by Fresh Cut Property Care
              </h1>
              <p className={cn("mt-6 text-lg font-semibold leading-relaxed md:text-2xl", mmsOnGlassPrimary)}>
                Lawn care, yard cleanup, brush clearing, pressure washing, and outdoor help in Hot Springs &amp; Lonsdale,
                Arkansas.
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Fresh Cut Property Care is the dedicated lawn and property-care side connected with MixedMakerShop. If
                you need mowing, trimming, yard cleanup, brush clearing, light hauling, driveway cleaning, or general
                outdoor help, Fresh Cut is the place to start.
              </p>
              <PublicCtaRow className="mt-9">
                <a
                  href={freshCutHome}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(mmsBtnPrimary, "w-full px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Visit Fresh Cut Property Care
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </a>
                <a
                  href={freshCutContact}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(mmsBtnSecondaryOnGlass, "w-full px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Request a Free Estimate
                </a>
              </PublicCtaRow>
            </div>

            <div className="public-glass-box--soft overflow-hidden rounded-[2rem] border-emerald-300/15 bg-white/8 shadow-2xl shadow-black/35">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/showcase/freshcut-property-care.jpg"
                  alt="Fresh Cut Property Care example work"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/90">Fresh Cut</p>
                  <p className="mt-2 text-xl font-bold text-white">Dedicated property-care brand</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>What Fresh Cut Helps With</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>Outdoor work belongs on the focused Fresh Cut path.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
              {services.map((service) => (
                <article key={service.title} className="public-glass-box--soft public-glass-box--pad border-emerald-300/12">
                  <h3 className="text-xl font-bold tracking-tight text-white">{service.title}</h3>
                  <p className={cn("mt-4 text-base leading-relaxed", mmsOnGlassSecondary)}>{service.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad mt-8 max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Why This Lives Under MixedMakerShop</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>MixedMakerShop is the umbrella. Fresh Cut is the focused service.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                MixedMakerShop is the umbrella for practical builds and useful services. Fresh Cut Property Care is the
                dedicated outdoor/property-care side, with its own focused website for lawn care estimates, service
                details, and local property requests.
              </p>
            </div>
          </div>
        </section>

        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl border-emerald-300/20 bg-gradient-to-br from-emerald-500/12 via-white/8 to-orange-400/8">
              <p className={mmsSectionEyebrowOnGlass}>Go Straight to Fresh Cut</p>
              <h2 className={cn(mmsH2OnGlass, "mt-4")}>For the fastest property-care help, start there.</h2>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                For the fastest property-care help, visit Fresh Cut Property Care directly and request a free estimate.
                You can call, text, or send details about the job from there.
              </p>
              <PublicCtaRow className="mt-9">
                <a
                  href={freshCutHome}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(mmsBtnPrimary, "w-full px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Visit Fresh Cut Property Care
                </a>
                <a
                  href={freshCutContact}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(mmsBtnSecondaryOnGlass, "w-full px-8 no-underline hover:no-underline sm:w-auto")}
                >
                  Request Estimate
                </a>
              </PublicCtaRow>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
