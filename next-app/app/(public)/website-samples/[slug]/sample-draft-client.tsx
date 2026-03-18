"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Mode = "edit" | "presentation";
type StylePreset = "clean-modern" | "bold-premium" | "friendly-local" | "minimal-elegant";
type ColorPreset = "blue" | "green" | "dark" | "warm-neutral" | "bold-accent";

export type SampleDraft = {
  businessName: string;
  tagline: string;
  localPositioning: string;
  heroHeadline: string;
  heroSub: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  offeringsTitle: string;
  offerings: Array<{ name: string; text: string }>;
  aboutTitle: string;
  aboutText: string;
  trustTitle: string;
  trustQuotes: Array<{ quote: string; by: string }>;
  locationTitle: string;
  locationName: string;
  address: string;
  phone: string;
  hours: string[];
  finalTitle: string;
  finalSub: string;
  finalCta: string;
};

type Props = {
  initialDraft: SampleDraft;
  initialMode: Mode;
};

const STYLE_PRESET_OPTIONS: Array<{ id: StylePreset; label: string }> = [
  { id: "clean-modern", label: "Clean / Modern" },
  { id: "bold-premium", label: "Bold / Premium" },
  { id: "friendly-local", label: "Friendly / Local" },
  { id: "minimal-elegant", label: "Minimal / Elegant" },
];

const COLOR_PRESET_OPTIONS: Array<{ id: ColorPreset; label: string }> = [
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "dark", label: "Dark" },
  { id: "warm-neutral", label: "Warm Neutral" },
  { id: "bold-accent", label: "Bold Accent" },
];

const STYLE_PRESETS: Record<
  StylePreset,
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
    sectionPad: "50px",
    heroPad: "72px",
    h1Size: "clamp(40px, 5vw, 62px)",
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
    sectionPad: "62px",
    heroPad: "88px",
    h1Size: "clamp(44px, 5.6vw, 72px)",
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
    sectionPad: "56px",
    heroPad: "76px",
    h1Size: "clamp(40px, 5vw, 64px)",
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
    sectionPad: "46px",
    heroPad: "66px",
    h1Size: "clamp(38px, 4.7vw, 58px)",
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
  ColorPreset,
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
    bg: "radial-gradient(1000px 620px at 12% 2%, rgba(78,211,150,.38), transparent 58%), linear-gradient(180deg, #0a1f17 0%, #123427 55%, #0a241b 100%)",
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
};

export function SampleDraftClient({ initialDraft, initialMode }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [stylePreset, setStylePreset] = useState<StylePreset>("clean-modern");
  const [colorPreset, setColorPreset] = useState<ColorPreset>("blue");
  const [draft, setDraft] = useState<SampleDraft>(initialDraft);

  useEffect(() => {
    const body = document.body;
    body.classList.add("sample-draft-mode");
    if (mode === "presentation") {
      body.classList.add("sample-presentation-mode");
    } else {
      body.classList.remove("sample-presentation-mode");
    }
    return () => {
      body.classList.remove("sample-presentation-mode");
      body.classList.remove("sample-draft-mode");
    };
  }, [mode]);

  const visualVars = useMemo(() => {
    const style = STYLE_PRESETS[stylePreset];
    const color = COLOR_PRESETS[colorPreset];
    const buttonVarsByStyle: Record<
      StylePreset,
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
    const buttonVars = buttonVarsByStyle[stylePreset];
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
  }, [colorPreset, stylePreset]);

  const telHref = `tel:${draft.phone.replace(/[^\d]/g, "")}`;
  const exportPayload = useMemo(
    () => ({
      mode,
      style_preset: stylePreset,
      color_preset: colorPreset,
      draft,
    }),
    [mode, stylePreset, colorPreset, draft],
  );

  const updateField = (field: keyof SampleDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const site = (
    <>
      {mode === "presentation" && (
        <nav className="sample-site-nav">
          <div className="container sample-site-nav-inner">
            <a href="#top" className="sample-site-brand">
              {draft.businessName}
            </a>
            <div className="sample-site-links">
              <a href="#menu">Menu</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </nav>
      )}
      <header className="sample-hero">
        <div className="container" id="top">
          <div className="sample-hero-grid">
            <div className="sample-hero-content">
            <p className="sample-business-name">{draft.businessName}</p>
            <p className="sample-tagline">{draft.tagline}</p>
            <h1 className="sample-h1">{draft.heroHeadline}</h1>
            <p className="sample-sub">{draft.heroSub}</p>
            <p className="sample-local">{draft.localPositioning}</p>
            <div className="btn-row">
              <a href={telHref} className="btn gold">
                {draft.heroPrimaryCta}
              </a>
              <Link href="/website-samples" className="btn ghost">
                {draft.heroSecondaryCta}
              </Link>
            </div>
          </div>
            <div className="sample-hero-spotlight" aria-hidden="true" />
          </div>
        </div>
      </header>

      <section className="section sample-section" id="menu">
        <div className="container">
          <h2 className="sample-h2">{draft.offeringsTitle}</h2>
          <div className="how-it-works-grid">
            {draft.offerings.map((item) => (
              <article key={item.name} className="how-it-works-card">
                <h3 className="how-it-works-title">{item.name}</h3>
                <p className="how-it-works-copy">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section sample-section" id="about">
        <div className="container">
          <div className="panel sample-panel">
            <h2 className="sample-h2">{draft.aboutTitle}</h2>
            <p className="sample-sub" style={{ margin: 0 }}>{draft.aboutText}</p>
          </div>
        </div>
      </section>

      <section className="section sample-section" id="contact">
        <div className="container">
          <h2 className="sample-h2">{draft.trustTitle}</h2>
          <div className="grid-2">
            {draft.trustQuotes.map((entry) => (
              <blockquote key={entry.by} className="card sample-quote">
                <p style={{ margin: "0 0 10px" }}>"{entry.quote}"</p>
                <p className="small" style={{ margin: 0, opacity: 0.85 }}>
                  - {entry.by}
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section sample-section">
        <div className="container">
          <h2 className="sample-h2">{draft.locationTitle}</h2>
          <div className="grid-2">
            <div className="card sample-info">
              <h3 style={{ margin: "0 0 8px" }}>{draft.locationName}</h3>
              <p className="small" style={{ margin: "0 0 6px" }}>{draft.address}</p>
              <a href={telHref} className="small" style={{ margin: 0, display: "inline-block" }}>
                {draft.phone}
              </a>
            </div>
            <div className="card sample-info">
              <h3 style={{ margin: "0 0 8px" }}>Hours</h3>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {draft.hours.map((line) => (
                  <li key={line} className="small" style={{ marginBottom: 6 }}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section sample-section">
        <div className="container">
          <div className="panel sample-panel">
            <h2 className="sample-h2">{draft.finalTitle}</h2>
            <p className="sample-sub">{draft.finalSub}</p>
            <div className="btn-row">
              <a href={telHref} className="btn gold">
                {draft.finalCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div className={`sample-standalone ${mode === "presentation" ? "is-presentation" : "is-edit"}`} style={visualVars}>
      {mode === "edit" ? (
        <div className="sample-live-builder">
          <aside className="sample-editor-dock">
            <div className="sample-editor-card">
              <div className="sample-editor-header">
                <h2 style={{ margin: 0 }}>Edit Mode</h2>
                <button type="button" className="btn ghost" onClick={() => setMode("presentation")}>
                  Presentation Mode
                </button>
              </div>
              <p className="small" style={{ margin: "8px 0 0" }}>
                Edits apply to the live page instantly.
              </p>

              <div className="grid-2" style={{ marginTop: 14 }}>
                <label className="sample-control">
                  <span>Style Preset</span>
                  <select value={stylePreset} onChange={(e) => setStylePreset(e.target.value as StylePreset)}>
                    {STYLE_PRESET_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sample-control">
                  <span>Color Preset</span>
                  <select value={colorPreset} onChange={(e) => setColorPreset(e.target.value as ColorPreset)}>
                    {COLOR_PRESET_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sample-control">
                  <span>Business Name</span>
                  <input value={draft.businessName} onChange={(e) => updateField("businessName", e.target.value)} />
                </label>

                <label className="sample-control">
                  <span>Tagline</span>
                  <input value={draft.tagline} onChange={(e) => updateField("tagline", e.target.value)} />
                </label>

                <label className="sample-control full">
                  <span>Headline</span>
                  <input value={draft.heroHeadline} onChange={(e) => updateField("heroHeadline", e.target.value)} />
                </label>

                <label className="sample-control full">
                  <span>Subheadline</span>
                  <textarea value={draft.heroSub} onChange={(e) => updateField("heroSub", e.target.value)} />
                </label>

                <label className="sample-control">
                  <span>Primary CTA</span>
                  <input value={draft.heroPrimaryCta} onChange={(e) => updateField("heroPrimaryCta", e.target.value)} />
                </label>

                <label className="sample-control">
                  <span>Secondary CTA</span>
                  <input value={draft.heroSecondaryCta} onChange={(e) => updateField("heroSecondaryCta", e.target.value)} />
                </label>
              </div>

              <details style={{ marginTop: 14 }}>
                <summary style={{ cursor: "pointer", fontWeight: 800 }}>Export Draft State</summary>
                <pre className="sample-export">{JSON.stringify(exportPayload, null, 2)}</pre>
              </details>
            </div>
          </aside>
          <div className="sample-live-canvas">{site}</div>
        </div>
      ) : site}
    </div>
  );
}
