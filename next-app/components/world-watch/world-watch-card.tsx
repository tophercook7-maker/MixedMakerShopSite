import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { WorldWatchItemDisplay } from "@/lib/worldWatch/types";
import { WorldWatchCategoryBadge } from "./world-watch-category-badge";
import { WorldWatchScriptureBlock } from "./world-watch-scripture-block";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function WorldWatchCard({
  item,
  teaserVisual = false,
}: {
  item: WorldWatchItemDisplay;
  teaserVisual?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-slate-950/70 p-5 transition-colors duration-200 hover:border-white/14 hover:bg-slate-950/90">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <WorldWatchCategoryBadge category={item.category} />
        <time className="text-xs text-slate-500" dateTime={item.published_at}>
          {formatDate(item.published_at)}
        </time>
      </div>
      <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-slate-100">
        {item.title}
      </h3>
      <p className="mb-3 text-xs text-slate-500">{item.source_name}</p>
      <div className={teaserVisual ? "relative mb-3 max-h-[4.5rem] overflow-hidden" : "mb-3"}>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">{item.summary}</p>
        {teaserVisual ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#060a10]/95 to-transparent"
            aria-hidden
          />
        ) : null}
      </div>
      {item.reflection?.trim() ? (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-500">{item.reflection}</p>
      ) : null}
      <WorldWatchScriptureBlock
        reference={item.scripture_reference}
        text={
          item.scripture_text && item.scripture_text.length > 160
            ? `${item.scripture_text.slice(0, 157)}…`
            : item.scripture_text
        }
      />
      <div className="mt-auto pt-4">
        <Link
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-teal-200/90 underline-offset-4 transition hover:text-teal-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a10]"
        >
          Read source
          <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
