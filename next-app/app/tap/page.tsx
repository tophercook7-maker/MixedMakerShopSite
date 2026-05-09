import type { Metadata } from "next";
import { Mail, Globe, ExternalLink } from "lucide-react";
import { publicShellClass } from "@/lib/public-brand";
import { mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/tap";

export const metadata: Metadata = {
  title: "Mixed Maker Shop | Tap Card",
  description:
    "Websites, business systems, and 3D printing built under one roof. Contact Mixed Maker Shop in Hot Springs, AR.",
  alternates: { canonical },
};

export const viewport = {
  themeColor: "#0f1115",
};

const phoneDisplay = "501-575-8017";
const phoneTel = "5015758017";
const emailAddress = "topher@mixedmakershop.com";

const primaryBtn =
  "inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-gradient-to-br from-emerald-600/90 to-teal-800/95 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-black/25 transition hover:brightness-110 active:scale-[0.99]";

const ghostBtn =
  "inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-black/35 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-black/20 backdrop-blur-md transition hover:bg-black/45 active:scale-[0.99]";

const socialBtn =
  "inline-flex min-h-[3rem] flex-1 min-w-[8.5rem] flex-nowrap items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm font-semibold text-white/95 shadow-md shadow-black/20 backdrop-blur-md transition hover:bg-black/40";

const cardClass =
  "rounded-2xl border border-white/15 bg-black/40 p-5 shadow-xl shadow-black/30 backdrop-blur-md";

const umbrellaAlt =
  "MixedMakerShop umbrella brand — open umbrella in the rain, canopy and warm interior light.";

export default function TapPage() {
  return (
    <main
      className={cn(
        "relative min-h-[100dvh] text-[#e8f2ef]",
        "selection:bg-teal-500/30 selection:text-white",
      )}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          src={mmsUmbrellaHeroImageSrc}
          alt={umbrellaAlt}
          className={cn(
            "h-full w-full object-cover object-[50%_18%] sm:object-[50%_20%]",
            "[filter:contrast(1.04)_brightness(1.02)]",
          )}
          loading="eager"
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/[0.58]"
          aria-hidden
        />
      </div>

      <div className={cn(publicShellClass, "relative z-10 py-10 pb-16 md:py-14")}>
        <div className="mx-auto flex max-w-lg flex-col gap-8 md:gap-10">
          <header className={cn(cardClass, "text-center")}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/90">Mixed Maker Shop</p>
            <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-white sm:text-[1.65rem]">
              Websites, business systems, and 3D printing built under one roof.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/80">
              Local builder · Hot Springs area · Practical help without the fluff
            </p>
          </header>

          <section aria-label="Call, text, and save contact">
            <h2 className="sr-only">Call, text, or save contact</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                <a href={`tel:${phoneTel}`} className={primaryBtn}>
                  Call {phoneDisplay}
                </a>
                <a href={`sms:${phoneTel}`} className={ghostBtn}>
                  Text {phoneDisplay}
                </a>
              </div>
              <a
                href="/topher-mixed-maker-shop.vcf"
                download="topher-mixed-maker-shop.vcf"
                className={ghostBtn}
              >
                Save Contact
              </a>
            </div>
          </section>

          <section aria-label="Website, email, and social">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 drop-shadow-sm">
              Links
            </h2>
            <div className="flex flex-col gap-3">
              <a
                href="https://mixedmakershop.com"
                className={cn(primaryBtn, "justify-center")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                Visit mixedmakershop.com
                <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              </a>
              <a href={`mailto:${emailAddress}`} className={cn(ghostBtn, "justify-center")}>
                <Mail className="h-5 w-5 shrink-0 text-teal-200/90" aria-hidden />
                Email {emailAddress}
              </a>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.facebook.com/christopher.cook.16/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialBtn}
                >
                  Facebook
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                </a>
                <a
                  href="https://www.instagram.com/mixedmakershop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialBtn}
                >
                  Instagram
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                </a>
                <a
                  href="https://www.linkedin.com/in/chris-cook-8516a943/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialBtn}
                >
                  LinkedIn
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                </a>
              </div>
            </div>
          </section>

          <section aria-labelledby="tap-services-heading">
            <h2 id="tap-services-heading" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 drop-shadow-sm">
              Services
            </h2>
            <div className="flex flex-col gap-4">
              <article className={cardClass}>
                <h3 className="text-lg font-bold text-white">Full Websites</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  3–5 page websites for businesses, organizations, creators, and informational projects.
                </p>
              </article>
              <article className={cardClass}>
                <h3 className="text-lg font-bold text-white">Web Systems</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Forms, dashboards, customer flows, booking/contact paths, CRM-style organization, and useful backend tools.
                </p>
              </article>
              <article className={cardClass}>
                <h3 className="text-lg font-bold text-white">3D Printing</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Useful and fun 3D prints — from keychains, bookmarks, shelf pieces, tools, fidget toys, cosplay-style
                  swords, and custom everyday items.
                </p>
              </article>
            </div>
          </section>

          <section className={cn(cardClass, "border-teal-400/25 bg-teal-950/35")} aria-labelledby="tap-pricing-heading">
            <h2 id="tap-pricing-heading" className="text-sm font-bold text-teal-100">
              Pricing
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Pricing depends on the project. Clear quotes are available after I know what you need. Website pricing and package
              details are on{" "}
              <a
                href="https://mixedmakershop.com"
                className="font-semibold text-teal-200 underline decoration-teal-500/40 underline-offset-4 hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                MixedMakerShop.com
              </a>
              .
            </p>
          </section>

          <footer className={cn(cardClass, "text-center")}>
            <p className="text-sm font-semibold text-white">Ready when you are</p>
            <p className="mt-2 text-sm text-white/75">
              Tap call or text and we&apos;ll line up next steps together.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href={`tel:${phoneTel}`} className={cn(primaryBtn, "sm:w-auto sm:min-w-[11rem]", "sm:flex-initial")}>
                Call now
              </a>
              <a href={`sms:${phoneTel}`} className={cn(ghostBtn, "sm:w-auto sm:min-w-[11rem]", "sm:flex-initial")}>
                Text now
              </a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
