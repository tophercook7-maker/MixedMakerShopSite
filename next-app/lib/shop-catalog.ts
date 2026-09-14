/**
 * Shop catalogue — ready-to-buy printed products.
 *
 * Distinct from /3d-printing, which quotes custom jobs. This is stock you print
 * and sell as-is.
 *
 * ── Two gates before anything goes in here ──────────────────────────────────
 * Gate 1  LICENCE: the designer must permit commercial use. Only CC0, CC-BY and
 *         CC-BY-SA qualify. Any NonCommercial (NC) licence is disqualifying,
 *         with no exceptions. Confirm on the model page itself — Printables
 *         prints "Commercial Use" in the Licence block — and record the date.
 * Gate 2  SUBJECT: a licence covers the designer's own work only. It grants
 *         nothing over a character, logo, team badge or brand the model
 *         depicts. Grinch, Deadpool, Pokeball and Louis-Vuitton-monogram models
 *         all pass Gate 1 and all fail Gate 2. When in doubt, leave it out.
 *
 * ── Remixes chain ───────────────────────────────────────────────────────────
 * Printables shows a "Model origin" block. If it says the author remixed the
 * model, CC-BY attribution passes through: credit the remixer AND the original
 * designer. Record the upstream in `remixOf`.
 *
 * Find candidates with the licence-filtered search:
 *   https://www.printables.com/search/models?q=TERM&licenses=7%3A1%3A2&hasMake=1
 *   (licenses=7:1:2 → CC0 + CC-BY + CC-BY-SA · hasMake=1 → actually printed)
 */

export type ShopUpstream = {
  title: string;
  designer: string;
  license: string;
};

export type ShopProductSource = {
  site: string;
  url: string;
  designer: string;
  designerUrl?: string;
  /** Exact licence, e.g. "CC BY-SA 4.0". Never a guess. */
  license: string;
  licenseUrl: string;
  /** ISO date the commercial-use grant was read on the model page. */
  commercialConfirmed: string;
  /** Gate 2 reasoning, written down. */
  ipCheck: string;
  /** Set when Printables reports the model is a remix. Credit flows upstream. */
  remixOf?: ShopUpstream;
  /** Rendered on the product page. Required for CC-BY and CC-BY-SA. */
  attribution: string;
};

export type ShopProduct = {
  slug: string;
  /** Catalogue code customers quote, e.g. "VA-02". */
  code: string;
  name: string;
  blurb: string;
  description: string[];
  priceUsd: number;
  /** Set when the item is sold as a set, e.g. 6. Shown as "$44 / 6". */
  setQuantity?: number;
  localDeliveryNote?: string;
  image?: string;
  imageAlt?: string;
  printHours?: number;
  sizeCm?: string;
  materialNote?: string;
  source: ShopProductSource;
  /** "draft" never renders publicly. Nothing goes live before stock exists. */
  status: "live" | "draft";
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: "spiral-rose-vase",
    code: "VA-01",
    name: "Spiral Rose Vase",
    blurb: "A rose that never wilts, printed as one continuous spiral.",
    description: [
      "Printed in a single continuous pass, so the wall is one smooth spiral with no seams and no layer gaps. The petals wrap all the way round.",
      "Watertight for dried arrangements as printed. For fresh flowers, drop a glass or plastic tube inside — vase-mode walls are single-thickness and aren't meant to hold standing water long term.",
    ],
    priceUsd: 29,
    localDeliveryNote: "Free local delivery around Hot Springs — just ask before you check out.",
    sizeCm: "Approx. 15 cm tall",
    materialNote: "PLA. Any colour you like — ask what's on the shelf.",
    source: {
      site: "Printables",
      url: "https://www.printables.com/model/131488-spiral-vase-rose",
      designer: "lytta",
      designerUrl: "https://www.printables.com/@lytta",
      license: "CC BY 4.0",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
      commercialConfirmed: "2026-09-08",
      ipCheck:
        "Gate 2 clear — original floral form, marked by the author as their own original creation. No character, brand or trademark.",
      attribution:
        "Design by lytta, licensed CC BY 4.0. Printed and sold by MixedMakerShop.",
    },
    status: "live",
  },
  {
    slug: "tetrahex-ripple-vase",
    code: "VA-02",
    name: "Tetrahex Ripple Vase",
    blurb: "Faceted sides that catch the light differently from every angle.",
    description: [
      "Printed in one continuous pass, so the wall is a single smooth spiral with no seams. The tetrahex facets pick up light down the sides and shift as you walk past it.",
      "Watertight for dry arrangements as printed. For fresh flowers, drop a glass or plastic tube inside.",
    ],
    priceUsd: 32,
    localDeliveryNote: "Free local delivery around Hot Springs — just ask before you check out.",
    sizeCm: "Approx. 20 cm tall",
    materialNote: "PLA. Any colour you like — ask what's on the shelf.",
    source: {
      site: "Printables",
      url: "https://www.printables.com/model/228303-tetrahex-ripple-vase",
      designer: "ChrisTheViolaNerd",
      designerUrl: "https://www.printables.com/@ChrisTheViolaNerd",
      license: "CC BY-SA 4.0",
      licenseUrl: "http://creativecommons.org/licenses/by-sa/4.0/",
      commercialConfirmed: "2026-09-08",
      ipCheck:
        "Gate 2 clear — original geometric form. No character, brand or trademark depicted.",
      attribution:
        "Design by ChrisTheViolaNerd, licensed CC BY-SA 4.0. Printed and sold by MixedMakerShop.",
    },
    status: "live",
  },
  {
    slug: "skull-candy-bowl",
    code: "HW-01",
    name: "Realistic Skull Candy Bowl",
    blurb: "A full-size skull with the top open for sweets.",
    description: [
      "A life-size skull with the crown left open, so it holds a decent bag of sweets. It sits on the porch through October and reads as something that cost a great deal more than it did.",
      "Printed solid enough to stay put in wind. Looks best in bone white or matte black.",
    ],
    priceUsd: 32,
    localDeliveryNote: "Free local delivery around Hot Springs — just ask before you check out.",
    sizeCm: "Roughly life-size",
    materialNote: "PLA. Bone white or matte black.",
    source: {
      site: "Printables",
      url: "https://www.printables.com/model/296685-skull-with-mustache-v2-candy-bowl-halloween-decora",
      designer: "Johnny B Mac",
      license: "CC BY 4.0",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
      commercialConfirmed: "2026-09-08",
      ipCheck:
        "Gate 2 clear — anatomical skull, a generic form owned by nobody. No character or brand.",
      remixOf: {
        title: "Realistic Skull Candy Bowl | Halloween Skull Decoration",
        designer: "Thinkable",
        license: "CC BY",
      },
      attribution:
        "Design by Johnny B Mac, licensed CC BY 4.0, remixed from the original by Thinkable (CC BY). Printed and sold by MixedMakerShop.",
    },
    status: "live",
  },
  {
    slug: "russian-doll-maze-puzzle-box",
    code: "GB-01",
    name: "Russian Doll Maze Box",
    blurb: "Boxes inside boxes, each with its own hidden maze to solve.",
    description: [
      "Three nested cylinders, each one a maze you have to feel your way through before the next opens. Put cash, a gift card or a ring in the middle and hand it over — they have to earn it.",
      "Ten different maze patterns per layer, so no two are quite the same. Tell me if you want it easy or genuinely cruel.",
    ],
    priceUsd: 42,
    localDeliveryNote: "Free local delivery around Hot Springs — just ask before you check out.",
    printHours: 17.5,
    sizeCm: "Approx. 12 cm tall, three nested layers",
    materialNote: "PLA, about 108 g. Any colour — the layers can be different colours.",
    source: {
      site: "Printables",
      url: "https://www.printables.com/model/12138-russian-doll-maze-puzzle-box",
      designer: "Alain74Martel",
      designerUrl: "https://www.printables.com/@Alain74Martel_36828",
      license: "CC BY 4.0",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
      commercialConfirmed: "2026-09-12",
      ipCheck:
        "Gate 2 clear — original parametric maze geometry. No character, brand or trademark.",
      // Printables' structured "Model origin" field claims original creation, but the
      // author's own description says it is a remix and asks that credit go to Adrian
      // Kennard (RevK). Follow the description — it is the stronger, explicit request.
      remixOf: {
        title: "Russian Doll Maze Puzzle Box (Thingiverse thing:2410748)",
        designer: "RevK / Adrian Kennard",
        license: "CC BY",
      },
      attribution:
        "Design by Alain74Martel, licensed CC BY 4.0, remixed from the original by RevK (Adrian Kennard). Printed and sold by MixedMakerShop.",
    },
    status: "live",
  },
];

export function liveShopProducts(): ShopProduct[] {
  return SHOP_PRODUCTS.filter((p) => p.status === "live");
}

export function findShopProduct(slug: string): ShopProduct | null {
  const key = String(slug || "").trim().toLowerCase();
  if (!key) return null;
  return SHOP_PRODUCTS.find((p) => p.slug === key) ?? null;
}

/** Stripe wants integer cents. Round rather than truncate. */
export function priceInCents(product: ShopProduct): number {
  return Math.round(product.priceUsd * 100);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** "$44 / 6" for sets, "$32" for singles. */
export function displayPrice(product: ShopProduct): string {
  const base = formatUsd(product.priceUsd);
  return product.setQuantity ? `${base} / ${product.setQuantity}` : base;
}
