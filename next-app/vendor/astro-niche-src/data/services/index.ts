import type { NicheKey } from "../../types/niche";
import type { NicheServiceDefinition } from "../../types/service-catalog";
import { LAWN_CARE_CATALOG } from "./lawn-care";
import { PRESSURE_WASHING_CATALOG } from "./pressure-washing";
import { LANDSCAPING_CATALOG } from "./landscaping";
import { JUNK_REMOVAL_CATALOG } from "./junk-removal";
import { PAINTING_CATALOG } from "./painting";
import { ROOFING_CATALOG } from "./roofing";

export const SERVICE_CATALOGS: Record<NicheKey, Record<string, NicheServiceDefinition>> = {
  "lawn-care": LAWN_CARE_CATALOG,
  "pressure-washing": PRESSURE_WASHING_CATALOG,
  landscaping: LANDSCAPING_CATALOG,
  "junk-removal": JUNK_REMOVAL_CATALOG,
  painting: PAINTING_CATALOG,
  roofing: ROOFING_CATALOG,
};

export function getServiceCatalog(nicheKey: NicheKey): Record<string, NicheServiceDefinition> {
  return SERVICE_CATALOGS[nicheKey];
}

export function getServiceDefinition(nicheKey: NicheKey, serviceKey: string): NicheServiceDefinition | undefined {
  return getServiceCatalog(nicheKey)[serviceKey];
}
