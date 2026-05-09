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
          <p className={mmsSectionEyebrowOnGlass}>Topher&apos;s Web Design</p>
          <h2 className={cn(mmsH2OnGlass, "mt-4")}>The web design &amp; web systems branch</h2>
          <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
            Mixed Maker Shop is the umbrella studio. Topher&apos;s Web Design is the dedicated web-design side
            — focused on 3–5 page websites, informational sites, web systems, and helpful online tools.
          </p>
          <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
            Templates, kits, and other Mixed Maker Shop tools still live here too — this site is the home base for
            everything under the umbrella.
          </p>
          <a
            href={TOPHER_WEB_DESIGN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              mmsBtnPrimary,
              "mt-7 inline-flex w-full items-center justify-center gap-2 px-8 no-underline hover:no-underline sm:w-auto",
            )}
          >
            Visit topherswebdesign.com
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          </a>
        </div>

        <div className={cn("max-w-3xl", mmsHomeGlassStackGap)}>
          <h3 className={cn(mmsH3OnGlass, "!text-xl md:!text-2xl")}>Sample Sites / Examples</h3>
          <p className={cn("mt-3 text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
            Starting points for the kind of builds Topher&apos;s Web Design handles — no client names, just clear
            shapes of projects.
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
