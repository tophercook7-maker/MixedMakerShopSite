# Static HTML → Next.js Migration & Content-Parity Report

**Date:** 2026-06-12
**Goal:** Stop maintaining two diverging websites. The live site is the **Next.js app** (`next-app/`, deployed via `netlify.toml` `base = "next-app"`). The 29 root `*.html` pages are an **older, undeployed** codebase still being hand-edited as a "canonical content" reference. This report maps every HTML page to its Next.js route and rates content parity, so content can be consolidated into the live app and the HTML retired.

**Method:** Each HTML page was read and compared against its matching Next.js route (following component/data/lib imports for real rendered content) across 5 parallel audits covering all 29 pages.

---

## 1. Executive summary

| Parity status | Count | Pages |
|---|---|---|
| **In sync** | 3 | index, contact, work-with-topher (redirect) |
| **Partially synced** (HTML richer) | 13 | about, web-design, pricing, 3d-printing, custom-3d-printing, builds, hot-springs-web-design, web-design-hot-springs-ar, small-business-websites-hot-springs, church-websites-hot-springs, coffee-shop-websites-hot-springs, restaurant-website-redesign, restaurant-websites-hot-springs |
| **Missing from Next.js** (no route) | 10 | ai-business-tools, price-sheet, small-business-website-design, church-website-design, local-seo-services, google-business-profile-help, in-home-computer-repair, website-maintenance, social-media-takeover, how-much-does-a-website-cost |
| **Next.js version newer** | 3 | tools, examples, agreement |

**Headline:** The HTML side is the content source of truth for **23 of 29 pages**. The live Next.js SEO/service pages are largely thin keyword stubs (~20% of the HTML depth) with **no per-page schema**, and **10 entire pages — including 3+ priced revenue lines — do not exist on the live site at all.**

---

## 2. Cross-cutting issues (fix during migration, not page-by-page)

1. **Live pricing contradictions — customer-facing.** Three different web-design price stories are live simultaneously:
   - `pricing.html` (canonical): Starter **$400**, Business **$900–$1,800**, Hosting **$89/mo**
   - Next `/pricing` (`lib/pricing-tiers.ts`): Starter "$400", Growth "$900–$1,800" ✅ matches canonical
   - Next `/web-design` (`lib/web-design-packages.ts`): Starter **$500–$1,000**, Growth **$1,000–$2,500** ❌ **conflicts**
   - IT repair: canonical flat rates ($59 diagnostic / $99 tune-up) vs `/blog/mixed-maker-shop-comeback` quoting **"$85 first hour"** ❌ **conflicts**
   → Pick one source of truth before any SEO work; wrong prices are live now.

2. **Dead `.html` links in live routes (404s).** These 5 Next routes link to `/pricing.html` and `/contact.html`, which don't exist in the app:
   `web-design-hot-springs-ar`, `website-designer-hot-springs-ar`, `restaurant-websites-hot-springs`, `church-websites-hot-springs`, `small-business-websites-hot-springs`.

3. **No per-page structured data on the live site.** Global schema (`Organization`, `ProfessionalService`, `WebSite`) is injected in `app/layout.tsx`, but **no public route emits per-page `Service` or `FAQPage` JSON-LD.** Every HTML service/location page carries both. This is a real SEO regression that the live site inherited by not porting the HTML schema.

4. **Dangling "Related Service" intent.** Live pages (about, web-design, pricing) cross-link to **AI Business Tools**, which has **no route** — internal links to a page that doesn't exist.

5. **Duplicate Next routes to consolidate.** `/web-design-hot-springs-ar` and `/website-designer-hot-springs-ar` serve the same intent; `hot-springs-web-design.html` (the rich canonical) maps to the former. Pick one canonical route, redirect the rest.

---

## 3. Full parity table

| HTML page | Matching Next.js route | Parity status | Priority | Note |
|---|---|---|---|---|
| index.html | `/` | In sync | Low | Both umbrella-concept homes; HTML has heavier inline OfferCatalog/FAQ schema |
| about.html | `/about` | Partially synced | Medium | Next ~9× thinner: missing GiGi profile, 5-Q FAQ, related-service links, FAQPage schema |
| contact.html | `/contact` | In sync | Low | Next is the functional version (working form). Nothing to migrate |
| web-design.html | `/web-design` | Partially synced | **High** | **Pricing conflict** ($400/$900 vs $500–$1k/$1k–$2.5k); HTML has 5-Q FAQ + Service schema |
| pricing.html | `/pricing` | Partially synced | **High** | Live `/pricing` is web-design only; **social, IT repair ($79/hr), tutoring ($65/hr) missing** |
| tools.html | `/tools` (+`/websites-tools`) | Next.js newer | None | HTML is a ~138-word stub; Next is richer. Retire HTML |
| ai-business-tools.html | **NONE** | Missing | **High** | Full service page (6 personas, 6 use cases, FAQ, schema); cross-linked but no route exists |
| 3d-printing.html | `/3d-printing` | Partially synced | **High** | Next dropped concrete price bands ($5–15/$15–45/$20–80) + Service/FAQPage schema; messaging diverged |
| custom-3d-printing.html | `/custom-3d-printing` | Partially synced | Low | Both thin funnel stubs; minor content loss only |
| builds.html | `/builds` | Partially synced | Medium | Different project rosters; HTML uniquely has Business Tools/Experiments/Future Ventures + schema/FAQ |
| examples.html | `/examples` | Next.js newer | None | HTML is an old meta-refresh redirect; Next is a full proof-wall. Verify redirect strategy |
| price-sheet.html | **NONE** | Missing | **High** | Printable all-service price sheet; only place all standardized prices live together |
| hot-springs-web-design.html | `/web-design-hot-springs-ar` | Partially synced | **High** | Canonical flagship local page; Next is ~25% depth, no schema, no pricing |
| web-design-hot-springs-ar.html | `/web-design-hot-springs-ar` + `/website-designer-hot-springs-ar` | Partially synced | Medium | Already-deprecated HTML; real work = consolidate 2 duplicate Next routes |
| small-business-website-design.html | **NONE** | Missing | **High** | Broad (non-location) SB page; distinct from the hot-springs one; needs new route |
| small-business-websites-hot-springs.html | `/small-business-websites-hot-springs` | Partially synced | **High** | Next ~20% depth; missing schema, $400, local-landmark essay, card grids, related services |
| church-website-design.html | **NONE** | Missing | Low | 165-word unstyled stub; best redirected into `/church-websites-hot-springs` |
| church-websites-hot-springs.html | `/church-websites-hot-springs` | Partially synced | **High** | Next ~19% depth; missing schema, pricing, ChMS/denomination FAQ, visitor feature grid |
| coffee-shop-websites-hot-springs.html | `/coffee-shop-websites-hot-springs` | Partially synced | **High** | Next ~9% depth; missing FAQ, both schema blocks, audience/inclusion grids, pricing, cross-links |
| restaurant-website-redesign.html | `/restaurant-website-redesign` | Partially synced | **High** | Diverged purpose; HTML has FAQ + pricing ($600, $900–$1,800) + 301-redirect/SEO copy + schema |
| restaurant-websites-hot-springs.html | `/restaurant-websites-hot-springs` | Partially synced | Medium | Next ~22% depth; 2-Q FAQ vs full, no schema/pricing; **has dead `.html` links** |
| local-seo-services.html | **NONE** | Missing | **High** | Core SEO service landing page; only blog posts are adjacent, not a substitute |
| google-business-profile-help.html | **NONE** | Missing | **High** | "Highest-leverage" GBP service page; full FAQ + schema; no route at all |
| in-home-computer-repair.html | **NONE** | Missing | **High** | Full service page + 6 flat-rate tiers + tutoring; **live pricing contradiction** ($85 vs $59/$99) |
| website-maintenance.html | **NONE** (only `$89/mo` line in `/pricing`) | Missing | Medium | Whole explanatory/sales page + FAQ + schema absent; only a price bullet survives |
| social-media-takeover.html | **NONE** | Missing | **High** | Entire revenue line: 5 pricing tiers ($129/$249/$449/mo) + 7-platform model + FAQ + schema, nowhere public |
| how-much-does-a-website-cost.html | **NONE** (loosely `/pricing`) | Missing | **High** | Cornerstone SEO buyer's guide (dated today, Article + FAQPage schema); no blog/route equivalent |
| work-with-topher.html | `/about` | In sync | Low | Just a redirect stub; add `work-with-topher → /about` rule so old URL doesn't 404 |
| agreement.html | `/terms` | Next.js newer | Low | `/terms` is a legal superset; fold in HTML's "5 pages / 2 revisions / 2–3 weeks" specifics, then redirect |

---

## 4. Top 10 pages to migrate first

Ranked by live-integrity risk + revenue visibility + SEO value (and weighted toward unblocking the planned SEO work).

| # | Page | Why first | Action |
|---|---|---|---|
| 1 | **pricing.html** + `/web-design` pricing | Live **pricing contradictions** + 3 priced revenue lines missing from `/pricing`. Money must be correct & complete before anything else | Reconcile `lib/web-design-packages.ts` to canonical; add social/IT-repair/tutoring sections to `/pricing` |
| 2 | **in-home-computer-repair.html** | Full revenue page missing **and** a live price contradiction ($85 blog vs $59/$99 canonical) | New `/in-home-computer-repair` route w/ flat-rate grid + tutoring + Service/FAQ schema |
| 3 | **social-media-takeover.html** | Entire revenue line (5 tiers, 7 platforms) exists **nowhere public** | New `/social-media-takeover` route w/ pricing tiers + FAQ + schema |
| 4 | **ai-business-tools.html** | Full service page missing **and** live pages already link to it (dead internal intent) | New `/ai-business-tools` route; wires up existing cross-links |
| 5 | **local-seo-services.html** | Core SEO service page missing — directly blocks the planned "more SEO work" | New `/local-seo-services` route w/ Service + FAQPage schema |
| 6 | **google-business-profile-help.html** | "Highest-leverage" local SEO service, fully absent | New `/google-business-profile-help` route w/ FAQ + schema |
| 7 | **how-much-does-a-website-cost.html** | Cornerstone organic-search asset (Article + FAQPage schema, dated today); big keyword target | New `/blog/how-much-does-a-website-cost` (or `/how-much-does-a-website-cost`) |
| 8 | **hot-springs-web-design.html** | Flagship local term; live route is a 25%-depth stub w/ no schema + dead links | Port rich content + schema into `/web-design-hot-springs-ar`; consolidate the duplicate `/website-designer-hot-springs-ar` |
| 9 | **price-sheet.html** | Aggregated printable price sheet — sales tool with no equivalent | New `/price-sheet` route (depends on #1 pricing reconciliation) |
| 10 | **church-websites-hot-springs.html** + **coffee-shop-websites-hot-springs.html** | Highest-value remaining thin SEO location stubs (~9–19% depth, no schema, dead links) | Port content + per-page Service/FAQPage schema; fix dead `.html` links |

**Deferred (low priority / already handled):** custom-3d-printing, builds, restaurant-websites-hot-springs (port later), small-business-website-design + church-website-design (consolidate/redirect), about (enrich), tools/examples/agreement/work-with-topher/contact/index (retire HTML, add redirects only).

---

## 5. Recommended sequencing

1. **Stop the bleeding (live bugs):** reconcile pricing sources of truth (#1), fix the 10 dead `/pricing.html` & `/contact.html` links, resolve the duplicate hot-springs routes.
2. **Migrate the 10 missing pages** (esp. the revenue + SEO service pages #2–#9).
3. **Standardize per-page schema:** add a reusable `Service` + `FAQPage` JSON-LD helper (extend `lib/structured-data.ts`) and apply it as pages are ported.
4. **Enrich the thin location stubs** to HTML depth (#8, #10, then the rest).
5. **Add redirects** for every retired HTML URL (`work-with-topher`→`/about`, `agreement`→`/terms`, `examples`, `tools`, etc.) to preserve any existing inbound links/SEO.
6. **Retire the root `*.html` files** once their content + redirects are live — ending the dual-codebase maintenance.

*No code changes were made. This is a read-only audit deliverable.*
