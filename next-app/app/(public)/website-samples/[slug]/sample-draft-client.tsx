"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ResilientCardImage,
  ResilientGalleryImage,
  ResilientHeroImage,
} from "@/components/sample/resilient-sample-images";
import {
  inferImageCategoryFromDraftPick,
  type SampleImageCategory,
} from "@/lib/sample-fallback-images";
import { SIGNATURE_MOCKUP_FOOTER_BRAND, SIGNATURE_MOCKUP_FOOTER_SUB } from "@/lib/crm-mockup";
import { inferGallerySectionLead, inferServicesSectionLead } from "@/lib/sample-section-copy";
import type {
  SampleDraft,
  SampleDraftColorPreset as ColorPreset,
  SampleDraftEmbedOptions,
  SampleDraftStylePreset as StylePreset,
} from "@/lib/sample-draft-types";

export type { SampleDraft, SampleDraftEmbedOptions };

type Mode = "edit" | "presentation";

type Props = {
  initialDraft: SampleDraft;
  initialMode: Mode;
  embedOptions?: SampleDraftEmbedOptions;
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
  { id: "wellness", label: "Wellness (layered sand & sage)" },
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
  /**
   * Layered sand, sage, stone, and clay — no stark white full-page default.
   * Use for wellness and similar calm local-service mockups.
   */
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

function withDraftDefaults(d: SampleDraft): SampleDraft {
  return {
    ...d,
    gallerySectionTitle: d.gallerySectionTitle ?? "Gallery",
    galleryImages: d.galleryImages ?? [],
    whyChooseTitle: d.whyChooseTitle ?? "Why choose us",
    whyChooseBullets: d.whyChooseBullets ?? [],
  };
}

export function SampleDraftClient({ initialDraft, initialMode, embedOptions }: Props) {
  const lockPresentation = Boolean(embedOptions?.lockPresentation);
  const [mode, setMode] = useState<Mode>(lockPresentation ? "presentation" : initialMode);
  const [stylePreset, setStylePreset] = useState<StylePreset>(embedOptions?.initialStylePreset ?? "clean-modern");
  const [colorPreset, setColorPreset] = useState<ColorPreset>(embedOptions?.initialColorPreset ?? "blue");
  const [draft, setDraft] = useState<SampleDraft>(() => withDraftDefaults(initialDraft));

  useEffect(() => {
    setDraft(withDraftDefaults(initialDraft));
  }, [initialDraft]);

  useEffect(() => {
    if (embedOptions?.initialStylePreset) setStylePreset(embedOptions.initialStylePreset);
  }, [embedOptions?.initialStylePreset]);

  useEffect(() => {
    if (embedOptions?.initialColorPreset) setColorPreset(embedOptions.initialColorPreset);
  }, [embedOptions?.initialColorPreset]);

  useEffect(() => {
    if (lockPresentation) setMode("presentation");
  }, [lockPresentation]);

  useEffect(() => {
    const body = document.body;
    if (!lockPresentation) {
      body.classList.add("sample-draft-mode");
    }
    if (mode === "presentation") {
      body.classList.add("sample-presentation-mode");
    } else {
      body.classList.remove("sample-presentation-mode");
    }
    return () => {
      body.classList.remove("sample-presentation-mode");
      if (!lockPresentation) {
        body.classList.remove("sample-draft-mode");
      }
    };
  }, [mode, lockPresentation]);

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
  const simpleCv = Boolean(embedOptions?.simpleConversionLayout);
  const galleryList = simpleCv ? [] : (draft.galleryImages ?? []);
  const whyBullets = draft.whyChooseBullets ?? [];
  const secondaryHref = embedOptions?.secondaryHref ?? "/website-samples";
  const portfolioCopy = Boolean(embedOptions?.portfolioCopy);
  const singleHeroCta = Boolean(embedOptions?.lockPresentation);
  const mailHref = draft.contactEmail?.trim()
    ? `mailto:${encodeURIComponent(draft.contactEmail.trim())}`
    : "";
  const facebookHref = (() => {
    const raw = draft.contactFacebookUrl?.trim() || "";
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  })();
  const trustQuoteCount = simpleCv ? 0 : (draft.trustQuotes?.length ?? 0);
  const showWhyOrTrust = whyBullets.length > 0 || trustQuoteCount > 0;
  const testimonialsFirst = !simpleCv && Boolean(embedOptions?.testimonialsBeforeTrustBullets);
  const imageCategory: SampleImageCategory =
    embedOptions?.imageCategoryKey ?? inferImageCategoryFromDraftPick(draft);
  const servicesLead = inferServicesSectionLead(draft, portfolioCopy);
  const galleryLead = inferGallerySectionLead(draft, portfolioCopy);
  const aboutBeforeTrust = Boolean(embedOptions?.aboutBeforeTrust);
  const servicesNavLabel = draft.servicesNavLabel ?? "Services";
  const serviceCardHref = draft.serviceCardsLinkToContact ? "#contact" : telHref;
  const serviceCardLabel = draft.serviceCardsLinkToContact
    ? (draft.serviceCardContactCtaLabel ?? "Learn more")
    : draft.heroPrimaryCta;
  const exportPayload = useMemo(
    () => ({
      mode,
      style_preset: stylePreset,
      color_preset: colorPreset,
      draft,
    }),
    [mode, stylePreset, colorPreset, draft],
  );

  const aboutSection =
    simpleCv || !String(draft.aboutText || "").trim() ? null : (
      <section className="section sample-section" id="about">
        <div className="container">
          <h2 className="sample-h2">{draft.aboutTitle}</h2>
          <p className="sample-sub sample-about-body">{draft.aboutText}</p>
          {draft.aboutCtaLabel ? (
            <div className="btn-row" style={{ marginTop: 22 }}>
              <a href={telHref} className="btn gold">
                {draft.aboutCtaLabel}
              </a>
            </div>
          ) : null}
        </div>
      </section>
    );

  const whyTrustSection =
    showWhyOrTrust ? (
      <section className="section sample-section sample-why-trust" id="why">
        <div className="container">
          {testimonialsFirst ? (
            <>
              {trustQuoteCount > 0 ? (
                <>
                  <h2 className="sample-h2">{draft.trustTitle}</h2>
                  <div className="sample-testimonial-grid">
                    {draft.trustQuotes!.map((entry) => (
                      <blockquote key={entry.by} className="sample-quote-minimal">
                        <p className="sample-quote-text">&ldquo;{entry.quote}&rdquo;</p>
                        <footer className="sample-quote-by">— {entry.by}</footer>
                      </blockquote>
                    ))}
                  </div>
                </>
              ) : null}
              {whyBullets.length > 0 ? (
                <>
                  <h2 className={`sample-h2${trustQuoteCount > 0 ? " sample-h2-trust-follow" : ""}`}>
                    {draft.whyChooseTitle}
                  </h2>
                  <div className="sample-why-grid">
                    {whyBullets.map((line, idx) => (
                      <div key={idx} className="sample-why-card">
                        <span className="sample-why-index" aria-hidden="true">
                          {idx + 1}
                        </span>
                        <p className="sample-why-text">{line}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <>
              {whyBullets.length > 0 ? (
                <>
                  <h2 className="sample-h2">{draft.whyChooseTitle}</h2>
                  <div className="sample-why-grid">
                    {whyBullets.map((line, idx) => (
                      <div key={idx} className="sample-why-card">
                        <span className="sample-why-index" aria-hidden="true">
                          {idx + 1}
                        </span>
                        <p className="sample-why-text">{line}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              {trustQuoteCount > 0 ? (
                <>
                  <h2 className={`sample-h2${whyBullets.length > 0 ? " sample-h2-trust-follow" : ""}`}>
                    {draft.trustTitle}
                  </h2>
                  <div className="sample-testimonial-grid">
                    {draft.trustQuotes!.map((entry) => (
                      <blockquote key={entry.by} className="sample-quote-minimal">
                        <p className="sample-quote-text">&ldquo;{entry.quote}&rdquo;</p>
                        <footer className="sample-quote-by">— {entry.by}</footer>
                      </blockquote>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    ) : null;

  const aboutAndTrustOrdered = simpleCv ? (
    <>{whyTrustSection}</>
  ) : aboutBeforeTrust ? (
    <>
      {aboutSection}
      {whyTrustSection}
    </>
  ) : (
    <>
      {whyTrustSection}
      {aboutSection}
    </>
  );

  const updateField = (field: keyof SampleDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const ctaSuggestions = useMemo(() => {
    const hay = `${draft.offeringsTitle} ${draft.tagline} ${draft.businessName} ${draft.heroHeadline}`.toLowerCase();
    if (
      hay.includes("pressure") ||
      hay.includes("power wash") ||
      hay.includes("soft wash") ||
      (hay.includes("wash") && hay.includes("exterior"))
    ) {
      return ["Request a Quote", "Call Now", "Get a Free Estimate", "View Services"];
    }
    if (hay.includes("coffee")) {
      return ["Order Ahead", "Skip the Line", "Visit Us Today", "See Today's Specials"];
    }
    if (hay.includes("restaurant") || hay.includes("menu")) {
      return ["Reserve a Table", "Order Online", "Call Now", "View Menu"];
    }
    if (hay.includes("church")) {
      return ["Plan Your Visit", "Service Times", "Join Us Sunday", "Contact Us"];
    }
    if (hay.includes("plumbing")) {
      return ["Call Now", "Request Service", "Emergency Help", "Book a Repair"];
    }
    if (hay.includes("lawn")) {
      return ["Get a Quick Quote", "Request Service", "Call Now", "Schedule This Week"];
    }
    if (hay.includes("massage") || hay.includes("yoga") || hay.includes("wellness") || hay.includes("sound bath")) {
      return ["Book a Session", "Schedule Now", "Explore Services", "Call to Book"];
    }
    return ["Get Started", "Call Now", "Contact Us", "Learn More"];
  }, [draft.offeringsTitle, draft.tagline]);

  const site = (
    <>
      {mode === "presentation" && (
        <nav className="sample-site-nav">
          <div className="container sample-site-nav-inner">
            <a href="#top" className="sample-site-brand">
              {draft.businessName}
            </a>
            <div className="sample-site-links">
              <a href="#services">{servicesNavLabel}</a>
              {!simpleCv && galleryList.length ? <a href="#gallery">Gallery</a> : null}
              {showWhyOrTrust ? <a href="#why">Why choose us</a> : null}
              {!simpleCv ? <a href="#about">About</a> : null}
              {simpleCv ? (
                <a href="#cta">{draft.finalCta || "Get started"}</a>
              ) : (
                <a href="#contact">Contact</a>
              )}
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
              {draft.localPositioning ? (
                <p className={`sample-local${simpleCv ? " sample-mockup-trust-line" : ""}`}>
                  {draft.localPositioning}
                </p>
              ) : null}
              <div className="btn-row">
                <a href={telHref} className="btn gold">
                  {draft.heroPrimaryCta}
                </a>
                {!singleHeroCta ? (
                  secondaryHref.startsWith("/") && !secondaryHref.startsWith("/#") ? (
                    <Link href={secondaryHref} className="btn ghost">
                      {draft.heroSecondaryCta}
                    </Link>
                  ) : (
                    <a href={secondaryHref} className="btn ghost">
                      {draft.heroSecondaryCta}
                    </a>
                  )
                ) : null}
              </div>
            </div>
            <figure className="sample-hero-spotlight" aria-label={draft.heroImageAlt ?? `${draft.businessName} featured image`}>
              <ResilientHeroImage
                primarySrc={draft.heroImageUrl}
                category={imageCategory}
                alt={draft.heroImageAlt ?? `${draft.businessName} featured image`}
              />
              <div className="sample-hero-image-overlay" aria-hidden="true" />
            </figure>
          </div>
        </div>
      </header>

      <section className="section sample-section" id="services">
        <div className="container">
          <h2 className="sample-h2">{draft.offeringsTitle}</h2>
          <p className="sample-sub sample-section-lead">{servicesLead}</p>
          {simpleCv ? (
            <ul className="sample-mockup-service-list">
              {draft.offerings.map((item) => (
                <li key={item.name} className="sample-mockup-service-item">
                  <span className="sample-mockup-service-name">{item.name}</span>
                  {item.text ? (
                    <span className="sample-mockup-service-note"> — {item.text}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="how-it-works-grid sample-service-grid">
              {draft.offerings.map((item) => (
                <article key={item.name} className="how-it-works-card sample-service-card">
                  <ResilientCardImage
                    primarySrc={item.image}
                    category={imageCategory}
                    alt={item.imageAlt ?? `${item.name} — ${draft.businessName}`}
                    className="sample-service-card-image"
                    placeholderClassName="sample-service-card-placeholder"
                  />
                  <h3 className="how-it-works-title">{item.name}</h3>
                  <p className="how-it-works-copy">{item.text}</p>
                  <a href={serviceCardHref} className="sample-service-card-cta">
                    {serviceCardLabel}
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {galleryList.length ? (
        <section className="section sample-section sample-gallery-section" id="gallery">
          <div className="container">
            <h2 className="sample-h2">{draft.gallerySectionTitle}</h2>
            <p className="sample-sub sample-section-lead">{galleryLead}</p>
            <div className="sample-gallery-grid">
              {galleryList.map((src, idx) => (
                <ResilientGalleryImage
                  key={`${src}-${idx}`}
                  primarySrc={src}
                  category={imageCategory}
                  alt={draft.galleryImageAlts?.[idx] ?? `${draft.businessName} gallery photo ${idx + 1}`}
                  className="sample-gallery-tile"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {aboutAndTrustOrdered}

      <section className="section sample-section sample-mid-cta" id="cta">
        <div className="container sample-mid-cta-inner">
          <h2 className="sample-mid-cta-title">{draft.finalTitle}</h2>
          <p className="sample-mid-cta-sub">{draft.finalSub}</p>
          <a href={telHref} className="btn gold sample-mid-cta-btn">
            {draft.finalCta}
          </a>
        </div>
      </section>

      {!simpleCv ? (
        <section className="section sample-section sample-contact-block" id="contact">
          <div className="container">
            <h2 className="sample-h2">{draft.locationTitle}</h2>
            <div className="sample-contact-grid">
              <div className="sample-contact-cell">
                <span className="sample-contact-k">Phone</span>
                <a href={telHref} className="sample-contact-v">
                  {draft.phone}
                </a>
              </div>
              {mailHref ? (
                <div className="sample-contact-cell">
                  <span className="sample-contact-k">Email</span>
                  <a href={mailHref} className="sample-contact-v">
                    {draft.contactEmail}
                  </a>
                </div>
              ) : null}
              {facebookHref ? (
                <div className="sample-contact-cell">
                  <span className="sample-contact-k">Facebook</span>
                  <a href={facebookHref} className="sample-contact-v" target="_blank" rel="noopener noreferrer">
                    Profile
                  </a>
                </div>
              ) : null}
              <div className="sample-contact-cell sample-contact-cell-span">
                <span className="sample-contact-k">Location</span>
                <p className="sample-contact-v sample-contact-plain">{draft.locationName}</p>
                <p className="sample-contact-v sample-contact-plain">{draft.address}</p>
              </div>
              <div className="sample-contact-cell sample-contact-cell-span">
                <span className="sample-contact-k">Hours</span>
                <ul className="sample-hours-list">
                  {draft.hours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {embedOptions?.portfolioFooter || (singleHeroCta && simpleCv) ? (
        <footer className="section sample-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <p
              className="small"
              style={{
                margin: 0,
                textAlign: "center",
                opacity: 0.88,
                maxWidth: 560,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.5,
              }}
            >
              {embedOptions?.portfolioFooterMessage?.trim() ||
                "Design concept for a local business website — built to show layout, structure, and flow."}
            </p>
            {simpleCv ? (
              <>
                <p className="sample-mockup-brand-mark">{SIGNATURE_MOCKUP_FOOTER_BRAND}</p>
                <p className="sample-mockup-brand-sub">{SIGNATURE_MOCKUP_FOOTER_SUB}</p>
              </>
            ) : null}
          </div>
        </footer>
      ) : null}
    </>
  );

  const wideClass = embedOptions?.wideLayout ? " sample-standalone--wide" : "";

  if (lockPresentation) {
    return (
      <div className={`sample-standalone is-presentation${wideClass}`} style={visualVars}>
        {site}
      </div>
    );
  }

  return (
    <div
      className={`sample-standalone ${mode === "presentation" ? "is-presentation" : "is-edit"}${wideClass}`}
      style={visualVars}
    >
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

              <div className="sample-cta-suggestions" style={{ marginTop: 12 }}>
                {ctaSuggestions.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="mini"
                    onClick={() => updateField("heroPrimaryCta", label)}
                    title="Use as primary CTA"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <details style={{ marginTop: 14 }}>
                <summary style={{ cursor: "pointer", fontWeight: 800 }}>Export Draft State</summary>
                <pre className="sample-export">{JSON.stringify(exportPayload, null, 2)}</pre>
              </details>
            </div>
          </aside>
          <div className="sample-live-canvas">{site}</div>
        </div>
      ) : (
        site
      )}
    </div>
  );
}
