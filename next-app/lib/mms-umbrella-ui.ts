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
  "rounded-[1.35rem] border border-[#3f5a47]/20",
  "bg-[rgba(246,242,234,0.9)] backdrop-blur-xl",
  "shadow-[0_28px_64px_-28px_rgba(30,36,31,0.26),inset_0_1px_0_rgba(255,255,255,0.72)]",
  "ring-1 ring-[#b85c1e]/10",
);

/**
 * Nested milky panels (e.g. Builds detail cards) — readable on umbrella canvas.
 */
export const mmsGlassPanel = cn(
  "rounded-[1.35rem] border border-[#3f5a47]/16",
  "bg-[rgba(238,244,238,0.85)] backdrop-blur-2xl",
  "shadow-[0_24px_64px_-26px_rgba(30,36,31,0.24),inset_0_1px_0_rgba(255,255,255,0.65)]",
  "ring-1 ring-[#b85c1e]/10",
);

/** Denser glass for longer copy / cards — same family, a touch more fill for contrast on busy backdrops. */
export const mmsGlassPanelDense = cn(
  "rounded-[1.35rem] border border-[#3f5a47]/18",
  "bg-[rgba(244,248,244,0.9)] backdrop-blur-2xl",
  "shadow-[0_26px_64px_-24px_rgba(27,36,30,0.28),inset_0_1px_0_rgba(255,255,255,0.55)]",
  "ring-1 ring-[#2f3e34]/08",
);

/**
 * Homepage + umbrella canvas: milky frosted panels over the hero photo (readable dark type).
 * Pair with `mmsH2`, `mmsBodyFrost`, `mmsEyebrow`, etc. — not the legacy light-on-dark glass tokens.
 */
export const mmsGlassPanelHome = cn(
  "rounded-2xl border border-white/55",
  "bg-[rgba(252,250,246,0.93)] backdrop-blur-2xl",
  "shadow-[0_28px_68px_-26px_rgba(24,32,28,0.3),inset_0_1px_0_rgba(255,255,255,0.88)]",
  "ring-1 ring-[#3f5a47]/10",
);

export const mmsGlassPanelDenseHome = cn(
  "rounded-2xl border border-[#3f5a47]/14",
  "bg-[rgba(246,242,234,0.94)] backdrop-blur-2xl",
  "shadow-[0_26px_62px_-22px_rgba(24,32,28,0.28),inset_0_1px_0_rgba(255,255,255,0.82)]",
  "ring-1 ring-[#2f3e34]/08",
);

export const mmsCtaPanelHome = cn(
  "rounded-2xl border border-[#3f5a47]/16",
  "bg-[rgba(244,240,232,0.95)] backdrop-blur-2xl",
  "shadow-[0_24px_56px_-20px_rgba(24,32,28,0.26),inset_0_1px_0_rgba(255,255,255,0.8)]",
  "ring-1 ring-[#b85c1e]/12",
);

/** Body copy on milky frosted panels (strong contrast on busy backdrops). */
export const mmsBodyFrost = "text-[#2d3a33]";

/** Muted supporting line on frosted panels. */
export const mmsBodyFrostMuted = "text-[#4a5750]";

/** Headings on homepage dark glass — same scale as `mmsH2`, light text. */
export const mmsH2OnGlass = cn(
  "text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl lg:text-[2.35rem] lg:leading-snug",
);

/** Eyebrow on dark glass — warm accent in brand family. */
export const mmsEyebrowOnGlass = cn(
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-[#eab08a] md:text-xs",
);

export const mmsOnGlassPrimary = "text-white";
export const mmsOnGlassSecondary = "text-white/80";

export const mmsBulletOnGlass = "font-bold text-white/80";

export const mmsTextLinkOnGlass = cn(
  "text-sm font-semibold text-[#f0c49a] underline-offset-4",
  "transition-colors duration-200 hover:text-white hover:underline",
);

/** Secondary button on dark glass cards (homepage over umbrella). */
export const mmsBtnSecondaryOnGlass = cn(
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl",
  "border border-white/20 bg-white/10 px-6 text-center text-[0.9375rem] font-semibold text-white",
  "shadow-[0_2px_14px_rgba(0,0,0,0.25)] backdrop-blur-sm",
  "transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out",
  "hover:border-white/35 hover:bg-white/15 hover:shadow-[0_6px_22px_rgba(0,0,0,0.35)]",
  "active:translate-y-px",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
);
