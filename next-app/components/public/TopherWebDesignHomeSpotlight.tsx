import { ExternalLink } from "lucide-react";
import { TopherWebDesignSampleSitesGrid } from "@/components/public/TopherWebDesignSampleSitesGrid";
import { publicShellClass, publicTopherEmail } from "@/lib/public-brand";
import { TOPHER_WEB_DESIGN_URL } from "@/lib/topher-web-design-samples";
import {
  mmsBtnPrimary,
  mmsH2OnGlass,
  mmsH3OnGlass,
  mmsHomeGlassStackGap,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsUmbrellaSectionBackdrop,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const homeBackdrop = mmsUmbrellaSectionBackdrop;
const shell = publicShellClass;

export function TopherWebDesignHomeSpotlight() {
  return (
    <section className={cn(homeBackdrop)} id="tophers-web-design">
      <div className={cn(shell, mmsSectionY)}>
        <div
          className={cn(
            "public-glass-box public-glass-box--pad max-w-3xl border border-emerald-700/25 bg-emerald-950/10",
          )}
        >
          <p className={mmsSectionEyebrowOnGlass}>Websites &amp; tools · Topher&apos;s Web Design</p>
          <h2 className={cn(mmsH2OnGlass, "mt-4")}>
            Need a website for your business?
          </h2>
          <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
            Topher&apos;s Web Design builds clean, mobile-friendly websites, redesigns, landing pages, and local SEO
            foundations for small businesses.
          </p>
          <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
            MixedMakerShop is the umbrella studio — when you are ready to focus on web work, the dedicated service brand
            is{" "}
            <a
              href={TOPHER_WEB_DESIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={mmsTextLinkOnGlass}
            >
              Topher&apos;s Web Design small business website services
            </a>
            .
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={TOPHER_WEB_DESIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                mmsBtnPrimary,
                "inline-flex w-full items-center justify-center gap-2 px-8 no-underline hover:no-underline sm:w-auto",
              )}
            >
              Get a free website demo
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </a>
            <a
              href={TOPHER_WEB_DESIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(mmsTextLinkOnGlass, "inline-flex justify-center text-sm sm:justify-start")}
            >
              Visit topherswebdesign.com for demos &amp; local web design details
            </a>
          </div>
        </div>

        <div className={cn("max-w-3xl", mmsHomeGlassStackGap)}>
          <h3 className={cn(mmsH3OnGlass, "!text-xl md:!text-2xl")}>Sample Sites / Examples</h3>
          <p className={cn("mt-3 text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
            Starting points for the kind of builds{" "}
            <a href={TOPHER_WEB_DESIGN_URL} target="_blank" rel="noopener noreferrer" className={mmsTextLinkOnGlass}>
              Topher&apos;s Web Design
            </a>{" "}
            handles — no client names, just clear shapes of projects.
          </p>
        </div>
        <div className={cn("max-w-5xl", mmsHomeGlassStackGap)}>
          <TopherWebDesignSampleSitesGrid contactEmail={publicTopherEmail} variant="umbrella" />
        </div>
        <p className={cn(mmsHomeGlassStackGap, "max-w-3xl text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
          Questions?{" "}
          <a href={`mailto:${publicTopherEmail}`} className={mmsTextLinkOnGlass}>
            Email Topher
          </a>{" "}
          anytime.
        </p>
      </div>
    </section>
  );
}
