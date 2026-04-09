import { cn } from "@/lib/utils";

/**
 * MixedMakerShop umbrella brand — moss, forest, leather, burnt orange, warm cream, charcoal.
 * Use these for public marketing surfaces; pair with `.public-site--light-umbrella` in globals.
 */
export const mmsBrand = {
  deepMoss: "#2f3e34",
  forest: "#3f5a47",
  softSage: "#6f8a73",
  burntOrange: "#b85c1e",
  saddleLeather: "#8a4b2a",
  warmCream: "#ece7dd",
  charcoalInk: "#1e241f",
} as const;

/** Homepage hero — umbrella interior brand photograph (`mixedmakershop-umbrella-brand-hero.png`, ~1024×682). */
export const mmsUmbrellaHeroImageSrc = "/images/mixedmakershop-umbrella-brand-hero.png";

/** Full-width light marketing page shell (inside public layout). */
export const mmsPageBg = cn("w-full bg-[#ece7dd] text-[#2f3e34] antialiased");

/** Generous vertical rhythm between major sections. */
export const mmsSectionY = "py-20 md:py-28 lg:py-36";

/** Section titles — charcoal + tight tracking. */
export const mmsH2 = cn(
  "text-3xl font-bold tracking-[-0.02em] text-[#1e241f] md:text-4xl lg:text-[2.35rem] lg:leading-snug",
);

export const mmsH1 = cn(
  "text-4xl font-bold tracking-[-0.035em] text-[#1e241f] sm:text-5xl lg:leading-[1.06]",
);

export const mmsEyebrow = cn(
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3f5a47] md:text-xs",
);

/** Primary body / lead — slightly softer than headings. */
export const mmsLead = cn("text-lg leading-[1.65] text-[#4a5750] md:text-xl md:leading-[1.7]");

/** List bullet / accent dot. */
export const mmsBullet = "font-bold text-[#3f5a47]";

/** Numbered step circle (light sections). */
export const mmsStepCircle = cn(
  "mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full",
  "bg-[#3f5a47]/12 text-sm font-bold text-[#3f5a47]",
);

/** Inline text link (leather → orange hover). */
export const mmsTextLink = cn(
  "text-sm font-semibold text-[#8a4b2a] underline-offset-4",
  "transition-colors duration-200 hover:text-[#b85c1e] hover:underline",
);

/** Subtle section border (bottom dividers). */
export const mmsSectionBorder = "border-[#3f5a47]/10";

/** Primary CTA — burnt orange / leather, restrained depth. */
export const mmsBtnPrimary = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl",
  "bg-gradient-to-br from-[#c96a28] via-[#b85c1e] to-[#8a4b2a] px-6",
  "text-center text-[0.9375rem] font-semibold text-[#fffaf5]",
  "shadow-[0_4px_22px_rgba(184,92,30,0.32),inset_0_1px_0_rgba(255,255,255,0.18)]",
  "transition-[filter,box-shadow,transform] duration-200 ease-out",
  "hover:brightness-[1.06] hover:shadow-[0_8px_28px_rgba(47,62,52,0.18),inset_0_1px_0_rgba(255,255,255,0.2)]",
  "active:translate-y-px",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f5a47]",
);

/** Secondary — soft panel on light; pair with hero glass variant in hero component. */
export const mmsBtnSecondary = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl",
  "border border-[#3f5a47]/20 bg-white/80 px-6 text-center text-[0.9375rem] font-semibold text-[#1e241f]",
  "shadow-[0_2px_14px_rgba(47,62,52,0.07)] backdrop-blur-sm",
  "transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out",
  "hover:border-[#3f5a47]/32 hover:bg-[#f7f4ee] hover:shadow-[0_6px_22px_rgba(47,62,52,0.1)]",
  "active:translate-y-px",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f5a47]",
);

export const mmsCard = cn(
  "rounded-[1.35rem] border border-[#3f5a47]/12",
  "bg-gradient-to-br from-white via-[#faf8f4] to-[#f0ebe3]/95",
  "shadow-[0_22px_55px_-26px_rgba(30,36,31,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]",
  "transition-[box-shadow,transform] duration-300 ease-out",
);

export const mmsCtaPanel = cn(
  "rounded-[1.35rem] border border-[#3f5a47]/22",
  "bg-[rgba(246,242,234,0.72)] backdrop-blur-xl",
  "shadow-[0_28px_64px_-28px_rgba(30,36,31,0.28),inset_0_1px_0_rgba(255,255,255,0.52)]",
  "ring-1 ring-[#b85c1e]/10",
);

/**
 * Translucent “milky glass” surface — trust-strip reference for major homepage blocks over the umbrella photo.
 * Slightly milky (not pure white), readable with dark type, backdrop blur + soft border.
 */
export const mmsGlassPanel = cn(
  "rounded-[1.35rem] border border-[#3f5a47]/18",
  "bg-[rgba(236,241,236,0.5)] backdrop-blur-2xl",
  "shadow-[0_28px_72px_-26px_rgba(30,36,31,0.28),inset_0_1px_0_rgba(255,255,255,0.5)]",
  "ring-1 ring-[#b85c1e]/12",
);

/** Denser glass for longer copy / cards — same family, a touch more fill for contrast on busy backdrops. */
export const mmsGlassPanelDense = cn(
  "rounded-[1.35rem] border border-[#3f5a47]/20",
  "bg-[rgba(232,239,232,0.6)] backdrop-blur-2xl",
  "shadow-[0_26px_64px_-24px_rgba(27,36,30,0.32),inset_0_1px_0_rgba(255,255,255,0.45)]",
  "ring-1 ring-[#2f3e34]/10",
);
