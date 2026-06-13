import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { PartnerOutboundLink } from "@/components/public/PartnerResourceCard";
import { publicShellClass } from "@/lib/public-brand";
import type { PartnerResourceEntry } from "@/lib/partners/registry";
import {
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

export function PartnerResourceDetailView({ partner }: { partner: PartnerResourceEntry }) {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <nav aria-label="Breadcrumb">
              <Link
                href="/resources"
                className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-2 text-sm font-semibold")}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                Resource library
              </Link>
            </nav>

            <div className="public-glass-box public-glass-box--pad mx-auto mt-8 max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Partner resource</p>
              <h1 className={cn(mmsH2OnGlass, "mt-4 text-3xl md:text-4xl")}>{partner.title}</h1>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                {partner.description}
              </p>
              <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                <span className="font-semibold text-white/88">Who it helps:</span> {partner.whoItHelps}
              </p>
            </div>

            <div className="public-glass-box--soft public-glass-box--pad mx-auto mt-10 max-w-3xl">
              <h2 className="text-lg font-bold text-white">How it works</h2>
              <p className={cn("mt-4 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                LendTrack AI is a funding portal — it helps match qualified applicants with investors interested in
                funding the right deal. Mixed Maker Shop does not process funding on this site; you&apos;ll continue on
                LendTrack AI&apos;s partner page when you&apos;re ready to explore options.
              </p>
              <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6">
                <PartnerOutboundLink partner={partner} location={`partner_detail_${partner.slug}`} />
                <p className={cn("text-xs leading-relaxed text-white/50")}>{partner.disclosure}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
