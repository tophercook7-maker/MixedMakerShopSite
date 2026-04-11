import type { ClientConfig } from "../../types/client";
import { freshCutPropertyCareClient } from "./fresh-cut-property-care";
import { diamondEdgePressureWashingClient } from "./diamond-edge-pressure-washing";
import { hotSpringsLandscapeCoClient } from "./hot-springs-landscape-co";
import { hotSpringsHaulOffClient } from "./hot-springs-haul-off";
import { naturalStatePaintingClient } from "./natural-state-painting";
import { ridgeviewRoofingClient } from "./ridgeview-roofing";

export const CLIENTS: Record<string, ClientConfig> = {
  "fresh-cut-property-care": freshCutPropertyCareClient,
  "diamond-edge-pressure-washing": diamondEdgePressureWashingClient,
  "hot-springs-landscape-co": hotSpringsLandscapeCoClient,
  "hot-springs-haul-off": hotSpringsHaulOffClient,
  "natural-state-painting": naturalStatePaintingClient,
  "ridgeview-roofing": ridgeviewRoofingClient,
};

/** Which client this build targets — set `PUBLIC_SITE_CLIENT` in `.env` / CI to swap deployments. */
export function getActiveClientKey(): string {
  return import.meta.env.PUBLIC_SITE_CLIENT ?? "fresh-cut-property-care";
}

export function getActiveClient(): ClientConfig {
  const key = getActiveClientKey();
  const client = CLIENTS[key];
  if (!client) {
    throw new Error(
      `Unknown PUBLIC_SITE_CLIENT "${key}". Valid keys: ${Object.keys(CLIENTS).join(", ")}`,
    );
  }
  return client;
}

export {
  freshCutPropertyCareClient,
  diamondEdgePressureWashingClient,
  hotSpringsLandscapeCoClient,
  hotSpringsHaulOffClient,
  naturalStatePaintingClient,
  ridgeviewRoofingClient,
};
