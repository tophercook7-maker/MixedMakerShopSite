/**
 * Server-safe CSS variable map for sample / mockup presentation layout.
 * Duplicates logic from sample-draft-client.tsx (useMemo visualVars) for static HTML export.
 */

import type { CSSProperties } from "react";
import type { MockupColorPreset, MockupStylePreset } from "@/lib/crm-mockup";

const STYLE_PRESETS: Record<
  MockupStylePreset,
  {
    sectionPad: string;
    heroPad: string;
    h1Size: string;
    h2Size: string;
    bodySize: string;
    radius: string;
    buttonRadius: string;
    shadow: string;
    heroWeight: number;
    cardBorderWidth: string;
    cardContrast: number;
  }
> = {
  "clean-modern": {
    sectionPad: "clamp(72px, 10vw, 112px)",
    heroPad: "clamp(96px, 14vw, 140px)",
    h1Size: "clamp(2.75rem, 5vw + 1rem, 3.75rem)",
    h2Size: "clamp(28px, 3vw, 36px)",
    bodySize: "17px",
    radius: "16px",
    buttonRadius: "999px",
    shadow: "0 24px 60px rgba(0,0,0,.22)",
    heroWeight: 950,
    cardBorderWidth: "1px",
    cardContrast: 0.08,
  },
  "bold-premium": {
    sectionPad: "clamp(80px, 11vw, 120px)",
    heroPad: "clamp(104px, 15vw, 148px)",
    h1Size: "clamp(2.85rem, 5.5vw + 1rem, 4rem)",
    h2Size: "clamp(30px, 3.2vw, 40px)",
    bodySize: "18px",
    radius: "22px",
    buttonRadius: "12px",
    shadow: "0 28px 72px rgba(0,0,0,.34)",
    heroWeight: 980,
    cardBorderWidth: "1.5px",
    cardContrast: 0.14,
  },
  "friendly-local": {
    sectionPad: "clamp(76px, 10vw, 116px)",
    heroPad: "clamp(100px, 14vw, 136px)",
    h1Size: "clamp(2.75rem, 5vw + 1rem, 3.85rem)",
    h2Size: "clamp(28px, 3vw, 36px)",
    bodySize: "18px",
    radius: "26px",
    buttonRadius: "999px",
    shadow: "0 20px 46px rgba(0,0,0,.2)",
    heroWeight: 900,
    cardBorderWidth: "1px",
    cardContrast: 0.1,
  },
  "minimal-elegant": {
    sectionPad: "clamp(68px, 9vw, 100px)",
    heroPad: "clamp(88px, 12vw, 124px)",
    h1Size: "clamp(2.5rem, 4.5vw + 1rem, 3.5rem)",
    h2Size: "clamp(26px, 2.8vw, 34px)",
    bodySize: "16px",
    radius: "10px",
    buttonRadius: "8px",
    shadow: "0 16px 34px rgba(0,0,0,.14)",
    heroWeight: 850,
    cardBorderWidth: "1px",
    cardContrast: 0.06,
  },
};

const COLOR_PRESETS: Record<
  MockupColorPreset,
  {
    bg: string;
    heroBg: string;
    sectionTint: string;
    navBg: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    primaryText: string;
    secondary: string;
    secondaryText: string;
    accent: string;
  }
> = {
  blue: {
    bg: "radial-gradient(1200px 700px at 8% 0%, rgba(102,145,255,.4), transparent 60%), linear-gradient(180deg, #08162f 0%, #10264f 50%, #0a1e3f 100%)",
    heroBg: "radial-gradient(circle at 18% 10%, rgba(98,153,255,.42), transparent 58%)",
    sectionTint: "rgba(99,150,255,.08)",
    navBg: "rgba(10, 28, 64, 0.72)",
    surface: "rgba(15, 33, 74, 0.65)",
    surfaceAlt: "rgba(10, 25, 57, 0.72)",
    text: "#f5f8ff",
    muted: "rgba(232, 238, 255, .78)",
    border: "rgba(183, 204, 255, .25)",
    primary: "#5b92ff",
    primaryText: "#08122a",
    secondary: "rgba(255, 255, 255, .08)",
    secondaryText: "#f5f8ff",
    accent: "#9dc0ff",
  },
  green: {
    bg: "radial-gradient(1000px 620px at 12% 2%, rgba(78,211,150,.38), transparent 58%), radial-gradient(820px 480px at 88% 100%, rgba(180, 140, 95, 0.14), transparent 55%), linear-gradient(180deg, #0a1f17 0%, #123427 55%, #0a241b 100%)",
    heroBg: "radial-gradient(circle at 22% 10%, rgba(88,235,171,.34), transparent 58%)",
    sectionTint: "rgba(86,219,157,.08)",
    navBg: "rgba(12, 39, 29, 0.72)",
    surface: "rgba(16, 46, 34, 0.68)",
    surfaceAlt: "rgba(12, 36, 27, 0.74)",
    text: "#f0fff8",
    muted: "rgba(225, 255, 241, .78)",
    border: "rgba(150, 233, 194, .24)",
    primary: "#55d6a0",
    primaryText: "#042217",
    secondary: "rgba(255, 255, 255, .08)",
    secondaryText: "#f0fff8",
    accent: "#9bf2cf",
  },
  dark: {
    bg: "radial-gradient(1200px 760px at 90% 4%, rgba(252,212,138,.14), transparent 56%), linear-gradient(180deg, #09090b 0%, #141418 52%, #08080a 100%)",
    heroBg: "radial-gradient(circle at 18% 10%, rgba(246,208,132,.2), transparent 58%)",
    sectionTint: "rgba(242,213,159,.06)",
    navBg: "rgba(12, 12, 14, 0.76)",
    surface: "rgba(27, 27, 32, 0.72)",
    surfaceAlt: "rgba(21, 21, 26, 0.78)",
    text: "#f4f4f5",
    muted: "rgba(235, 235, 239, .72)",
    border: "rgba(255, 255, 255, .2)",
    primary: "#f2d59f",
    primaryText: "#211101",
    secondary: "rgba(255, 255, 255, .08)",
    secondaryText: "#f4f4f5",
    accent: "#b5b8c3",
  },
  "warm-neutral": {
    bg: "radial-gradient(980px 560px at 14% 0%, rgba(196,148,88,.35), transparent 58%), linear-gradient(180deg, #f6efe3 0%, #ebe0ce 54%, #f4eadb 100%)",
    heroBg: "radial-gradient(circle at 20% 10%, rgba(192,144,84,.28), transparent 56%)",
    sectionTint: "rgba(176,126,74,.08)",
    navBg: "rgba(253, 246, 237, 0.76)",
    surface: "rgba(255, 253, 249, 0.9)",
    surfaceAlt: "rgba(247, 239, 228, 0.9)",
    text: "#2b241b",
    muted: "rgba(63, 50, 36, .78)",
    border: "rgba(142, 120, 89, .3)",
    primary: "#8f6741",
    primaryText: "#fff8ef",
    secondary: "rgba(90, 70, 46, .08)",
    secondaryText: "#2b241b",
    accent: "#b98f64",
  },
  "bold-accent": {
    bg: "radial-gradient(1200px 700px at 6% 2%, rgba(255,99,143,.36), transparent 60%), linear-gradient(180deg, #220d30 0%, #321349 55%, #1f0b2b 100%)",
    heroBg: "radial-gradient(circle at 20% 10%, rgba(255,106,146,.34), transparent 56%)",
    sectionTint: "rgba(255,122,164,.09)",
    navBg: "rgba(46, 20, 66, 0.74)",
    surface: "rgba(53, 29, 78, 0.78)",
    surfaceAlt: "rgba(43, 23, 66, 0.74)",
    text: "#fff4f8",
    muted: "rgba(255, 221, 233, .76)",
    border: "rgba(255, 168, 195, .28)",
    primary: "#ff5b8e",
    primaryText: "#2d0014",
    secondary: "rgba(255, 255, 255, .08)",
    secondaryText: "#fff4f8",
    accent: "#ffb7cf",
  },
  wellness: {
    bg: "radial-gradient(1100px 680px at 6% 0%, rgba(212, 196, 172, 0.55), transparent 58%), radial-gradient(900px 560px at 94% 12%, rgba(138, 158, 142, 0.38), transparent 52%), radial-gradient(700px 500px at 50% 100%, rgba(176, 132, 118, 0.22), transparent 50%), linear-gradient(185deg, #e6d9c8 0%, #d8cfc0 38%, #c9bfb0 72%, #4a4540 100%)",
    heroBg:
      "radial-gradient(circle at 20% 8%, rgba(255, 252, 246, 0.5), transparent 52%), radial-gradient(circle at 85% 40%, rgba(120, 142, 128, 0.18), transparent 48%)",
    sectionTint: "rgba(95, 112, 98, 0.12)",
    navBg: "rgba(238, 228, 216, 0.88)",
    surface: "rgba(255, 251, 245, 0.78)",
    surfaceAlt: "rgba(222, 212, 198, 0.62)",
    text: "#2c2824",
    muted: "rgba(60, 52, 44, 0.78)",
    border: "rgba(120, 108, 92, 0.28)",
    primary: "#5f6f62",
    primaryText: "#f9f7f2",
    secondary: "rgba(60, 52, 44, 0.08)",
    secondaryText: "#2c2824",
    accent: "#8a7a6c",
  },
};

export function buildSampleStandaloneCssVars(
  stylePreset: MockupStylePreset,
  colorPreset: MockupColorPreset
): CSSProperties {
  const style = STYLE_PRESETS[stylePreset] ?? STYLE_PRESETS["clean-modern"];
  const color = COLOR_PRESETS[colorPreset] ?? COLOR_PRESETS.blue;
  const buttonVarsByStyle: Record<
    MockupStylePreset,
    {
      goldBg: string;
      goldBorder: string;
      goldText: string;
      ghostBg: string;
      ghostBorder: string;
    }
  > = {
    "clean-modern": {
      goldBg: color.primary,
      goldBorder: "transparent",
      goldText: color.primaryText,
      ghostBg: color.secondary,
      ghostBorder: color.border,
    },
    "bold-premium": {
      goldBg: `linear-gradient(135deg, ${color.primary}, ${color.accent})`,
      goldBorder: "transparent",
      goldText: color.primaryText,
      ghostBg: "transparent",
      ghostBorder: color.accent,
    },
    "friendly-local": {
      goldBg: color.primary,
      goldBorder: "transparent",
      goldText: color.primaryText,
      ghostBg: "rgba(255,255,255,.10)",
      ghostBorder: color.border,
    },
    "minimal-elegant": {
      goldBg: "transparent",
      goldBorder: color.primary,
      goldText: color.text,
      ghostBg: "transparent",
      ghostBorder: color.border,
    },
  };
  const buttonVars = buttonVarsByStyle[stylePreset] ?? buttonVarsByStyle["clean-modern"];
  return {
    "--sd-bg": color.bg,
    "--sd-hero-bg": color.heroBg,
    "--sd-section-tint": color.sectionTint,
    "--sd-nav-bg": color.navBg,
    "--sd-surface": color.surface,
    "--sd-surface-alt": color.surfaceAlt,
    "--sd-text": color.text,
    "--sd-muted": color.muted,
    "--sd-border": color.border,
    "--sd-primary": color.primary,
    "--sd-primary-text": color.primaryText,
    "--sd-secondary": color.secondary,
    "--sd-secondary-text": color.secondaryText,
    "--sd-accent": color.accent,
    "--sd-section-pad": style.sectionPad,
    "--sd-hero-pad": style.heroPad,
    "--sd-h1-size": style.h1Size,
    "--sd-h2-size": style.h2Size,
    "--sd-body-size": style.bodySize,
    "--sd-radius": style.radius,
    "--sd-btn-radius": style.buttonRadius,
    "--sd-shadow": style.shadow,
    "--sd-hero-weight": String(style.heroWeight),
    "--sd-card-border": style.cardBorderWidth,
    "--sd-card-contrast": String(style.cardContrast),
    "--sd-btn-gold-bg": buttonVars.goldBg,
    "--sd-btn-gold-border": buttonVars.goldBorder,
    "--sd-btn-gold-text": buttonVars.goldText,
    "--sd-btn-ghost-bg": buttonVars.ghostBg,
    "--sd-btn-ghost-border": buttonVars.ghostBorder,
  } as CSSProperties;
}
