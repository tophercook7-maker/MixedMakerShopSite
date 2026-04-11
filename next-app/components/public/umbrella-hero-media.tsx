import Image from "next/image";
import { mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

/**
 * Umbrella photograph + readability stack.
 * - Image: crisp filters, object-position biased to upper canopy (hides phone / desk clutter).
 * - White haze between image and page content; light vignettes (no heavy black wash).
 * - `scroll`: stronger bottom blend for in-flow mobile hero.
 * - `fixed`: softer stack for viewport-locked desktop layer behind glass panels.
 */
export function UmbrellaHeroMedia({
  className,
  imageClassName,
  priority = true,
  variant = "scroll",
}: {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** `fixed` = viewport-locked layer behind homepage content (see FixedHeroMedia). */
  variant?: "scroll" | "fixed";
}) {
  const isFixed = variant === "fixed";

  return (
    <div className={cn("relative isolate h-full min-h-0 w-full overflow-hidden", className)}>
      {/* z-0 — source image + clarity filters */}
      <div className="absolute inset-0 z-0">
        <Image
          src={mmsUmbrellaHeroImageSrc}
          alt="MixedMakerShop umbrella brand — open umbrella in the rain, canopy and warm interior light."
          fill
          priority={priority}
          quality={92}
          sizes="100vw"
          className={cn(
            "object-cover",
            /* Bias toward upper / canopy; keeps scene premium and crops desk + phone out of frame */
            "object-[50%_min(22%,5rem)] sm:object-[50%_24%] md:object-[50%_26%] lg:object-[50%_28%]",
            "[filter:contrast(1.05)_brightness(1.03)_saturate(1.05)]",
            imageClassName,
          )}
        />
      </div>

      {/* z-[1] — soft white haze (readability layer between photo and text) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1]",
          "bg-gradient-to-b from-white/[0.65] via-white/[0.4] to-white/[0.75]",
          /* Slightly less opaque on small screens so it doesn’t feel chalky */
          "max-md:from-white/[0.52] max-md:via-white/[0.32] max-md:to-white/[0.62]",
        )}
        aria-hidden
      />

      {/* z-[1] — subtle depth (replaces heavy black/60) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1]",
          isFixed ? "bg-black/[0.1] max-md:bg-black/[0.06]" : "bg-black/[0.14] max-md:bg-black/[0.09]",
        )}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04] mix-blend-overlay max-md:opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(rgba(30,36,31,0.9) 0.4px, transparent 0.4px)",
          backgroundSize: "3px 3px",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r",
          isFixed
            ? "from-[#1e241f]/18 via-[#2f3e34]/10 to-[#3f5a47]/6"
            : "from-[#1e241f]/22 via-[#2f3e34]/12 to-[#3f5a47]/8",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t",
          isFixed ? "from-[#1e241f]/12 via-transparent to-[#1e241f]/10" : "from-[#1e241f]/18 via-transparent to-[#1e241f]/12",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1]",
          isFixed
            ? "bg-[radial-gradient(ellipse_92%_78%_at_50%_38%,transparent_50%,rgba(12,15,13,0.14)_100%)]"
            : "bg-[radial-gradient(ellipse_92%_78%_at_50%_38%,transparent_46%,rgba(12,15,13,0.2)_100%)]",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[1]",
          isFixed
            ? "h-[38vw] max-h-[16rem] min-h-[9rem] sm:min-h-[10rem]"
            : "h-[48vw] max-h-[22rem] min-h-[12rem] sm:min-h-[13rem]",
        )}
        style={{
          background: isFixed
            ? "linear-gradient(to bottom, rgba(0,0,0,0) 22%, rgba(47,62,52,0.14) 55%, rgba(63,90,71,0.22) 72%, rgba(236,231,221,0.22) 100%)"
            : "linear-gradient(to bottom, rgba(0,0,0,0) 28%, rgba(47,62,52,0.22) 58%, rgba(63,90,71,0.38) 76%, #ece7dd 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
