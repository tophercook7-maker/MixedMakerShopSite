import { cn } from "@/lib/utils";

/** Align with public funnel max width (MixedMakerShop umbrella + web design) */
export const printingWidthClass = "max-w-[min(100%,87.5rem)]";

export const printingPadClass = "px-5 sm:px-8 md:px-10 lg:px-12";

export const printingContentClass = cn("mx-auto w-full", printingWidthClass, printingPadClass);

/** Soft panel: semi-transparent stack + subtle top highlight (industrial, not flat) */
export const printingSectionSurfaceClass =
  "relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_28px_90px_rgba(0,0,0,0.14)] backdrop-blur-[3px] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-orange-500/30 before:to-transparent";
