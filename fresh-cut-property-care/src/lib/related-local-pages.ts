import type { LocalPage } from "../types/local-seo";
import { getLocationDefinition } from "../data/locations";

export type RelatedLink = {
  href: string;
  label: string;
};

function pageLabel(page: LocalPage): string {
  const loc = getLocationDefinition(page.locationId);
  return `${page.serviceName} — ${loc.city}`;
}

/** Other services in the same city (different `serviceKey` than the current page). */
export function getSameCityServiceLinks(current: LocalPage, all: readonly LocalPage[]): RelatedLink[] {
  const links = all
    .filter(
      (p) =>
        p.locationId === current.locationId &&
        p.slug !== current.slug &&
        p.serviceKey !== current.serviceKey,
    )
    .map((p) => ({ href: `/${p.slug}`, label: pageLabel(p) }));
  return dedupeByHref(links).sort((a, b) => a.label.localeCompare(b.label));
}

/** Same service in other locations we have pages for. */
export function getSameServiceLocationLinks(current: LocalPage, all: readonly LocalPage[]): RelatedLink[] {
  const links = all
    .filter((p) => p.serviceKey === current.serviceKey && p.slug !== current.slug)
    .map((p) => ({ href: `/${p.slug}`, label: pageLabel(p) }));
  return dedupeByHref(links).sort((a, b) => a.label.localeCompare(b.label));
}

function dedupeByHref(links: RelatedLink[]): RelatedLink[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}
