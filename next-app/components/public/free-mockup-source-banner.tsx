import { publicShellClass } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const shell = publicShellClass;

/**
 * Soft contextual banner when /free-mockup is opened with ?source=freshcut (case study funnel).
 */
export function FreeMockupSourceBannerFreshCut() {
  return (
    <div
      className={cn(
        "border-b border-[#3f5a47]/12",
        "bg-gradient-to-br from-[#e4ebe4]/95 via-[#eef3ee] to-[#f4f1ea]",
        "py-5 md:py-6",
      )}
      role="region"
      aria-label="Context for your preview request"
    >
      <div className={cn(shell, "max-w-3xl")}>
        <p className="text-base font-semibold tracking-tight text-[#1e241f] md:text-lg">
          Want something like Fresh Cut Property Care?
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4a5750] md:text-[15px]">
          I&apos;ll build you a homepage-style preview based on that same clean, simple structure — tailored to your
          business.
        </p>
      </div>
    </div>
  );
}
