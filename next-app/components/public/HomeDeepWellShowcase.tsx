"use client";

import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
import { HomeLiveSitesOutro } from "@/components/public/HomeLiveSitesOutro";

/**
 * Legacy bundle for routes that still import a single “deep well / live sites” block.
 * Composes the featured real-site grid + closing CTA (same content as the main homepage sequence).
 */
export function HomeDeepWellShowcase() {
  return (
    <>
      <HomeFeaturedWebDesignWork variant="light" />
      <HomeLiveSitesOutro />
    </>
  );
}
