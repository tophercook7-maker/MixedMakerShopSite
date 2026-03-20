"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SAMPLE_CATEGORY_FALLBACK_HERO,
  SAMPLE_ULTIMATE_FALLBACK_HERO,
  type SampleImageCategory,
  isNonEmptyImageUrl,
} from "@/lib/sample-fallback-images";

type HeroStage = "primary" | "category" | "ultimate" | "none";

function devLog(payload: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[SampleHeroImage]", payload);
  }
}

export function ResilientHeroImage({
  primarySrc,
  category,
  alt,
}: {
  primarySrc: string | null | undefined;
  category: SampleImageCategory;
  alt: string;
}) {
  const categoryUrl = SAMPLE_CATEGORY_FALLBACK_HERO[category] ?? SAMPLE_CATEGORY_FALLBACK_HERO["default-service-business"];
  const hasPrimary = isNonEmptyImageUrl(primarySrc);

  const initialStage: HeroStage = hasPrimary ? "primary" : "category";

  const [stage, setStage] = useState<HeroStage>(initialStage);

  useEffect(() => {
    setStage(hasPrimary ? "primary" : "category");
  }, [primarySrc, hasPrimary]);

  useEffect(() => {
    devLog({
      event: "hero_mount",
      category,
      originalHero: primarySrc ?? null,
      initialStage: hasPrimary ? "primary" : "category",
      categoryFallback: categoryUrl,
      ultimateFallback: SAMPLE_ULTIMATE_FALLBACK_HERO,
    });
  }, [category, primarySrc, hasPrimary, categoryUrl]);

  const src = useMemo(() => {
    if (stage === "primary" && hasPrimary) return String(primarySrc).trim();
    if (stage === "category") return categoryUrl;
    if (stage === "ultimate") return SAMPLE_ULTIMATE_FALLBACK_HERO;
    return null;
  }, [stage, hasPrimary, primarySrc, categoryUrl]);

  const onError = useCallback(() => {
    setStage((prev) => {
      devLog({
        event: "hero_error",
        route: typeof window !== "undefined" ? window.location.pathname : "",
        stage: prev,
        category,
        originalHero: primarySrc ?? null,
      });
      if (prev === "primary") {
        devLog({ fallbackTo: "category", chosen: categoryUrl });
        return "category";
      }
      if (prev === "category") {
        devLog({ fallbackTo: "ultimate", chosen: SAMPLE_ULTIMATE_FALLBACK_HERO });
        return "ultimate";
      }
      if (prev === "ultimate") {
        devLog({ fallbackTo: "gradient-only" });
        return "none";
      }
      return prev;
    });
  }, [category, categoryUrl, primarySrc]);

  if (stage === "none" || !src) {
    return <div className="sample-hero-fallback sample-hero-fallback-solid" aria-hidden="true" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={`${stage}-${src}`} src={src} alt={alt} onError={onError} loading="eager" decoding="async" />
  );
}

type CardStage = "primary" | "category" | "ultimate" | "none";

export function ResilientCardImage({
  primarySrc,
  category,
  alt,
  className,
  placeholderClassName,
}: {
  primarySrc: string | null | undefined;
  category: SampleImageCategory;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const categoryUrl = SAMPLE_CATEGORY_FALLBACK_HERO[category];
  const hasPrimary = isNonEmptyImageUrl(primarySrc);
  const [stage, setStage] = useState<CardStage>(hasPrimary ? "primary" : "category");

  useEffect(() => {
    setStage(hasPrimary ? "primary" : "category");
  }, [primarySrc, hasPrimary]);

  const src =
    stage === "primary" && hasPrimary
      ? String(primarySrc).trim()
      : stage === "category"
        ? categoryUrl
        : stage === "ultimate"
          ? SAMPLE_ULTIMATE_FALLBACK_HERO
          : null;

  const onError = useCallback(() => {
    setStage((prev) => {
      if (process.env.NODE_ENV === "development") {
        console.info("[SampleCardImage] load failed", { stage: prev, category, primarySrc });
      }
      if (prev === "primary") return "category";
      if (prev === "category") return "ultimate";
      return "none";
    });
  }, [category, primarySrc]);

  if (stage === "none" || !src) {
    return <div className={placeholderClassName ?? "sample-service-card-placeholder"} aria-hidden="true" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${stage}-${src}`}
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ResilientGalleryImage({
  primarySrc,
  category,
  alt,
  className,
}: {
  primarySrc: string | null | undefined;
  category: SampleImageCategory;
  alt: string;
  className?: string;
}) {
  return (
    <ResilientCardImage
      primarySrc={primarySrc}
      category={category}
      alt={alt}
      className={className}
      placeholderClassName="sample-gallery-tile sample-gallery-tile-fallback"
    />
  );
}
