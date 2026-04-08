import Image from "next/image";
import { mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

/** Umbrella photograph + grain, readability, vignette, moss→cream bottom fade (shared by fixed + mobile fallbacks). */
export function UmbrellaHeroMedia({
  className,
  imageClassName,
  priority = true,
}: {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative h-full min-h-0 w-full overflow-hidden", className)}>
      <Image
        src={mmsUmbrellaHeroImageSrc}
        alt="MixedMakerShop umbrella brand — open umbrella in the rain as a mobile office: wood-and-brass shaft, leather organizers, laptop, tablet, and Topher's web design sign."
        fill
        priority={priority}
        sizes="100vw"
        className={cn(
          "scale-[1.02] object-cover object-[50%_43%]",
          "sm:object-[50%_42%]",
          "md:object-[48%_44%]",
          "lg:object-[46%_45%]",
          "xl:object-[44%_46%]",
          imageClassName,
        )}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(rgba(30,36,31,0.9) 0.4px, transparent 0.4px)",
          backgroundSize: "3px 3px",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#1e241f]/78 via-[#2f3e34]/36 to-[#3f5a47]/12"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#1e241f]/38 via-transparent to-[#1e241f]/22"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_92%_78%_at_50%_42%,transparent_42%,rgba(12,15,13,0.38)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48vw] max-h-[22rem] min-h-[12rem] sm:min-h-[13rem]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(47,62,52,0.45) 58%, rgba(63,90,71,0.72) 76%, #ece7dd 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
