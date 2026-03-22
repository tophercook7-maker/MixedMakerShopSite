import type { SupabaseClient } from "@supabase/supabase-js";
import {
  leadHasStandaloneWebsite,
  pickLeadPatchFields,
} from "@/lib/crm-lead-schema";
import { logCrmAutomationEvent } from "@/lib/crm/automation-log";
import { normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 380_000;

const DIRECTORY_HOSTS = new Set(
  [
    "yelp.com",
    "www.yelp.com",
    "yellowpages.com",
    "www.yellowpages.com",
    "manta.com",
    "www.manta.com",
    "bbb.org",
    "www.bbb.org",
    "mapquest.com",
    "www.mapquest.com",
    "tripadvisor.com",
    "www.tripadvisor.com",
    "linkedin.com",
    "www.linkedin.com",
    "instagram.com",
    "www.instagram.com",
    "facebook.com",
    "www.facebook.com",
    "m.facebook.com",
    "fb.com",
    "www.fb.com",
    "google.com",
    "www.google.com",
    "bing.com",
    "www.bing.com",
    "foursquare.com",
    "www.foursquare.com",
    "chamberofcommerce.com",
    "www.chamberofcommerce.com",
  ].map((h) => h.toLowerCase())
);

const EMAIL_DENY = [
  /^noreply@/i,
  /^no-reply@/i,
  /^donotreply@/i,
  /^privacy@/i,
  /^abuse@/i,
  /^postmaster@/i,
  /^webmaster@/i,
  /^hostmaster@/i,
  /^example@/i,
  /^test@/i,
  /@example\./i,
  /@test\./i,
  /@sentry\./i,
  /@wixpress\.com$/i,
  /@wordpress\./i,
  /\.png$/i,
  /\.jpg$/i,
  /\.gif$/i,
  /\.webp$/i,
];

export type LeadEnrichResult = {
  ok: true;
  leadId: string;
  enriched: boolean;
  updatedFields: string[];
  message: string;
};

function trimStr(v: unknown): string {
  return String(v ?? "").trim();
}

function isFacebookUrl(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  return s.includes("facebook.") || s.includes("fb.com");
}

function hostKey(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function isDirectoryHost(hostname: string): boolean {
  const h = hostKey(hostname);
  return DIRECTORY_HOSTS.has(h) || Array.from(DIRECTORY_HOSTS).some((d) => h.endsWith(`.${d}`));
}

function safeUrl(raw: string): URL | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    return new URL(s.startsWith("http") ? s : `https://${s}`);
  } catch {
    return null;
  }
}

function isLikelyPublicEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 120) return false;
  if (EMAIL_DENY.some((re) => re.test(e))) return false;
  const domain = e.split("@")[1] || "";
  if (!domain || domain.length < 4) return false;
  return true;
}

function formatUsPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1")) return formatUsPhone(d.slice(1));
  return digits.trim();
}

function normalizePhoneCandidate(raw: string): string | null {
  const fromTel = raw.replace(/^tel:/i, "").trim();
  const d = fromTel.replace(/\D/g, "");
  if (d.length === 10 || (d.length === 11 && d.startsWith("1"))) {
    return formatUsPhone(d);
  }
  return null;
}

function collectPhonesFromHtml(html: string): string[] {
  const out: string[] = [];
  const telRe = /href\s*=\s*["']tel:([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = telRe.exec(html)) !== null) {
    const p = normalizePhoneCandidate(m[1]);
    if (p) out.push(p);
  }
  const textRe = /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g;
  const tm = html.match(textRe);
  if (tm) {
    for (const t of tm) {
      const p = normalizePhoneCandidate(t);
      if (p) out.push(p);
    }
  }
  return Array.from(new Set(out));
}

function collectEmailsFromHtml(html: string): string[] {
  const out: string[] = [];
  const mailRe = /href\s*=\s*["']mailto:([^"'?]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = mailRe.exec(html)) !== null) {
    const e = decodeURIComponent(m[1]).trim();
    if (isLikelyPublicEmail(e)) out.push(e.toLowerCase());
  }
  const plainRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const pm = html.match(plainRe);
  if (pm) {
    for (const e of pm) {
      if (isLikelyPublicEmail(e)) out.push(e.toLowerCase());
    }
  }
  return Array.from(new Set(out));
}

function absoluteFromBase(base: URL, href: string): string | null {
  const h = href.trim();
  if (!h || h.startsWith("#") || h.toLowerCase().startsWith("javascript:")) return null;
  try {
    return new URL(h, base).href;
  } catch {
    return null;
  }
}

type ParsedSignals = {
  canonicalUrl: string | null;
  ogUrl: string | null;
  contactUrls: string[];
  emails: string[];
  phones: string[];
  facebookUrls: string[];
  city: string | null;
  state: string | null;
  category: string | null;
};

function parseHtmlForSignals(html: string, pageUrl: string): ParsedSignals {
  const base = safeUrl(pageUrl);
  const emails = collectEmailsFromHtml(html);
  const phones = collectPhonesFromHtml(html);

  let canonicalUrl: string | null = null;
  const canonRe = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i;
  const cm = html.match(canonRe);
  if (cm?.[1] && base) {
    canonicalUrl = absoluteFromBase(base, cm[1]);
  }

  let ogUrl: string | null = null;
  const ogRe = /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i;
  const om = html.match(ogRe);
  if (om?.[1] && base) {
    ogUrl = absoluteFromBase(base, om[1]);
  }

  const contactUrls: string[] = [];
  const facebookUrls: string[] = [];
  const hrefRe = /href\s*=\s*["']([^"']+)["']/gi;
  let hm: RegExpExecArray | null;
  while ((hm = hrefRe.exec(html)) !== null) {
    const abs = base ? absoluteFromBase(base, hm[1]) : null;
    if (!abs) continue;
    const low = abs.toLowerCase();
    if (isFacebookUrl(abs)) {
      facebookUrls.push(abs.split("?")[0]);
      continue;
    }
    if (
      /contact/i.test(hm[1]) ||
      /\/contact\b/i.test(low) ||
      /contact-us/i.test(low) ||
      /reach-us/i.test(low)
    ) {
      if (base) {
        try {
          const u = new URL(abs);
          if (hostKey(u.hostname) === hostKey(base.hostname)) {
            contactUrls.push(abs.split("#")[0]);
          }
        } catch {
          /* skip */
        }
      }
    }
  }

  let city: string | null = null;
  let state: string | null = null;
  let category: string | null = null;

  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jm: RegExpExecArray | null;
  while ((jm = ldRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(jm[1].trim());
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        const stack = [node];
        while (stack.length) {
          const n = stack.pop();
          if (!n || typeof n !== "object") continue;
          if (Array.isArray(n)) {
            stack.push(...n);
            continue;
          }
          const t = String(n["@type"] || "").toLowerCase();
          if (t.includes("localbusiness") || t.includes("organization") || t.includes("store")) {
            const tel = n.telephone || n.tel;
            if (typeof tel === "string") {
              const p = normalizePhoneCandidate(tel);
              if (p) phones.push(p);
            }
            const em = n.email;
            if (typeof em === "string" && isLikelyPublicEmail(em)) emails.push(em.toLowerCase());
            const url = n.url;
            if (typeof url === "string" && safeUrl(url) && leadHasStandaloneWebsite(url)) {
              ogUrl = ogUrl || url;
            }
            const addr = n.address;
            if (addr && typeof addr === "object") {
              const c = addr.addressLocality;
              const st = addr.addressRegion;
              if (typeof c === "string" && c.trim()) city = city || c.trim();
              if (typeof st === "string" && st.trim()) state = state || st.trim();
            }
          }
          if (typeof n["@type"] === "string" && !category) {
            const tp = String(n["@type"]);
            if (/restaurant|foodestablishment|store|organization|localbusiness|church|salon/i.test(tp)) {
              category = tp.split(/[\s/]/)[0] || null;
            }
          }
          for (const v of Object.values(n)) {
            if (v && typeof v === "object") stack.push(v as object);
          }
        }
      }
    } catch {
      /* ignore bad JSON */
    }
  }

  return {
    canonicalUrl,
    ogUrl,
    contactUrls: Array.from(new Set(contactUrls)),
    emails: Array.from(new Set(emails)),
    phones: Array.from(new Set(phones)),
    facebookUrls: Array.from(new Set(facebookUrls)),
    city,
    state,
    category,
  };
}

async function readResponseBodyLimited(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      chunks.push(value);
      if (total >= MAX_HTML_BYTES) break;
    }
  }
  const all = new Uint8Array(Math.min(total, MAX_HTML_BYTES));
  let offset = 0;
  for (const c of chunks) {
    const take = Math.min(c.length, all.length - offset);
    all.set(c.subarray(0, take), offset);
    offset += take;
    if (offset >= all.length) break;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(all);
}

export async function fetchHtmlPage(url: string): Promise<{ html: string; finalUrl: string } | null> {
  const u = safeUrl(url);
  if (!u || u.protocol !== "http:" && u.protocol !== "https:") return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(u.href, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "MixedMakerCRM-LeadEnrich/1.0 (+https://mixedmaker.com; contact enrichment; conservative)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok || !res.headers.get("content-type")?.toLowerCase().includes("text/html")) {
      return null;
    }
    const html = await readResponseBodyLimited(res);
    const finalUrl = res.url || u.href;
    return { html, finalUrl };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function sniffFacebookEmbeddedSignals(html: string): {
  website: string | null;
  phone: string | null;
  email: string | null;
} {
  let website: string | null = null;
  let phone: string | null = null;
  let email: string | null = null;

  const webM = html.match(/"website":"(https?:[^"]+)"/);
  if (webM?.[1]) {
    const w = webM[1].replace(/\\\//g, "/");
    if (leadHasStandaloneWebsite(w)) website = w;
  }
  const phoneM =
    html.match(/"formatted_phone_number":"([^"]+)"/) ||
    html.match(/"phone":"(\+?[\d\s().-]{10,})"/) ||
    html.match(/"business_phone_number":"([^"]+)"/);
  if (phoneM?.[1]) {
    const p = normalizePhoneCandidate(phoneM[1]);
    if (p) phone = p;
  }
  const emailM = html.match(/"email":"([^"]+@[^"]+)"/);
  if (emailM?.[1] && isLikelyPublicEmail(emailM[1])) {
    email = emailM[1].toLowerCase();
  }
  return { website, phone, email };
}

async function headOk(url: string): Promise<boolean> {
  const u = safeUrl(url);
  if (!u) return false;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(u.href, {
      method: "HEAD",
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "MixedMakerCRM-LeadEnrich/1.0",
      },
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveContactPage(origin: string): Promise<string | null> {
  const base = safeUrl(origin);
  if (!base) return null;
  const paths = ["/contact", "/contact-us", "/contact.html", "/contact/"];
  for (const p of paths) {
    const cand = new URL(p, base).href;
    if (await headOk(cand)) return cand;
  }
  return null;
}

function buildSearchQueries(args: {
  business_name: string;
  city: string | null;
  state: string | null;
  source_label: string | null;
}): string[] {
  const name = trimStr(args.business_name);
  const city = trimStr(args.city);
  const state = trimStr(args.state);
  const label = trimStr(args.source_label);
  const qs: string[] = [];
  if (name && city && state) qs.push(`${name} ${city} ${state}`);
  if (name && city) qs.push(`${name} ${city}`);
  if (name) qs.push(name);
  if (name && label) qs.push(`${name} ${label}`);
  return Array.from(new Set(qs.filter(Boolean)));
}

async function serpApiFirstBusinessWebsite(query: string): Promise<string | null> {
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key) return null;
  const u = new URL("https://serpapi.com/search.json");
  u.searchParams.set("engine", "google");
  u.searchParams.set("q", query);
  u.searchParams.set("api_key", key);
  u.searchParams.set("num", "8");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(u.href, { signal: ctrl.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as { organic_results?: { link?: string }[] };
    const rows = json.organic_results || [];
    for (const r of rows) {
      const link = trimStr(r.link);
      const parsed = safeUrl(link);
      if (!parsed) continue;
      const h = parsed.hostname;
      if (isDirectoryHost(h)) continue;
      if (isFacebookUrl(link)) continue;
      if (!leadHasStandaloneWebsite(link)) continue;
      return link.split("#")[0];
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
  return null;
}

type LeadEnrichRow = Record<string, unknown>;

const LEAD_ENRICH_SELECT =
  "id,business_name,city,state,category,email,phone,website,has_website,normalized_website,facebook_url,normalized_facebook_url,source_url,source_label,contact_page,source,lead_tags,email_source";

async function loadLeadForEnrich(
  supabase: SupabaseClient,
  ownerId: string,
  leadId: string
): Promise<LeadEnrichRow | null> {
  const variants = [
    LEAD_ENRICH_SELECT,
    "id,business_name,email,phone,website,facebook_url,source_url,source_label,lead_tags",
  ];
  for (const sel of variants) {
    const { data, error } = await supabase
      .from("leads")
      .select(sel)
      .eq("id", leadId)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (!error && data) return data as unknown as LeadEnrichRow;
  }
  return null;
}

function mergeTagsRemoveNoWebsite(tags: unknown, remove: Set<string>): string[] {
  const prev: string[] = Array.isArray(tags)
    ? (tags as unknown[]).map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  return prev.filter((t) => !remove.has(t));
}

function websiteIsWeakOrSocial(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  return isFacebookUrl(s) || isDirectoryHost(safeUrl(s)?.hostname || "");
}

/**
 * Server-side lead enrichment: fetch public HTML (and optional SerpAPI) to fill missing CRM fields.
 * Never throws to callers — failures return enriched: false.
 */
export async function enrichLeadForOwner(
  supabase: SupabaseClient,
  ownerId: string,
  leadId: string,
  options?: { silent?: boolean }
): Promise<LeadEnrichResult> {
  const found: Record<string, boolean> = {};
  const silent = Boolean(options?.silent);

  const logEv = async (event_type: string, payload: Record<string, unknown>) => {
    if (silent) return;
    await logCrmAutomationEvent(supabase, {
      owner_id: ownerId,
      lead_id: leadId,
      event_type,
      payload,
    });
  };

  try {
    await logEv("lead_enrichment_started", {});

    const lead = await loadLeadForEnrich(supabase, ownerId, leadId);
    if (!lead) {
      return {
        ok: true,
        leadId,
        enriched: false,
        updatedFields: [],
        message: "Lead not found",
      };
    }

    const business_name = trimStr(lead.business_name);
    const existingWebsite = trimStr(lead.website);
    const existingPhone = trimStr(lead.phone);
    const existingEmail = trimStr(lead.email);
    const existingFb = trimStr(lead.facebook_url);
    const existingContact = trimStr(lead.contact_page);
    const source_url = trimStr(lead.source_url);
    const city = trimStr(lead.city) || null;
    const state = trimStr(lead.state) || null;
    const source_label = trimStr(lead.source_label) || null;
    const existingCategory = trimStr(lead.category) || null;

    let bestWebsite: string | null = null;
    if (existingWebsite && leadHasStandaloneWebsite(existingWebsite) && !websiteIsWeakOrSocial(existingWebsite)) {
      bestWebsite = existingWebsite.startsWith("http") ? existingWebsite : `https://${existingWebsite}`;
    }

    let bestPhone: string | null = existingPhone || null;
    let bestEmail: string | null = existingEmail || null;
    let bestContactPage: string | null = existingContact || null;
    let bestFb: string | null = existingFb || null;
    let bestCity = city;
    let bestState = state;
    let bestCategory = existingCategory || null;

    const urlsToScan: string[] = [];
    if (bestWebsite) urlsToScan.push(bestWebsite);
    if (source_url && /^https?:\/\//i.test(source_url)) {
      if (!urlsToScan.includes(source_url.split("#")[0])) {
        urlsToScan.push(source_url.split("#")[0]);
      }
    }

    for (const pageUrl of urlsToScan) {
      const fetched = await fetchHtmlPage(pageUrl);
      if (!fetched) continue;
      const { html, finalUrl } = fetched;
      if (isFacebookUrl(finalUrl) || isFacebookUrl(pageUrl)) {
        const sn = sniffFacebookEmbeddedSignals(html);
        if (!bestWebsite && sn.website) {
          bestWebsite = sn.website;
          found.found_website = true;
        }
        if (!bestPhone && sn.phone) {
          bestPhone = sn.phone;
          found.found_phone = true;
        }
        if (!bestEmail && sn.email) {
          bestEmail = sn.email;
          found.found_email = true;
        }
        if (!bestFb) {
          const norm = pageUrl.split("?")[0];
          if (isFacebookUrl(norm)) {
            bestFb = norm.startsWith("http") ? norm : `https://${norm}`;
            found.found_facebook = true;
          }
        }
        continue;
      }

      const sig = parseHtmlForSignals(html, finalUrl);
      for (const e of sig.emails) {
        if (!bestEmail) {
          bestEmail = e;
          found.found_email = true;
        }
        break;
      }
      for (const p of sig.phones) {
        if (!bestPhone) {
          bestPhone = p;
          found.found_phone = true;
        }
        break;
      }
      if (!bestWebsite) {
        const cand = sig.canonicalUrl || sig.ogUrl;
        if (cand) {
          const candUrl = safeUrl(cand);
          if (candUrl && leadHasStandaloneWebsite(cand) && !isDirectoryHost(candUrl.hostname)) {
            bestWebsite = cand.split("#")[0];
            found.found_website = true;
          }
        }
      }
      if (!bestContactPage && sig.contactUrls[0]) {
        bestContactPage = sig.contactUrls[0];
        found.found_contact_page = true;
      }
      for (const f of sig.facebookUrls) {
        if (!bestFb) {
          bestFb = f;
          found.found_facebook = true;
        }
        break;
      }
      if (!bestCity && sig.city) {
        bestCity = sig.city;
        found.found_city = true;
      }
      if (!bestState && sig.state) {
        bestState = sig.state;
        found.found_state = true;
      }
      if (!bestCategory && sig.category) {
        bestCategory = sig.category;
        found.found_category = true;
      }
    }

    if (bestWebsite && leadHasStandaloneWebsite(bestWebsite) && (!bestEmail || !bestPhone || !bestContactPage)) {
      const fetched = await fetchHtmlPage(bestWebsite);
      if (fetched && !isFacebookUrl(fetched.finalUrl)) {
        const sig = parseHtmlForSignals(fetched.html, fetched.finalUrl);
        if (!bestEmail && sig.emails[0]) {
          bestEmail = sig.emails[0];
          found.found_email = true;
        }
        if (!bestPhone && sig.phones[0]) {
          bestPhone = sig.phones[0];
          found.found_phone = true;
        }
        if (!bestContactPage && sig.contactUrls[0]) {
          bestContactPage = sig.contactUrls[0];
          found.found_contact_page = true;
        }
        if (!bestFb && sig.facebookUrls[0]) {
          bestFb = sig.facebookUrls[0];
          found.found_facebook = true;
        }
      }
    }

    if (!bestWebsite) {
      for (const q of buildSearchQueries({
        business_name,
        city: bestCity,
        state: bestState,
        source_label,
      })) {
        const hit = await serpApiFirstBusinessWebsite(q);
        if (hit) {
          bestWebsite = hit;
          found.found_website = true;
          const inner = await fetchHtmlPage(hit);
          if (inner) {
            const sig = parseHtmlForSignals(inner.html, inner.finalUrl);
            if (!bestEmail && sig.emails[0]) {
              bestEmail = sig.emails[0];
              found.found_email = true;
            }
            if (!bestPhone && sig.phones[0]) {
              bestPhone = sig.phones[0];
              found.found_phone = true;
            }
            if (!bestContactPage && sig.contactUrls[0]) {
              bestContactPage = sig.contactUrls[0];
              found.found_contact_page = true;
            }
          }
          break;
        }
      }
    }

    if (bestWebsite && !bestContactPage) {
      const probed = await resolveContactPage(bestWebsite);
      if (probed) {
        bestContactPage = probed;
        found.found_contact_page = true;
      }
    }

    if (bestWebsite && !bestEmail && bestContactPage) {
      const cp = await fetchHtmlPage(bestContactPage);
      if (cp) {
        const sig = parseHtmlForSignals(cp.html, cp.finalUrl);
        if (sig.emails[0]) {
          bestEmail = sig.emails[0];
          found.found_email = true;
        }
        if (!bestPhone && sig.phones[0]) {
          bestPhone = sig.phones[0];
          found.found_phone = true;
        }
      }
    }

    const patchRaw: Record<string, unknown> = {};
    const updatedFields: string[] = [];

    const allowWebsiteUpgrade =
      !existingWebsite ||
      isFacebookUrl(existingWebsite) ||
      isDirectoryHost(safeUrl(existingWebsite)?.hostname || "");

    if (bestWebsite && allowWebsiteUpgrade && leadHasStandaloneWebsite(bestWebsite)) {
      const w = bestWebsite.startsWith("http") ? bestWebsite : `https://${bestWebsite}`;
      patchRaw.website = w;
      patchRaw.normalized_website = normalizeWebsiteUrl(w) || null;
      patchRaw.has_website = true;
      updatedFields.push("website", "normalized_website", "has_website");
    }

    if (bestPhone && !existingPhone) {
      patchRaw.phone = bestPhone;
      updatedFields.push("phone");
    }

    if (bestEmail && !existingEmail) {
      patchRaw.email = bestEmail;
      patchRaw.email_source = trimStr(lead.email_source) || "enrichment";
      updatedFields.push("email", "email_source");
    }

    if (bestFb && !existingFb) {
      const f = bestFb.startsWith("http") ? bestFb : `https://${bestFb}`;
      patchRaw.facebook_url = f;
      patchRaw.normalized_facebook_url = normalizeFacebookUrl(f) || null;
      updatedFields.push("facebook_url", "normalized_facebook_url");
    }

    if (bestContactPage && !existingContact) {
      patchRaw.contact_page = bestContactPage;
      updatedFields.push("contact_page");
    }

    if (bestCity && !trimStr(lead.city)) {
      patchRaw.city = bestCity;
      updatedFields.push("city");
    }
    if (bestState && !trimStr(lead.state)) {
      patchRaw.state = bestState;
      updatedFields.push("state");
    }
    if (bestCategory && !trimStr(lead.category)) {
      patchRaw.category = bestCategory;
      updatedFields.push("category");
    }

    if (!trimStr(lead.source_url) && bestWebsite) {
      patchRaw.source_url = bestWebsite;
      updatedFields.push("source_url");
    }

    const willHaveStandaloneSite =
      Boolean(
        (bestWebsite && allowWebsiteUpgrade && leadHasStandaloneWebsite(bestWebsite)) ||
          (existingWebsite &&
            leadHasStandaloneWebsite(existingWebsite) &&
            !websiteIsWeakOrSocial(existingWebsite))
      );

    if (Array.isArray(lead.lead_tags) && willHaveStandaloneSite) {
      const prevLen = (lead.lead_tags as string[]).length;
      const toDrop = new Set<string>();
      if ((lead.lead_tags as string[]).includes("no_website_opportunity")) {
        toDrop.add("no_website_opportunity");
      }
      if ((lead.lead_tags as string[]).includes("facebook_only")) {
        toDrop.add("facebook_only");
      }
      if (toDrop.size > 0) {
        const nextTags = mergeTagsRemoveNoWebsite(lead.lead_tags, toDrop);
        if (nextTags.length !== prevLen) {
          patchRaw.lead_tags = nextTags;
          updatedFields.push("lead_tags");
        }
      }
    }

    const patch = pickLeadPatchFields(patchRaw);
    const meaningfulKeys = Object.keys(patch).filter((k) => k !== "lead_tags" || updatedFields.includes("lead_tags"));

    if (meaningfulKeys.length === 0) {
      await logEv("lead_enrichment_no_change", {
        found_phone: Boolean(found.found_phone),
        found_website: Boolean(found.found_website),
        found_email: Boolean(found.found_email),
        found_contact_page: Boolean(found.found_contact_page),
      });
      return {
        ok: true,
        leadId,
        enriched: false,
        updatedFields: [],
        message: "No new contact info found",
      };
    }

    const { error: upErr } = await supabase.from("leads").update(patch).eq("id", leadId).eq("owner_id", ownerId);
    if (upErr) {
      console.warn("[lead-enrich] update failed", upErr.message);
      await logEv("lead_enrichment_no_change", { error: upErr.message });
      return {
        ok: true,
        leadId,
        enriched: false,
        updatedFields: [],
        message: "Could not save enrichment (try again later)",
      };
    }

    const uniqFields = Array.from(new Set(updatedFields));

    await logEv("lead_enrichment_completed", {
      found_phone: Boolean(found.found_phone),
      found_website: Boolean(found.found_website),
      found_email: Boolean(found.found_email),
      found_contact_page: Boolean(found.found_contact_page),
      updated_fields: uniqFields,
    });

    return {
      ok: true,
      leadId,
      enriched: true,
      updatedFields: uniqFields,
      message: "Lead enriched",
    };
  } catch (e) {
    console.warn("[lead-enrich] failed", e);
    await logEv("lead_enrichment_no_change", { error: String(e) });
    return {
      ok: true,
      leadId,
      enriched: false,
      updatedFields: [],
      message: "Enrichment skipped due to an error",
    };
  }
}
