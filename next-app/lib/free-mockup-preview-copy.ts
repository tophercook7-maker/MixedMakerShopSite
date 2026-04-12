import type { FunnelDesignDirectionId } from "@/lib/funnel-design-directions";
import type { FunnelDesiredOutcomeId } from "@/lib/funnel-desired-outcomes";
import { FUNNEL_DESIRED_OUTCOME_WHY_LINES } from "@/lib/funnel-desired-outcomes";

export type PreviewBusinessKind = "local-service" | "creative" | "digital" | "web-agency" | "general";

export type FreeMockupPreviewCopyInput = {
  businessName: string;
  businessType: string;
  city: string;
  servicesText: string;
  /** “What makes you different” */
  differentiator: string;
  specialOffer: string;
  designDirection: FunnelDesignDirectionId | "" | undefined;
  desiredOutcomes: FunnelDesiredOutcomeId[];
  isFreshCutFunnel: boolean;
};

export type PreviewServiceCard = { title: string; description: string };

export type FreeMockupPreviewCopy = {
  headline: string;
  subheadline: string;
  businessNameLine: string;
  services: PreviewServiceCard[];
  trustTitle: string;
  trustBullets: string[];
  ctaLabel: string;
  ctaSupport: string;
  isSparse: boolean;
};

const FALLBACK_HEADLINE = "Your business, presented clearly online";
const FALLBACK_SUB =
  "A clean, modern website preview designed to help customers understand what you offer and feel confident reaching out.";

function parseServiceLines(raw: string): string[] {
  return raw
    .split(/\n|,|·|;/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function cleanPhrase(s: string, maxLen: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function titleCaseHeadlinePhrase(s: string): string {
  const t = s.trim();
  if (!t) return t;
  const lower = t.toLowerCase();
  if (/^your services$/i.test(lower)) return "Your services";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function firstSegment(raw: string): string {
  const t = raw.split(/[,·|]/)[0]?.trim() ?? raw.trim();
  return t;
}

/** Lowercase, strip punctuation — for duplicate checks only. */
function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the first service line is effectively the business name (avoid “Trusted Acme in …” echoing the brand row). */
function serviceLineLooksLikeBusinessName(serviceLine: string, businessName: string): boolean {
  const sn = normalizeKey(serviceLine);
  const bn = normalizeKey(businessName);
  if (!sn || !bn) return false;
  if (sn === bn) return true;
  if (bn === sn || bn.startsWith(`${sn} `) || bn.endsWith(` ${sn}`)) return true;
  if (sn.startsWith(`${bn} `) || sn.includes(` ${bn} `)) return true;
  const bw = bn.split(/\s+/).filter((w) => w.length > 2);
  const sw = sn.split(/\s+/);
  if (bw.length >= 2 && sw.length >= 2) {
    const b2 = bw.slice(0, 2).join(" ");
    const s2 = sw.slice(0, 2).join(" ");
    if (b2 === s2) return true;
  }
  return false;
}

/**
 * Pick a service/type phrase for headlines when the first parsed line mirrors the legal/display name.
 */
function headlineOfferPhrase(
  services: string[],
  businessName: string,
  typeSeg: string,
): { phrase: string; fromService: boolean } {
  for (const raw of services) {
    if (!serviceLineLooksLikeBusinessName(raw, businessName)) {
      return { phrase: titleCaseHeadlinePhrase(raw), fromService: true };
    }
  }
  if (typeSeg && !serviceLineLooksLikeBusinessName(typeSeg, businessName)) {
    return { phrase: titleCaseHeadlinePhrase(typeSeg), fromService: false };
  }
  return { phrase: "", fromService: false };
}

function headlineStartsWithOrLeadsWithBusinessName(businessName: string, headline: string): boolean {
  const bn = normalizeKey(businessName);
  const hn = normalizeKey(headline);
  if (!bn || !hn) return false;
  if (hn.startsWith(bn)) return true;
  const bTokens = bn.split(/\s+/).filter(Boolean);
  const hTokens = hn.split(/\s+/).filter(Boolean);
  if (bTokens.length && hTokens.length >= bTokens.length) {
    const hLead = hTokens.slice(0, bTokens.length).join(" ");
    if (hLead === bn) return true;
  }
  return false;
}

/**
 * If the full business name appears inside the hero line, it usually duplicates the brand row.
 * Require a minimum name length to avoid noisy matches on very short strings.
 */
function headlineContainsFullBusinessName(businessName: string, headline: string): boolean {
  const bn = normalizeKey(businessName);
  const hn = normalizeKey(headline);
  if (!bn || !hn || bn.length < 6) return false;
  return hn.includes(bn);
}

/** Echo like “lawn care lawn care” — repeated bigram. */
function headlineHasStutteredServiceEcho(headline: string): boolean {
  const hn = normalizeKey(headline);
  return /\b(\w{3,}\s+\w{3,})\s+\1\b/.test(hn);
}

function localServiceBenefitHeadline(primaryLabel: string, city: string): string {
  const p = cleanPhrase(primaryLabel, 48);
  const c = cleanPhrase(city, 44);
  if (p && c) {
    const roll = (p.length + c.length) % 3;
    if (roll === 0) return `Clean, reliable ${p.toLowerCase()} for homes in ${c}`;
    if (roll === 1) return `${p} designed to keep your property looking sharp`;
    return `Trusted ${p} in ${c}`;
  }
  if (p) return `${p}, explained clearly — with an easy next step`;
  return FALLBACK_HEADLINE;
}

/**
 * When the brand row already shows the business name, remove awkward repetition from the hero headline.
 */
function refineHeadlineForBrandRow(
  businessName: string,
  headline: string,
  ctx: {
    kind: PreviewBusinessKind;
    city: string;
    primaryLabel: string;
    typeSeg: string;
    services: string[];
    hasName: boolean;
  },
): string {
  if (!ctx.hasName) return headline;
  const name = businessName.trim();
  const { kind, city, primaryLabel, typeSeg, services } = ctx;
  const badStart = headlineStartsWithOrLeadsWithBusinessName(name, headline);
  const badEmbed = headlineContainsFullBusinessName(name, headline);
  const stutter = headlineHasStutteredServiceEcho(headline);
  const primaryOk = primaryLabel && primaryLabel.toLowerCase() !== "your services";
  const offerPhrase = headlineOfferPhrase(services, name, typeSeg);

  if (!badStart && !badEmbed && !stutter) return headline;

  if (kind === "local-service" && city.trim() && offerPhrase.phrase) {
    return localServiceBenefitHeadline(offerPhrase.phrase, city.trim());
  }
  if (kind === "local-service" && city.trim() && primaryOk) {
    return localServiceBenefitHeadline(primaryLabel, city.trim());
  }
  if (kind === "local-service" && city.trim() && typeSeg) {
    return localServiceBenefitHeadline(titleCaseHeadlinePhrase(typeSeg), city.trim());
  }

  if (kind === "creative") {
    if (typeSeg) return `${cleanPhrase(titleCaseHeadlinePhrase(typeSeg), 44)} — presented for the right clients`;
    return "Portfolio work with a clear next step";
  }
  if (kind === "digital") {
    return "A product homepage visitors can actually understand";
  }
  if (kind === "web-agency") {
    return "Websites that earn attention and inquiries";
  }

  if (city.trim() && offerPhrase.phrase) {
    return `${cleanPhrase(offerPhrase.phrase, 48)} in ${cleanPhrase(city.trim(), 44)}`;
  }
  if (primaryOk && city.trim()) {
    return `${cleanPhrase(primaryLabel, 48)} in ${cleanPhrase(city.trim(), 44)}`;
  }
  if (typeSeg) {
    return `${cleanPhrase(titleCaseHeadlinePhrase(typeSeg), 52)} — clear offers, easy contact`;
  }
  return FALLBACK_HEADLINE;
}

export function inferPreviewBusinessKind(
  businessType: string,
  opts?: { isFreshCutFunnel?: boolean },
): PreviewBusinessKind {
  if (opts?.isFreshCutFunnel) return "local-service";
  const t = businessType.toLowerCase();
  if (/(web design|website designer|website design|web designer|web agency|mixedmaker)/i.test(t)) return "web-agency";
  if (/(photograph|videograph|illustrat|portfolio|fine art|artist|creative studio|graphic design)/i.test(t))
    return "creative";
  if (/(saas|software|app\b|mobile app|platform|api\b|dashboard|startup|product\b|digital tool)/i.test(t))
    return "digital";
  if (
    /(hvac|plumb|electric|lawn|landscap|pressure wash|power wash|cleaning|clean\b|contractor|roof|pest|auto repair|junk|haul|handyman|pool|turf|property care|maintenance|remodel|concrete|painting|tree|irrigation|sprinkler|locksmith|garage door|appliance)/i.test(
      t,
    )
  )
    return "local-service";
  return "general";
}

function describeService(title: string, kind: PreviewBusinessKind, city: string): string {
  const tl = title.toLowerCase();
  const area = city.trim() ? `Customers in ${cleanPhrase(city, 40)}` : "Customers";

  if (/(lawn|mow|grass|yard)/i.test(tl)) {
    return "Keep turf looking neat, healthy, and consistently maintained.";
  }
  if (/(cleanup|clean up|debris|leaf|seasonal)/i.test(tl)) {
    return "Seasonal cleanup and outdoor tidy-up so the property stays presentable.";
  }
  if (/(pressure|power wash|washing)/i.test(tl)) {
    return "Refresh driveways, siding, patios, and walkways with a cleaner finish.";
  }
  if (/(junk|haul|removal)/i.test(tl)) {
    return "Straightforward pickup and hauling with clear pricing and scheduling.";
  }
  if (/(hvac|heat|cool|air)/i.test(tl)) {
    return "Comfort-focused service with clear options and honest recommendations.";
  }
  if (/(plumb|drain|pipe|water heater)/i.test(tl)) {
    return "Dependable repairs and installs with tidy workmanship and clear communication.";
  }
  if (/(electric|wiring|panel|lighting)/i.test(tl)) {
    return "Safe, code-conscious work explained in plain language before anything starts.";
  }
  if (/(clean|maid|sanitize)/i.test(tl)) {
    return "Consistent results and respectful scheduling for homes and small businesses.";
  }
  if (/(roof|gutter)/i.test(tl)) {
    return "Inspection-first guidance and work scoped to what you actually need.";
  }

  if (kind === "creative") {
    return `${area} can quickly see what you do, how you work, and the best way to reach you.`;
  }
  if (kind === "digital") {
    return "Clear explanation of what it does, who it’s for, and what happens next.";
  }
  if (kind === "web-agency") {
    return "Focused messaging that builds trust and makes the next step obvious.";
  }
  if (kind === "local-service") {
    return `${area} get a simple overview, proof of capability, and an easy way to reach out.`;
  }
  return `${area} see what you offer, what to expect, and how to contact you without guesswork.`;
}

function joinServicesForSentence(services: string[], city: string): string {
  const titled = services.map((s) => titleCaseHeadlinePhrase(s));
  const area = city.trim();
  if (!titled.length) {
    return area
      ? `Straightforward information for people searching in ${cleanPhrase(area, 48)} and nearby areas.`
      : "Straightforward information visitors can scan in a few seconds.";
  }
  if (titled.length === 1) {
    return area
      ? `${titled[0]} for homeowners and businesses in ${cleanPhrase(area, 48)} and nearby areas.`
      : `${titled[0]} — explained clearly so visitors know what to expect.`;
  }
  if (titled.length === 2) {
    return area
      ? `${titled[0]} and ${titled[1]} for customers in ${cleanPhrase(area, 48)} and nearby areas.`
      : `${titled[0]} and ${titled[1]}, presented in a clean, scannable layout.`;
  }
  const allButLast = titled.slice(0, -1).join(", ");
  const last = titled[titled.length - 1];
  return area
    ? `${allButLast}, and ${last} for customers in ${cleanPhrase(area, 48)} and nearby areas.`
    : `${allButLast}, and ${last} — each with a short, plain-language summary.`;
}

function goalClause(outcomes: FunnelDesiredOutcomeId[], kind: PreviewBusinessKind, fresh: boolean): string {
  if (!outcomes.length) {
    if (fresh || kind === "local-service") {
      return "Built so visitors can understand your offer and request an estimate without friction.";
    }
    if (kind === "creative") return "Built to showcase your work and make the next step easy.";
    if (kind === "digital") return "Built to explain the product clearly and reduce confusion before signup.";
    if (kind === "web-agency") return "Built to communicate credibility and convert interest into conversations.";
    return "Built to make your offer easy to understand and your contact options easy to find.";
  }
  const first = outcomes[0];
  const second = outcomes[1];
  const a = FUNNEL_DESIRED_OUTCOME_WHY_LINES[first];
  const b = second ? FUNNEL_DESIRED_OUTCOME_WHY_LINES[second] : "";
  const a1 = a.endsWith(".") ? a : `${a}.`;
  if (!b || b === a) return a1;
  const b1 = b.endsWith(".") ? b : `${b}.`;
  return `${a1} ${b1}`;
}

function pickCtaLabel(kind: PreviewBusinessKind, outcomes: FunnelDesiredOutcomeId[], fresh: boolean): string {
  const o = new Set(outcomes);
  if (fresh && (o.has("get_more_calls") || o.size === 0)) return "Request a Free Estimate";
  if (o.has("get_more_calls") && kind === "local-service") return "Request a Free Estimate";
  if (o.has("get_more_calls")) return "Request a Call Back";
  if (o.has("get_more_leads")) return "Get a Quote";
  if (o.has("make_contact_easier")) return "Contact Us Today";
  if (o.has("explain_services_clearly")) return "See Services & Pricing";
  if (kind === "creative") return "View Selected Work";
  if (kind === "digital") return "See How It Works";
  if (kind === "web-agency") return "Book a Consultation";
  if (kind === "local-service") return "Request a Free Estimate";
  return "Request Information";
}

function pickCtaSupport(outcomes: FunnelDesiredOutcomeId[]): string {
  const o = new Set(outcomes);
  if (o.has("get_more_calls") || o.has("get_more_leads")) return "Fast response. Clear next steps.";
  if (o.has("make_contact_easier")) return "Simple, direct contact without the runaround.";
  if (o.has("explain_services_clearly")) return "Plain language, scannable sections, and fewer surprises.";
  return "Reach out today and we can talk through what you need.";
}

function bulletsFromDifferentiator(text: string): string[] {
  const raw = text
    .split(/(?:\n|•|;)+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const sentences = text
    .split(/(?<=[.!?])\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const merged = raw.length > 1 ? raw : sentences;
  return merged.map((s) => cleanPhrase(s, 96)).filter(Boolean).slice(0, 3);
}

function defaultTrustBullets(kind: PreviewBusinessKind, city: string): string[] {
  const area = city.trim();
  if (kind === "local-service") {
    return [
      area ? `Local service focused on ${cleanPhrase(area, 36)} and nearby neighborhoods` : "Local service with clear scheduling",
      "Straightforward communication from the first message",
      "Quality work without unnecessary complexity",
    ];
  }
  if (kind === "creative") {
    return ["Curated project highlights with context", "Easy ways to inquire about availability", "A presentation that matches your standards"];
  }
  if (kind === "digital") {
    return ["Clear product overview and primary benefits", "Guided next steps for new visitors", "Support and FAQs where they actually help"];
  }
  if (kind === "web-agency") {
    return ["Strong first impression for people comparing options", "Clear proof and process, not vague promises", "Contact paths that respect a busy buyer’s time"];
  }
  return ["Clear structure visitors can scan quickly", "Trust cues where they matter most", "Contact options that reduce friction"];
}

function directionToneNote(direction: FunnelDesignDirectionId | "" | undefined): string | null {
  if (!direction) return null;
  switch (direction) {
    case "local-trust":
      return "Friendly local tone with obvious next steps.";
    case "clean-professional":
      return "Polished layout that feels easy to trust at a glance.";
    case "bold-modern":
      return "Confident spacing and typography without clutter.";
    case "premium-polished":
      return "Elevated presentation that still feels grounded.";
    case "simple-direct":
      return "Clarity first: fewer distractions, faster answers.";
    default:
      return null;
  }
}

export function buildFreeMockupPreviewCopy(input: FreeMockupPreviewCopyInput): FreeMockupPreviewCopy {
  const name = input.businessName.trim();
  const city = input.city.trim();
  const typeRaw = input.businessType.trim();
  const typeSeg = firstSegment(typeRaw);
  const services = parseServiceLines(input.servicesText);
  const diff = input.differentiator.trim();
  const offer = input.specialOffer.trim();
  const outcomes = input.desiredOutcomes;
  const kind = inferPreviewBusinessKind(typeRaw, { isFreshCutFunnel: input.isFreshCutFunnel });
  const fresh = input.isFreshCutFunnel;

  const primaryService = services[0] ?? (typeSeg ? cleanPhrase(typeSeg, 56) : "");
  const primaryLabel = primaryService ? titleCaseHeadlinePhrase(primaryService) : titleCaseHeadlinePhrase(typeSeg);

  /** Service/type phrase for hero lines — skips lines that are just the business name in disguise. */
  const offerPick = headlineOfferPhrase(services, name, typeSeg);
  let headlineServiceLabel = offerPick.phrase;
  if (!headlineServiceLabel && typeSeg && !serviceLineLooksLikeBusinessName(typeSeg, name)) {
    headlineServiceLabel = titleCaseHeadlinePhrase(cleanPhrase(typeSeg, 56));
  }

  const hasName = Boolean(name);
  const hasCity = Boolean(city);
  const hasServices = services.length > 0;
  const hasType = Boolean(typeSeg);
  const isSparse = !hasName && !hasCity && !hasServices && !hasType;

  const hsOk = Boolean(headlineServiceLabel && headlineServiceLabel.toLowerCase() !== "your services");

  let headline = FALLBACK_HEADLINE;
  if (!isSparse) {
    if (kind === "local-service" && hasCity && hsOk) {
      headline = `Trusted ${cleanPhrase(headlineServiceLabel, 52)} in ${cleanPhrase(city, 44)}`;
    } else if (kind === "local-service" && hasCity && hasType) {
      headline = `Trusted ${cleanPhrase(titleCaseHeadlinePhrase(typeSeg), 48)} in ${cleanPhrase(city, 44)}`;
    } else if (kind === "creative") {
      headline = hasType
        ? `${cleanPhrase(titleCaseHeadlinePhrase(typeSeg), 44)} — presented for the right clients`
        : "Your portfolio, framed for serious inquiries";
    } else if (kind === "digital") {
      headline = "A product homepage visitors can actually understand";
    } else if (kind === "web-agency") {
      headline = "Websites that earn attention and inquiries";
    } else if (hasCity && hsOk) {
      headline = `${cleanPhrase(headlineServiceLabel, 48)} in ${cleanPhrase(city, 44)}`;
    } else if (hasType && hasCity) {
      headline = `${cleanPhrase(titleCaseHeadlinePhrase(typeSeg), 52)} in ${cleanPhrase(city, 44)}`;
    } else if (hsOk) {
      headline = localServiceBenefitHeadline(headlineServiceLabel, city);
    } else if (hasType) {
      headline = `${cleanPhrase(titleCaseHeadlinePhrase(typeSeg), 52)} — clear offers, easy contact`;
    } else {
      headline = FALLBACK_HEADLINE;
    }
  }

  headline = refineHeadlineForBrandRow(name, headline, {
    kind,
    city,
    primaryLabel: headlineServiceLabel || primaryLabel,
    typeSeg,
    services,
    hasName,
  });

  const subParts: string[] = [];
  if (isSparse) {
    subParts.push(FALLBACK_SUB);
  } else {
    const lead = joinServicesForSentence(services.length ? services : [], city);
    subParts.push(lead.endsWith(".") ? lead : `${lead}.`);
    subParts.push(goalClause(outcomes, kind, fresh));
    const tone = directionToneNote(input.designDirection);
    if (tone && subParts.join(" ").length < 200) subParts.push(tone.endsWith(".") ? tone : `${tone}.`);
  }
  const subheadline = cleanPhrase(subParts.join(" "), 280);

  const businessNameLine = hasName ? name : "Your business name";

  /** Always show 3 service cards in preview: real lines first, then honest “also available” fillers. */
  const serviceTitles: string[] = [];
  for (const s of services.slice(0, 3)) serviceTitles.push(titleCaseHeadlinePhrase(s));
  while (serviceTitles.length < 3) {
    if (serviceTitles.length === 0) {
      serviceTitles.push("Your main services");
      serviceTitles.push("What customers ask for most");
      serviceTitles.push("Seasonal or add-on work");
    } else if (serviceTitles.length === 1) {
      serviceTitles.push("Related services");
      serviceTitles.push("Scheduling & communication");
    } else {
      serviceTitles.push("Additional services");
    }
  }

  const placeholderTitle = new Set([
    "Your main services",
    "What customers ask for most",
    "Seasonal or add-on work",
    "Related services",
    "Scheduling & communication",
    "Additional services",
  ]);

  const servicesCards: PreviewServiceCard[] = serviceTitles.map((title, idx) => {
    const isPlaceholder = placeholderTitle.has(title);
    if (isPlaceholder && !hasServices) {
      return {
        title,
        description:
          title === "Your main services"
            ? "Your core offerings will be highlighted here with short, plain-language summaries."
            : title === "What customers ask for most"
              ? "We’ll feature the requests you get repeatedly so new visitors feel understood."
              : title === "Seasonal or add-on work"
                ? "Optional services and seasonal work can live here without crowding the hero."
                : title === "Related services"
                  ? "Supporting services help visitors choose the right package."
                  : title === "Scheduling & communication"
                    ? "Clear expectations for timing, service area, and how you stay in touch."
                    : "Room for more detail as your offer evolves.",
      };
    }
    if (isPlaceholder && hasServices) {
      return {
        title,
        description: "We can expand this section as we refine your full homepage structure.",
      };
    }
    const originalLine = services[idx] ?? services[0] ?? title;
    return { title, description: describeService(originalLine, kind, city) };
  });

  const trustBullets: string[] = [];
  const pushUnique = (line: string) => {
    const t = cleanPhrase(line, 130);
    if (!t) return;
    const key = t.toLowerCase();
    if (trustBullets.some((x) => x.toLowerCase() === key)) return;
    trustBullets.push(t);
  };
  if (offer) pushUnique(offer);
  for (const b of bulletsFromDifferentiator(diff)) pushUnique(b);
  for (const id of outcomes.slice(0, 2)) pushUnique(FUNNEL_DESIRED_OUTCOME_WHY_LINES[id]);
  const tone = directionToneNote(input.designDirection);
  if (tone) pushUnique(tone);
  const defaults = defaultTrustBullets(kind, city);
  for (const d of defaults) {
    if (trustBullets.length >= 3) break;
    pushUnique(d);
  }

  const ctaLabel = pickCtaLabel(kind, outcomes, fresh);
  const ctaSupport = pickCtaSupport(outcomes);

  return {
    headline,
    subheadline,
    businessNameLine,
    services: servicesCards,
    trustTitle: "Why choose us",
    trustBullets: trustBullets.slice(0, 3),
    ctaLabel,
    ctaSupport,
    isSparse,
  };
}

/** Thin exports for tests, Storybook, or future reuse — all O(1) over the same bundle builder. */
export function generateHeadline(input: FreeMockupPreviewCopyInput): string {
  return buildFreeMockupPreviewCopy(input).headline;
}

export function generateSubheadline(input: FreeMockupPreviewCopyInput): string {
  return buildFreeMockupPreviewCopy(input).subheadline;
}

export function generateServiceDescriptions(input: FreeMockupPreviewCopyInput): PreviewServiceCard[] {
  return buildFreeMockupPreviewCopy(input).services;
}

export function generateTrustPoints(input: FreeMockupPreviewCopyInput): string[] {
  return buildFreeMockupPreviewCopy(input).trustBullets;
}

export function generateCtaCopy(input: FreeMockupPreviewCopyInput): { label: string; support: string } {
  const c = buildFreeMockupPreviewCopy(input);
  return { label: c.ctaLabel, support: c.ctaSupport };
}
