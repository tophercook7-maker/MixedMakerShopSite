import Link from "next/link";
import { Sparkles } from "lucide-react";

export function WorldWatchEmptyState() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-white/[0.08] bg-slate-950/50 px-6 py-14 text-center">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/5 text-teal-200/80"
        aria-hidden
      >
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="mb-3 text-xl font-semibold tracking-tight text-slate-100">
        World Watch is preparing new reflections
      </h2>
      <p className="mb-8 text-sm leading-relaxed text-slate-400">
        New items will appear here as trusted sources are processed and curated into calm, scripturally grounded
        updates.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/18 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/35"
      >
        Back to home
      </Link>
    </div>
  );
}
