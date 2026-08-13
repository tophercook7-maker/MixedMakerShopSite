export type LocationDefinition = {
  id: string;
  city: string;
  state: string;
  stateAbbr: string;
  /** Suffix used in URL slugs, e.g. hot-springs-ar */
  slugSuffix: string;
  /** Neighborhoods / nearby areas to mention on-page */
  nearbyAreas: readonly string[];
  /** Short local flavor for intros (optional helper copy) */
  localNote?: string;
};

export const LOCATIONS: readonly LocationDefinition[] = [
  {
    id: "hot-springs-ar",
    city: "Hot Springs",
    state: "Arkansas",
    stateAbbr: "AR",
    slugSuffix: "hot-springs-ar",
    nearbyAreas: ["Lake Hamilton", "Pleasant Hill", "Rockwell", "Mountain Pine", "National Park area"],
    localNote: "Busy residential streets and vacation homes near the lakes.",
  },
  {
    id: "hot-springs-village-ar",
    city: "Hot Springs Village",
    state: "Arkansas",
    stateAbbr: "AR",
    slugSuffix: "hot-springs-village-ar",
    nearbyAreas: ["West Gate area", "Lake Cortez", "Lake Desoto", "Magellan Golf area", "DeSoto Blvd corridor"],
    localNote: "Golf-course lots, wooded lots, and seasonal residents who need dependable scheduling.",
  },
  {
    id: "lake-hamilton-ar",
    city: "Lake Hamilton",
    state: "Arkansas",
    stateAbbr: "AR",
    slugSuffix: "lake-hamilton-ar",
    nearbyAreas: ["Hot Springs National Park", "Red Oak", "Royal", "Lake Hamilton islands & coves"],
    localNote: "Steep lake lots, waterfront access, and cleanup that respects shoreline plantings.",
  },
] as const;

const byId = Object.fromEntries(LOCATIONS.map((l) => [l.id, l])) as Record<string, LocationDefinition>;

export function getLocationDefinition(id: string): LocationDefinition {
  const loc = byId[id];
  if (!loc) throw new Error(`Unknown location id: ${id}`);
  return loc;
}
