import { cn } from "@/lib/utils";

/** Umbrella homepage (/) background — matches sticky nav when `nav--gateway` is applied */
export const publicGatewayPageBgClass =
  "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%),linear-gradient(180deg,#07111f_0%,#08131c_100%)]";

/** Content max width + horizontal padding — shared by umbrella, web funnel, and 3D funnel */
export const publicShellClass =
  "mx-auto w-full max-w-[min(100%,87.5rem)] px-5 sm:px-8 md:px-10 lg:px-12";

export const publicSectionYClass = "py-20 md:py-28";

/** Section h2 — web (mint family) */
export const publicH2WebClass =
  "text-3xl font-semibold tracking-tight text-[#E8FDF5] md:text-4xl lg:text-[2.75rem] lg:leading-[1.08]";

/** Section h2 — printing bands (white on dark) */
export const publicH2PrintClass =
  "text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem] lg:leading-[1.08]";

export const publicBodyMutedClass = "text-base md:text-lg leading-relaxed text-[#9FB5AD]";

export const publicEyebrowWebClass =
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(0,255,178,0.88)] md:text-xs md:tracking-[0.26em]";

export const publicEyebrowPrintClass =
  "text-[11px] font-semibold uppercase tracking-[0.26em] text-orange-400/95 md:text-xs";

/** Premium card shell — glass panel (web path accent) */
export const publicCardGlassWebClass = cn(
  "rounded-[1.35rem] border border-[rgba(0,255,178,0.14)] bg-[rgba(17,26,23,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md",
);

/** Premium card shell — glass panel (print path accent) */
export const publicCardGlassPrintClass = cn(
  "rounded-[1.35rem] border border-white/[0.1] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-sm",
);

/** Section divider — gradient hairline */
export const publicSectionDividerClass =
  "pointer-events-none mx-auto h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-[rgba(232,253,245,0.14)] to-transparent";
