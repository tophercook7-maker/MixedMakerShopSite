import { cn } from "@/lib/utils";

/** Align with public funnel max width (MixedMakerShop umbrella + web design) */
export const printingWidthClass = "max-w-[min(100%,87.5rem)]";

export const printingPadClass = "px-5 sm:px-8 md:px-10 lg:px-12";

export const printingContentClass = cn("mx-auto w-full", printingWidthClass, printingPadClass);

/** Soft panel: semi-transparent stack + subtle top highlight (industrial, not flat) */
export const printingSectionSurfaceClass =
  "relative overflow-hidden rounded-[1.75rem] border border-white/[0.14] bg-[rgba(255,255,255,0.082)] shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_32px_96px_rgba(0,0,0,0.26)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#b85c1e]/42 before:to-transparent";

/** Umbrella-light panel — moss-tinted, higher contrast than flat white */
export const printingSectionSurfaceLightClass =
  "relative overflow-hidden rounded-[1.75rem] border border-[#3f5a47]/16 bg-[rgba(250,248,244,0.97)] shadow-[0_22px_55px_-26px_rgba(30,36,31,0.16)]";
