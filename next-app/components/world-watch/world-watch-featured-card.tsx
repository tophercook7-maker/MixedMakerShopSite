import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { WorldWatchItemDisplay } from "@/lib/worldWatch/types";
import { WorldWatchCategoryBadge } from "./world-watch-category-badge";
import { WorldWatchScriptureBlock } from "./world-watch-scripture-block";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function WorldWatchFeaturedCard({
  item,
  teaserVisual = false,
}: {
  item: WorldWatchItemDisplay;
  /** Soft fade at bottom of summary for guests */
  teaserVisual?: boolean;
}) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-[#060a10] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8 md:p-10"
      aria-labelledby={`world-watch-featured-${item.id}-title`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.06),transparent_50%)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_minmax(0,280px)] lg:gap-10">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <WorldWatchCategoryBadge category={item.category} />
            {item.region ? (
              <span className="text-xs text-slate-500">{item.region}</span>
            ) : null}
          </div>
          <h2
            id={`world-watch-featured-${item.id}-title`}
            className="text-2xl font-semibold leading-snug tracking-tight text-slate-100 md:text-3xl md:leading-tight"
          >
            {item.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="text-slate-400">{item.source_name}</span>
            <span className="text-slate-600" aria-hidden>
              ·
            </span>
            <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
          </div>
          {teaserVisual ? (
            <div className="relative max-h-[9.5rem] overflow-hidden">
              <p className="text-base leading-relaxed text-slate-300">{item.summary}</p>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#060a10] via-[#060a10]/90 to-transparent"
                aria-hidden
              />
            </div>
          ) : (
            <p className="text-base leading-relaxed text-slate-300">{item.summary}</p>
          )}
          {item.reflection?.trim() ? (
            <p className="text-base leading-relaxed text-slate-400">{item.reflection}</p>
          ) : null}
          <WorldWatchScriptureBlock
            reference={item.scripture_reference}
            text={item.scripture_text}
          />
          <div className="pt-1">
            <Link
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-teal-200/95 transition hover:border-teal-400/25 hover:bg-teal-400/10 hover:text-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/35"
            >
              Read source
              <ExternalLink className="h-3.5 w-3.5 opacity-70 transition group-hover:opacity-100" aria-hidden />
            </Link>
          </div>
        </div>
        {item.image_url ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 lg:aspect-auto lg:min-h-[220px]">
            <Image
              src={item.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 280px"
            />
          </div>
        ) : (
          <div className="hidden min-h-[120px] rounded-xl border border-white/[0.06] bg-slate-950/80 lg:block" aria-hidden />
        )}
      </div>
    </article>
  );
}
