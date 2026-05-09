import type { Metadata } from "next";
import { Mail, Globe, ExternalLink } from "lucide-react";
import { TopherWebDesignSampleSitesGrid } from "@/components/public/TopherWebDesignSampleSitesGrid";
import { publicShellClass, publicTopherEmail } from "@/lib/public-brand";
import { mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import { cn } from "@/lib/utils";

const canonical = "https://mixedmakershop.com/tap";

export const metadata: Metadata = {
  title: "Mixed Maker Shop | Tap Card",
  description:
    "Mixed Maker Shop umbrella studio — Topher's Web Design for websites & web systems, GiGi's Print Shop for 3D printing. Contact Mixed Maker Shop in Hot Springs, AR.",
  alternates: { canonical },
};

export const viewport = {
  themeColor: "#0f1115",
};

const phoneDisplay = "501-575-8017";
const phoneTel = "5015758017";

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
              Creative studio under one umbrella — web design, web systems, and custom 3D printing.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/80">
              Local builder · Hot Springs area · Topher&apos;s Web Design + GiGi&apos;s Print Shop
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

          <section aria-labelledby="tap-twd-heading">
            <h2 id="tap-twd-heading" className="sr-only">
              Topher&apos;s Web Design
            </h2>
            <article
              className={cn(cardClass, "border-teal-400/35 bg-teal-950/30")}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200/90">Topher&apos;s Web Design</p>
              <h3 className="mt-3 text-xl font-bold text-white">The web design &amp; web systems branch</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Mixed Maker Shop is the umbrella studio. Topher&apos;s Web Design is the dedicated web-design side
                — focused on 3–5 page websites, informational sites, web systems, and helpful online tools.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Topher&apos;s Web Design handles informational sites, forms, dashboards, CRM-style tools, and useful
                online workflows — all as part of the same builder you reach through Mixed Maker Shop.
              </p>
              <a
                href={TOPHER_WEB_DESIGN_URL}
                className={cn(primaryBtn, "mt-5 justify-center")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit topherswebdesign.com
                <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </a>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-white/90">Sample Sites / Examples</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70">
                  Shapes of projects — no client names, no portfolio screenshots. Tap a line to ask by email.
                </p>
                <div className="mt-4">
                  <TopherWebDesignSampleSitesGrid contactEmail={publicTopherEmail} variant="tap" />
                </div>
              </div>
            </article>
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
              <a href={`mailto:${publicTopherEmail}`} className={cn(ghostBtn, "justify-center")}>
                <Mail className="h-5 w-5 shrink-0 text-teal-200/90" aria-hidden />
                Email {publicTopherEmail}
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
                <h3 className="text-lg font-bold text-white">Mixed Maker Shop · Umbrella</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  The studio that brings web design, web systems, and custom 3D printing together — one contact, clear
                  paths, practical help without the fluff.
                </p>
              </article>
              <article className={cardClass}>
                <h3 className="text-lg font-bold text-white">Topher&apos;s Web Design</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  The dedicated web branch: 3–5 page websites, informational sites, web systems, forms, dashboards,
                  CRM-style tools, and workflows. Visit{" "}
                  <a
                    href={TOPHER_WEB_DESIGN_URL}
                    className="font-semibold text-teal-200 underline decoration-teal-500/40 underline-offset-4 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    topherswebdesign.com
                  </a>{" "}
                  for the web-focused site, or see Sample Sites above.
                </p>
              </article>
              <article className={cardClass}>
                <h3 className="text-lg font-bold text-white">3D Printing · GiGi&apos;s side</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Useful and fun prints — keychains, bookmarks, shelf pieces, tools, fidget toys, cosplay-style swords,
                  and everyday custom items.
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
