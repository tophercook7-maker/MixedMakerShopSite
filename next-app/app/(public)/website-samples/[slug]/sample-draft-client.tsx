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
    bg: "linear-gradient(180deg, #0a1530 0%, #12244a 60%, #0b1937 100%)",
    heroBg: "radial-gradient(circle at 20% 10%, rgba(77,132,255,.34), transparent 50%)",
    surface: "rgba(15, 33, 74, 0.76)",
    surfaceAlt: "rgba(12, 27, 60, 0.72)",
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
    bg: "linear-gradient(180deg, #0b2319 0%, #133326 60%, #0c241b 100%)",
    heroBg: "radial-gradient(circle at 20% 10%, rgba(77,200,146,.28), transparent 52%)",
    surface: "rgba(17, 46, 34, 0.78)",
    surfaceAlt: "rgba(14, 38, 29, 0.72)",
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
    bg: "linear-gradient(180deg, #101114 0%, #17181d 60%, #0f1013 100%)",
    heroBg: "radial-gradient(circle at 20% 10%, rgba(255,255,255,.08), transparent 52%)",
    surface: "rgba(30, 31, 37, 0.82)",
    surfaceAlt: "rgba(26, 27, 33, 0.76)",
    text: "#f4f4f5",
    muted: "rgba(235, 235, 239, .72)",
    border: "rgba(255, 255, 255, .2)",
    primary: "#f1f1f2",
    primaryText: "#151515",
    secondary: "rgba(255, 255, 255, .08)",
    secondaryText: "#f4f4f5",
    accent: "#b5b8c3",
  },
  "warm-neutral": {
    bg: "linear-gradient(180deg, #f6f1e8 0%, #ece4d8 60%, #f5efe6 100%)",
    heroBg: "radial-gradient(circle at 20% 10%, rgba(198,165,116,.27), transparent 52%)",
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
    bg: "linear-gradient(180deg, #231132 0%, #34174a 60%, #210f2f 100%)",
    heroBg: "radial-gradient(circle at 20% 10%, rgba(255,90,126,.24), transparent 52%)",
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
    if (mode === "presentation") {
      body.classList.add("sample-presentation-mode");
    } else {
      body.classList.remove("sample-presentation-mode");
    }
    return () => body.classList.remove("sample-presentation-mode");
  }, [mode]);

  const visualVars = useMemo(() => {
    const style = STYLE_PRESETS[stylePreset];
    const color = COLOR_PRESETS[colorPreset];
    return {
      "--sd-bg": color.bg,
      "--sd-hero-bg": color.heroBg,
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

  return (
    <div className={`sample-standalone ${mode === "presentation" ? "is-presentation" : "is-edit"}`} style={visualVars}>
      {mode === "edit" && (
        <section className="sample-editor-controls">
          <div className="container">
            <div className="sample-editor-card">
              <div className="sample-editor-header">
                <h2 style={{ margin: 0 }}>Edit Mode</h2>
                <button type="button" className="btn ghost" onClick={() => setMode("presentation")}>
                  Switch to Presentation Mode
                </button>
              </div>

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
          </div>
        </section>
      )}

      {mode === "presentation" && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container" style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="btn ghost" onClick={() => setMode("edit")}>
              Back to Edit Mode
            </button>
          </div>
        </section>
      )}

      <header className="sample-hero">
        <div className="container">
          <div className="sample-hero-inner">
            <div className="sample-brand-badge">Website Draft</div>
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
        </div>
      </header>

      <section className="section sample-section">
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

      <section className="section sample-section">
        <div className="container">
          <div className="panel sample-panel">
            <h2 className="sample-h2">{draft.aboutTitle}</h2>
            <p className="sample-sub" style={{ margin: 0 }}>{draft.aboutText}</p>
          </div>
        </div>
      </section>

      <section className="section sample-section">
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
    </div>
  );
}
