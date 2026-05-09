import { ArrowRight } from "lucide-react";
import { sampleSiteMailtoHref, topherWebDesignSampleSites } from "@/lib/topher-web-design-samples";
import {
  mmsBtnSecondaryOnGlass,
  mmsH3OnGlass,
  mmsOnGlassSecondary,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const tapSampleCard =
  "flex min-h-[12rem] flex-col rounded-xl border border-white/12 bg-black/35 p-4 shadow-lg shadow-black/20 backdrop-blur-md";

const tapAskCta = cn(
  "mt-auto inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-xl",
  "border border-white/25 bg-black/35 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-black/20 backdrop-blur-md",
  "transition hover:bg-black/45 active:scale-[0.99]",
);

type Props = {
  contactEmail: string;
  variant: "tap" | "umbrella";
};

export function TopherWebDesignSampleSitesGrid({ contactEmail, variant }: Props) {
  return (
    <div className={cn(variant === "tap" ? "flex flex-col gap-3" : "grid gap-5 sm:grid-cols-2")}>
      {topherWebDesignSampleSites.map((site) => (
        <article
          key={site.title}
          className={variant === "tap" ? tapSampleCard : "public-glass-box--soft public-glass-box--pad flex min-h-[13rem] flex-col"}
        >
          {variant === "tap" ? (
            <h4 className="text-sm font-bold text-white">{site.title}</h4>
          ) : (
            <h3 className={cn(mmsH3OnGlass, "!text-[1.05rem] md:!text-lg")}>{site.title}</h3>
          )}
          <p
            className={cn(
              "mt-3 flex-1 text-sm leading-relaxed",
              variant === "tap" ? "text-white/80" : cn("md:text-[15px]", mmsOnGlassSecondary),
            )}
          >
            {site.description}
          </p>
          <a
            href={sampleSiteMailtoHref(contactEmail, site.inquireSubject)}
            className={variant === "tap" ? cn(tapAskCta, "no-underline hover:no-underline") : cn(mmsBtnSecondaryOnGlass, "mt-5 no-underline hover:no-underline")}
          >
            Ask about this
            <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          </a>
        </article>
      ))}
    </div>
  );
}
