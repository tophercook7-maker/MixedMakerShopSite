# Google Search Console — sitemap submission

Google does **not** use IndexNow, so it discovers content two ways: by crawling the
sitemap referenced in `robots.txt` (already live), and via a one-time **sitemap
submission** in Search Console for faster, proactive indexing. These are the steps for
that submission. (Bing/Yandex are already handled by IndexNow — see
`next-app/scripts/indexnow-submit.mjs` / `npm run indexnow`.)

---

## 0. Verification — already done ✅

The site is already verified via an HTML meta tag rendered on every page:

- `next-app/app/layout.tsx` → `metadata.verification.google` →
  `<meta name="google-site-verification" content="-7hb27xV1J3w47FjfMBRE2FLNGI74FiQMENyqQYmrQ0">`
- Confirmed live at `https://mixedmakershop.com/`.

This verifies a **URL-prefix** property for `https://mixedmakershop.com` for whichever
Google account that token was generated under. If you can already see the property in
Search Console, skip to step 2.

> If you do **not** have access to the account that owns that token, you'll need to
> re-verify under your own account (step 1) — the token can be swapped in `layout.tsx`.

---

## 1. Add the property (only if it isn't already in your account)

1. Go to <https://search.google.com/search-console>.
2. Click the property dropdown (top-left) → **Add property**.
3. Choose one:
   - **Domain** (recommended) — covers `http`/`https`, `www`/non-`www`, and all
     subdomains. Verify by adding a **DNS TXT record** at your domain registrar / DNS
     host. Best long-term option.
   - **URL prefix** — enter `https://mixedmakershop.com`. The existing meta tag already
     satisfies the **HTML tag** verification method, so this verifies instantly if the
     token is yours.
4. Follow the prompt to **Verify**.

To re-verify with a new token instead: in Search Console pick **HTML tag**, copy the new
`content="..."` value, and update `verification.google` in `next-app/app/layout.tsx`,
then deploy.

---

## 2. Submit the sitemap

1. In Search Console, select the `mixedmakershop.com` property.
2. Left nav → **Indexing → Sitemaps**.
3. Under **Add a new sitemap**, enter:  `sitemap.xml`
   (the full URL `https://mixedmakershop.com/sitemap.xml` also works.)
4. Click **Submit**.
5. Within minutes to a day, **Status** should read **Success** with a **Discovered URLs**
   count (~100). If it says "Couldn't fetch," wait and click the row → **Refresh**; the
   sitemap is confirmed live and valid (200, `application/xml`).

---

## 3. (Optional) Prioritize key pages

For a handful of important/new URLs you want crawled sooner:

1. Paste a URL into the **URL inspection** bar at the top.
2. Click **Request indexing**.

Good candidates: `/`, `/web-design`, `/pricing`, `/in-home-computer-repair`,
`/local-seo-services`, `/google-business-profile-help`, the newest blog post.
(Request indexing is rate-limited to a few per day — use it for priority pages only.)

---

## 4. Monitor (over the following days/weeks)

- **Indexing → Sitemaps** — discovered URL count, last read date, any errors.
- **Indexing → Pages** — indexed vs. not-indexed, with reasons.
- **Experience / Enhancements** — Search Console surfaces detected structured data
  (FAQ, Article, Breadcrumb) and any errors once Google re-crawls. The JSON-LD was
  validated live (all parses, correct types), so these should populate cleanly.

---

## Re-submitting later

You normally don't re-submit the sitemap — Google re-reads it automatically. After major
content changes you can hit **Refresh** on the Sitemaps row. For Bing/Yandex, run
`cd next-app && npm run indexnow` after publishing.
