/**
 * Site audit — every check runs over plain HTTP with no API key and no vendor.
 *
 * This exists because /free-website-check promised a free check and then
 * created a task for Topher to do by hand. These are the same checks that were
 * run manually against mixedmakershop.com on 2026-09-22; three of them caught
 * real problems an agency's paid tool had also found, and two caught problems
 * it missed entirely.
 *
 * Deliberately NOT included: performance scores. Core Web Vitals need the
 * PageSpeed Insights API and a key, and a made-up performance number is worse
 * than none.
 */

export type Severity = "high" | "medium" | "low";

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  /** What it currently is, when there's a concrete value worth showing. */
  observed?: string;
  fix: string;
};

export type AuditReport = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  ok: boolean;
  error?: string;
  statusCode?: number;
  responseMs?: number;
  score: number;
  findings: Finding[];
  passed: string[];
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const WEIGHT: Record<Severity, number> = { high: 18, medium: 9, low: 4 };

async function grab(url: string, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    });
    const body = await res.text();
    return { res, body, ms: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

const text = (html: string, re: RegExp) => html.match(re)?.[1]?.trim();
const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export async function auditSite(rawUrl: string): Promise<AuditReport> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const base: AuditReport = {
    url,
    finalUrl: url,
    fetchedAt: new Date().toISOString(),
    ok: false,
    score: 0,
    findings: [],
    passed: [],
  };

  let html = "";
  let status = 0;
  let ms = 0;
  let finalUrl = url;
  let headers: Headers;

  try {
    const r = await grab(url);
    html = r.body;
    status = r.res.status;
    ms = r.ms;
    finalUrl = r.res.url || url;
    headers = r.res.headers;
  } catch (err) {
    return { ...base, error: err instanceof Error ? err.message : "Could not reach the site" };
  }

  const f: Finding[] = [];
  const passed: string[] = [];
  const origin = new URL(finalUrl).origin;

  /* ── title ─────────────────────────────────────────────────────────── */
  const rawTitle = text(html, /<title[^>]*>([^<]*)</i);
  const title = rawTitle ? decode(rawTitle) : "";
  if (!title) {
    f.push({
      id: "title-missing",
      severity: "high",
      title: "No page title",
      detail: "The page has no <title>. It's the single biggest on-page signal and the blue link text in every search result.",
      fix: "Add a title of roughly 50–60 characters that says what you do and where.",
    });
  } else if (title.length > 62) {
    f.push({
      id: "title-long",
      severity: "medium",
      title: "Title is too long to show in full",
      detail: "Google truncates titles around 60 characters, so the end of yours is invisible in search results.",
      observed: `${title.length} characters — "${title}"`,
      fix: "Trim to about 60. Put the thing people search for first and the business name last.",
    });
  } else {
    passed.push(`Title is a good length (${title.length} characters)`);
  }

  /* ── meta description ──────────────────────────────────────────────── */
  const desc =
    text(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ??
    text(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  if (!desc) {
    f.push({
      id: "desc-missing",
      severity: "medium",
      title: "No meta description",
      detail: "Without one, the search engine writes its own snippet from whatever text it finds first — often a menu.",
      fix: "Add a 120–158 character description that reads like an ad for the page.",
    });
  } else if (desc.length > 165) {
    f.push({
      id: "desc-long",
      severity: "low",
      title: "Meta description gets cut off",
      detail: "Anything past roughly 158 characters is replaced with an ellipsis in results.",
      observed: `${desc.length} characters`,
      fix: "Trim to under 158 so the whole sentence shows.",
    });
  } else {
    passed.push("Meta description is a usable length");
  }

  /* ── canonical ─────────────────────────────────────────────────────── */
  if (/<link[^>]+rel=["']canonical["']/i.test(html)) passed.push("Canonical tag present");
  else
    f.push({
      id: "canonical-missing",
      severity: "medium",
      title: "No canonical tag",
      detail: "Without one, the same page reachable at several URLs competes with itself for ranking.",
      fix: "Add a <link rel=\"canonical\"> pointing at the preferred URL of each page.",
    });

  /* ── www vs apex ───────────────────────────────────────────────────── */
  try {
    const host = new URL(finalUrl).hostname;
    const other = host.startsWith("www.") ? host.slice(4) : `www.${host}`;
    const alt = await grab(`https://${other}/`, 12000);
    const altHost = new URL(alt.res.url).hostname;
    if (alt.res.status === 200 && altHost === other) {
      f.push({
        id: "www-duplicate",
        severity: "high",
        title: "www and non-www both load as separate sites",
        detail:
          "Both versions answer independently instead of one redirecting to the other, so every link you earn is split between two copies of the site.",
        observed: `${host} and ${other} both return 200`,
        fix: `Redirect one to the other with a permanent 301 — usually www to the bare domain.`,
      });
    } else {
      passed.push("www and non-www resolve to one address");
    }
  } catch {
    /* the alternate host may simply not exist — that's fine, not a finding */
  }

  /* ── structured data ───────────────────────────────────────────────── */
  const ld = Array.from(html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)).map((m) => m[1]);
  const types: string[] = [];
  let broken = 0;
  for (const block of ld) {
    try {
      const parsed = JSON.parse(block);
      const nodes: unknown[] = Array.isArray(parsed)
        ? parsed
        : // A @graph wraps several entities in one block — walk into it, or the
          // whole block looks typeless. This is exactly the trap that made an
          // earlier manual pass report "no LocalBusiness" on a site that had one.
          ((parsed as { "@graph"?: unknown[] })?.["@graph"] ?? [parsed]);
      for (const n of nodes) {
        const t = (n as { "@type"?: string | string[] })?.["@type"];
        if (Array.isArray(t)) types.push(...t);
        else if (t) types.push(t);
      }
    } catch {
      broken++;
    }
  }
  if (broken) {
    f.push({
      id: "ld-invalid",
      severity: "medium",
      title: "Structured data won't parse",
      detail: "A JSON-LD block has a syntax error, so search engines and AI assistants skip it entirely.",
      observed: `${broken} invalid block${broken > 1 ? "s" : ""}`,
      fix: "Run each block through a JSON validator and fix the syntax.",
    });
  }
  const LOCAL = /LocalBusiness|ProfessionalService|Store|Restaurant|HomeAndConstructionBusiness|Organization/i;
  if (!ld.length) {
    f.push({
      id: "ld-missing",
      severity: "high",
      title: "No structured data at all",
      detail:
        "Structured data is how a search engine — and increasingly ChatGPT, Gemini and AI Overviews — learn what your business is, where it is, and what it charges. Without it they have to guess from prose.",
      fix: "Add LocalBusiness schema with your address, phone, service area and hours, plus FAQPage for any Q&A.",
    });
  } else if (!types.some((t) => LOCAL.test(t))) {
    f.push({
      id: "ld-no-business",
      severity: "medium",
      title: "Structured data doesn't identify the business",
      detail: "There is schema on the page, but nothing that says this is a local business with an address and a service area.",
      observed: `found: ${Array.from(new Set(types)).join(", ") || "none"}`,
      fix: "Add a LocalBusiness (or ProfessionalService) node with address, telephone and areaServed.",
    });
  } else {
    passed.push(`Business schema present (${Array.from(new Set(types)).slice(0, 4).join(", ")})`);
  }
  if (types.some((t) => /FAQPage/i.test(t))) passed.push("FAQ schema present — strong for AI answers");

  /* ── open graph ────────────────────────────────────────────────────── */
  const og = (p: string) => new RegExp(`<meta[^>]+property=["']og:${p}["']`, "i").test(html);
  const missingOg = ["title", "description", "image", "type"].filter((p) => !og(p));
  if (missingOg.length) {
    f.push({
      id: "og-missing",
      severity: missingOg.length >= 3 ? "medium" : "low",
      title: "Link previews are incomplete",
      detail:
        "When someone shares the page on Facebook, LinkedIn or in a text message, these tags decide what picture and text appear. Missing ones produce a bare grey link.",
      observed: `missing: ${missingOg.map((p) => `og:${p}`).join(", ")}`,
      fix: "Add the missing Open Graph tags in the page head.",
    });
  } else {
    passed.push("Open Graph tags complete");
  }

  /* ── headings & images ─────────────────────────────────────────────── */
  const h1s = Array.from(html.matchAll(/<h1[^>]*>/gi)).length;
  if (h1s === 0)
    f.push({
      id: "h1-missing",
      severity: "medium",
      title: "No H1 heading",
      detail: "The H1 is the page's headline. Search engines lean on it to understand what the page is about.",
      fix: "Add exactly one H1 that states what the page offers.",
    });
  else if (h1s > 1)
    f.push({
      id: "h1-many",
      severity: "low",
      title: "More than one H1",
      detail: "Several competing headlines make the page's subject ambiguous.",
      observed: `${h1s} H1 tags`,
      fix: "Keep one H1 and demote the rest to H2.",
    });
  else passed.push("Exactly one H1");

  const imgs = Array.from(html.matchAll(/<img\b[^>]*>/gi)).map((m) => m[0]);
  const noAlt = imgs.filter((i) => !/\balt\s*=/i.test(i)).length;
  if (noAlt)
    f.push({
      id: "img-alt",
      severity: "low",
      title: "Images missing alt text",
      detail: "Alt text is what a screen reader announces and what a search engine reads instead of the picture.",
      observed: `${noAlt} of ${imgs.length} images`,
      fix: "Describe each meaningful image; use alt=\"\" for purely decorative ones.",
    });
  else if (imgs.length) passed.push("All images have alt text");

  /* ── robots & sitemap ──────────────────────────────────────────────── */
  try {
    const r = await grab(`${origin}/robots.txt`, 8000);
    if (r.res.ok && /user-agent/i.test(r.body)) {
      passed.push("robots.txt present");
      if (!/sitemap:/i.test(r.body))
        f.push({
          id: "sitemap-not-declared",
          severity: "low",
          title: "robots.txt doesn't point to a sitemap",
          detail: "Crawlers look here first. Naming the sitemap is a free way to get pages found faster.",
          fix: "Add a `Sitemap: https://yoursite.com/sitemap.xml` line to robots.txt.",
        });
    } else throw new Error("no robots");
  } catch {
    f.push({
      id: "robots-missing",
      severity: "low",
      title: "No robots.txt",
      detail: "Not fatal, but it's the first file a crawler asks for and the usual place to declare your sitemap.",
      fix: "Add a robots.txt that allows crawling and names your sitemap.",
    });
  }

  let sitemapOk = false;
  for (const path of ["/sitemap.xml", "/sitemap_index.xml"]) {
    try {
      const r = await grab(`${origin}${path}`, 10000);
      if (r.res.ok && /<(urlset|sitemapindex)/i.test(r.body)) {
        const n = Array.from(r.body.matchAll(/<loc>/gi)).length;
        passed.push(`Sitemap found (${n} URLs)`);
        sitemapOk = true;
        break;
      }
    } catch {
      /* try the next candidate */
    }
  }
  if (!sitemapOk)
    f.push({
      id: "sitemap-missing",
      severity: "medium",
      title: "No sitemap found",
      detail: "A sitemap is how you tell search engines every page exists, including ones nothing links to.",
      fix: "Publish /sitemap.xml listing every page you want indexed.",
    });

  /* ── transport & speed ─────────────────────────────────────────────── */
  if (!finalUrl.startsWith("https://"))
    f.push({
      id: "no-https",
      severity: "high",
      title: "Site is not served over HTTPS",
      detail: "Browsers mark plain HTTP as 'Not secure', and it's been a ranking factor for years.",
      fix: "Install a certificate and redirect all HTTP traffic to HTTPS.",
    });
  else passed.push("Served over HTTPS");

  if (ms > 2500)
    f.push({
      id: "slow",
      severity: ms > 5000 ? "high" : "medium",
      title: "Slow first response",
      detail: "This is time-to-first-byte, before any images load. Slow here makes everything after it worse.",
      observed: `${(ms / 1000).toFixed(1)} seconds`,
      fix: "Check hosting, caching and any redirect chain in front of the page.",
    });
  else passed.push(`Responded in ${(ms / 1000).toFixed(1)}s`);

  if (!headers.get("strict-transport-security") && finalUrl.startsWith("https://"))
    f.push({
      id: "no-hsts",
      severity: "low",
      title: "No HSTS header",
      detail: "Tells browsers to always use HTTPS, closing a small downgrade window on first visit.",
      fix: "Add a Strict-Transport-Security header.",
    });

  if (!/<meta[^>]+name=["']viewport["']/i.test(html))
    f.push({
      id: "no-viewport",
      severity: "high",
      title: "Not set up for phones",
      detail: "Without a viewport tag the site renders at desktop width on a phone and the visitor has to pinch and zoom. Most local searches are on phones.",
      fix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
    });
  else passed.push("Mobile viewport set");

  const score = Math.max(0, 100 - f.reduce((s, x) => s + WEIGHT[x.severity], 0));
  const order: Severity[] = ["high", "medium", "low"];
  f.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return {
    url,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    ok: true,
    statusCode: status,
    responseMs: ms,
    score,
    findings: f,
    passed,
  };
}
