#!/usr/bin/env node
/**
 * IndexNow submitter — notifies Bing / Yandex (and IndexNow-participating engines) that
 * URLs have changed, for near-instant crawling. Google does NOT use IndexNow, but still
 * auto-discovers the sitemap via robots.txt.
 *
 * Setup: the key below must be served as text at https://<host>/<key>.txt
 *        (public/<key>.txt). IndexNow fetches that file to verify ownership, so the key
 *        file must be DEPLOYED before submissions succeed.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs            # submit every URL in the live sitemap
 *   node scripts/indexnow-submit.mjs --dry-run  # fetch + list URLs, do not submit
 *   node scripts/indexnow-submit.mjs <url> ...   # submit only the given URLs
 */

const HOST = "mixedmakershop.com";
const KEY = "441edc4a0f76c2a5602841c499063db7";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const explicitUrls = args.filter((a) => a.startsWith("http"));

async function urlsFromSitemap() {
  const res = await fetch(SITEMAP_URL, { headers: { "User-Agent": "indexnow-submit" } });
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const urlList = explicitUrls.length ? explicitUrls : await urlsFromSitemap();
  if (!urlList.length) {
    console.error("No URLs to submit.");
    process.exit(1);
  }
  console.log(`IndexNow: ${urlList.length} URL(s), key ${KEY_LOCATION}`);
  if (dryRun) {
    urlList.forEach((u) => console.log(`  ${u}`));
    console.log("(dry run — nothing submitted)");
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  const body = await res.text().catch(() => "");
  // IndexNow returns 200 (accepted) or 202 (accepted, key validation pending).
  if (res.ok || res.status === 202) {
    console.log(`IndexNow accepted: HTTP ${res.status}`);
  } else {
    console.error(`IndexNow rejected: HTTP ${res.status} ${body}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
