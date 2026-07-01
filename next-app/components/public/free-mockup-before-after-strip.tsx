import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { LIVE_WEB_PROJECTS } from "@/lib/live-web-projects";
import { publicFreeMockupFunnelHrefFreshCut, publicShellClass } from "@/lib/public-brand";
import { mmsBtnSecondaryOnGlass, mmsOnGlassSecondary, mmsSectionEyebrowOnGlass } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

const freshCut = LIVE_WEB_PROJECTS.find((p) => p.analyticsId === "fresh_cut_property_care");

const beforePoints = [
  "Visitors aren't sure what you do in the first few seconds",
  "Contact info is buried or the mobile layout feels neglected",
  "The site looks dated — trust drops before they call",
] as const;

const afterPoints = [
  "Clear headline and services above the fold",
  "Obvious call or estimate path on every screen size",
  "Professional layout that matches how you show up in person",
] as const;

export function FreeMockupBeforeAfterStrip() {
  if (!freshCut) return null;

  return (
    <section className="free-mockup-before-after" aria-labelledby="free-mockup-before-after-heading">
      <div className={cn(shell, "free-mockup-before-after-inner")}>
        <div className="free-mockup-before-after-intro">
          <p className={mmsSectionEyebrowOnGlass}>Real example</p>
          <h2 id="free-mockup-before-after-heading" className="free-mockup-before-after-title">
            What a stronger direction actually looks like
          </h2>
          <p className={cn("free-mockup-before-after-lead", mmsOnGlassSecondary)}>
            This is the kind of shift the preview is built around — clarity, trust, and an obvious next step. Fresh Cut
            Property Care is a real local business site built the same way.
          </p>
        </div>

        <div className="free-mockup-before-after-grid">
          <div className="free-mockup-before-after-panel public-glass-box--soft public-glass-box--pad">
            <p className="free-mockup-before-after-label free-mockup-before-after-label--before">Before</p>
            <ul className="free-mockup-before-after-list">
              {beforePoints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="free-mockup-before-after-mock" aria-hidden>
              <div className="free-mockup-before-after-mock-bar free-mockup-before-after-mock-bar--lg" />
              <div className="free-mockup-before-after-mock-bar" />
              <div className="free-mockup-before-after-mock-bar free-mockup-before-after-mock-bar--sm" />
              <div className="free-mockup-before-after-mock-grid">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="free-mockup-before-after-panel free-mockup-before-after-panel--after public-glass-box--soft public-glass-box--pad">
            <p className="free-mockup-before-after-label free-mockup-before-after-label--after">After</p>
            <ul className="free-mockup-before-after-list free-mockup-before-after-list--after">
              {afterPoints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="free-mockup-before-after-shot">
              <Image
                src={freshCut.previewSrc}
                alt={freshCut.previewAlt}
                width={640}
                height={400}
                className="free-mockup-before-after-image"
                sizes="(max-width: 768px) 100vw, 420px"
              />
              <p className="free-mockup-before-after-caption">
                {freshCut.title} · {freshCut.hostname}
              </p>
            </div>
          </div>
        </div>

        <div className="free-mockup-before-after-cta">
          <TrackedPublicLink
            href={publicFreeMockupFunnelHrefFreshCut}
            eventName="public_free_mockup_funnel_cta"
            eventProps={{ location: "free_mockup_before_after", target: "freshcut_funnel" }}
            className={cn(mmsBtnSecondaryOnGlass, "inline-flex px-6 no-underline hover:no-underline")}
          >
            Try the Fresh Cut pattern
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </TrackedPublicLink>
          <Link href="/proof/fresh-cut-property-care" className="free-mockup-before-after-proof">
            Read the full case study →
          </Link>
        </div>
      </div>
    </section>
  );
}
