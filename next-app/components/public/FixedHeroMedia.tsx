import { UmbrellaHeroMedia } from "@/components/public/umbrella-hero-media";
import { cn } from "@/lib/utils";

/**
 * Desktop/tablet: viewport-locked umbrella layer. Out of document flow so scrolling sections
 * pass over it (must sit under content via z-index; `pointer-events-none` keeps CTAs clickable).
 * Hidden below `md` — mobile uses the in-flow hero fallback instead.
 */
export function FixedHeroMedia() {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-0 hidden h-[100svh] w-full overflow-hidden",
        "md:block",
      )}
    >
      <UmbrellaHeroMedia className="h-full w-full" priority variant="fixed" />
    </div>
  );
}
