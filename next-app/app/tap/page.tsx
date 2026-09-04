import type { Metadata } from "next";
import { Mail, Globe, ExternalLink, Star } from "lucide-react";
import {
  publicShellClass,
  publicTopherEmail,
  publicTopherCellDisplay,
  publicTopherCellTel,
  publicTopherCellTextHref,
  publicGoogleReviewHref,
} from "@/lib/public-brand";
import { mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
import { WHAT_I_DO } from "@/lib/what-i-do";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/tap";

export const metadata: Metadata = {
  title: "Tap Card",
  description:
    "Topher Cook, MixedMakerShop, Hot Springs AR. Websites, AI and automation, in-home computer help, 3D printing, family-history research. Call, text, or save the contact.",
  alternates: { canonical },
  robots: { index: false, follow: true },
};

export const viewport = {
  themeColor: "#0f1115",
};

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/90">MixedMakerShop</p>
            <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-white sm:text-[1.65rem]">
              Topher Cook &mdash; one guy, a lot of skills.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/80">
              Websites, AI &amp; automation, in-home computer help, 3D printing, family history &mdash; Hot Springs,
              Arkansas, since 2000.
            </p>
          </header>

          <section aria-label="Call, text, and save contact">
            <h2 className="sr-only">Call, text, or save contact</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                <a href={publicTopherCellTel} className={primaryBtn}>
                  Call {publicTopherCellDisplay}
                </a>
                <a href={publicTopherCellTextHref} className={ghostBtn}>
                  Text {publicTopherCellDisplay}
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

          <section aria-labelledby="tap-services-heading">
            <h2
              id="tap-services-heading"
              className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 drop-shadow-sm"
            >
              What I do
            </h2>
            <div className="flex flex-col gap-3">
              {WHAT_I_DO.map((cat) => (
                <a
                  key={cat.slug}
                  href={cat.href}
                  className={cn(cardClass, "block transition hover:border-teal-400/40 hover:bg-black/50")}
                >
                  <h3 className="text-base font-bold text-white">{cat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{cat.lead}</p>
                  {cat.price ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal-200/90">{cat.price}</p>
                  ) : null}
                </a>
              ))}
            </div>
          </section>

          <section aria-label="Website, email, and social">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 drop-shadow-sm">
              Links
            </h2>
            <div className="flex flex-col gap-3">
              <a href="/" className={cn(primaryBtn, "justify-center")}>
                <Globe className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                mixedmakershop.com
              </a>
              <a href="/pricing" className={cn(ghostBtn, "justify-center")}>
                Pricing &amp; packages
              </a>
              <a href={`mailto:${publicTopherEmail}`} className={cn(ghostBtn, "justify-center")}>
                <Mail className="h-5 w-5 shrink-0 text-teal-200/90" aria-hidden />
                Email {publicTopherEmail}
              </a>
              <a
                href={publicGoogleReviewHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(ghostBtn, "justify-center border-amber-300/40")}
              >
                <Star className="h-5 w-5 shrink-0 text-amber-300" aria-hidden />
                Leave a Google review
                <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
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

          <section className={cn(cardClass, "border-teal-400/25 bg-teal-950/35")} aria-labelledby="tap-pricing-heading">
            <h2 id="tap-pricing-heading" className="text-sm font-bold text-teal-100">
              How pricing works
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              You get the number before any work starts. Websites come with a free preview first, 3D prints are quoted
              before they print, and family-tree research is priced by how deep you want to go. Details are on the{" "}
              <a
                href="/pricing"
                className="font-semibold text-teal-200 underline decoration-teal-500/40 underline-offset-4 hover:text-white"
              >
                pricing page
              </a>
              .
            </p>
          </section>

          <footer className={cn(cardClass, "text-center")}>
            <p className="text-sm font-semibold text-white">Ready when you are</p>
            <p className="mt-2 text-sm text-white/75">
              Call or text and we&apos;ll line up next steps. The person you reach is the person doing the work.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href={publicTopherCellTel} className={cn(primaryBtn, "sm:w-auto sm:min-w-[11rem]", "sm:flex-initial")}>
                Call now
              </a>
              <a href={publicTopherCellTextHref} className={cn(ghostBtn, "sm:w-auto sm:min-w-[11rem]", "sm:flex-initial")}>
                Text now
              </a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
