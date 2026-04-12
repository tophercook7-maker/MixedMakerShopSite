import { publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/**
 * Contextual banner when /free-mockup is opened with `?example=freshcut` or `?source=freshcut` (Fresh Cut funnel).
 */
export function FreeMockupSourceBannerFreshCut() {
  return (
    <div
      className={cn(
        "border-b border-[#3f5a47]/14",
        "bg-gradient-to-br from-[#dfe8df]/98 via-[#eef3ee] to-[#f5f1ea]",
        "shadow-[0_12px_40px_-28px_rgba(30,36,31,0.35)]",
        "py-6 md:py-8",
      )}
      role="region"
      aria-label="Context for your preview request"
    >
      <div className={cn(shell, "max-w-3xl")}>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4a6358]">Fresh Cut context</p>
        <p className="mt-2 text-lg font-semibold tracking-tight text-[#1a221c] md:text-xl">
          Want something like this?
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4a5750] md:text-[15px]">
          I&apos;ll build you a homepage-style preview based on the same service-first pattern family as the Fresh Cut
          Property Care build — then tailor it to your business.
        </p>
        <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#5a6b60]">
          <span className="rounded-full border border-[#3f5a47]/18 bg-white/55 px-3 py-1 backdrop-blur-sm">
            Pattern from a live local-service site
          </span>
          <span className="text-[#6b7a72]">Not a generic template swap.</span>
        </p>
      </div>
    </div>
  );
}
