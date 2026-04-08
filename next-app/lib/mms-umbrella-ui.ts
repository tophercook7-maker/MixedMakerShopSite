import { cn } from "@/lib/utils";

/** Homepage hero — umbrella interior brand photograph (`mixedmakershop-umbrella-brand-hero.png`, ~1024×682). */
export const mmsUmbrellaHeroImageSrc = "/images/mixedmakershop-umbrella-brand-hero.png";

/** Full-width light marketing page shell (inside public layout). */
export const mmsPageBg = "w-full bg-[#f4f3ef] text-slate-800 antialiased";

/** Generous vertical rhythm between major sections. */
export const mmsSectionY = "py-20 md:py-28 lg:py-36";

/** Section titles — consistent weight + tracking site-wide. */
export const mmsH2 = cn(
  "text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-[2.35rem] lg:leading-snug",
);

export const mmsH1 = cn(
  "text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:leading-[1.06] lg:tracking-[-0.035em]",
);

export const mmsEyebrow = cn(
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-900/80 md:text-xs",
);

export const mmsLead = "text-lg leading-relaxed text-slate-600 md:text-xl";

/** Warm gold primary — pairs with `.public-site--light-umbrella .btn.gold` on legacy pages. */
export const mmsBtnPrimary = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl",
  "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 px-6",
  "text-center text-[0.9375rem] font-semibold text-[#fffaf5]",
  "shadow-md shadow-orange-900/20 transition hover:brightness-105",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700",
);

export const mmsBtnSecondary = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl",
  "border border-slate-200/90 bg-white px-6 text-center text-[0.9375rem] font-semibold text-slate-800",
  "shadow-sm transition hover:border-slate-300 hover:bg-slate-50",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700",
);

export const mmsCard = cn(
  "rounded-[1.35rem] border border-slate-200/80 bg-white",
  "shadow-[0_22px_55px_-26px_rgba(15,23,42,0.14)]",
);

export const mmsCtaPanel = cn(
  "rounded-[1.35rem] border border-slate-200/70",
  "bg-gradient-to-br from-white via-[#faf9f6] to-[#ece8e0]",
  "shadow-[0_26px_64px_-30px_rgba(15,23,42,0.16)]",
);
