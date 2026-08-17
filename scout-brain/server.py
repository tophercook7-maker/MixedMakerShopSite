#!/usr/bin/env python3
"""
Local Scout Brain — $0, zero-dependency lead enrichment for the MixedMakerShop CRM.

The website's CRM calls POST /api/enrich-lead (contract in next-app/lib/crm/
scout-brain-enrichment.ts). There was never a real service behind it, so inbound
enrichment silently no-op'd. This is a real, local implementation: it fetches the
lead's website, finds concrete problems (no HTTPS, not mobile-friendly, weak SEO,
thin/parked site, or no site at all), scores the opportunity, and returns a
concrete "why this lead is here" + "recommended next action" — the raw material
that makes an auto-generated preview smarter and the outreach sharper.

Pure Python stdlib (http.server + urllib + html.parser): nothing to install.
Binds to 127.0.0.1 only — never exposed. Runs under launchd (KeepAlive).
"""
import json
import os
import re
import ssl
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urljoin, urlparse

PORT = int(os.environ.get("SCOUT_BRAIN_PORT", "8095"))
API_KEY = os.environ.get("SCOUT_BRAIN_ENRICH_KEY", "").strip()  # optional; localhost-bound anyway
FETCH_TIMEOUT = 6.0
UA = "MixedMakerShop-ScoutBrain/1.0 (+local enrichment)"


def _clamp(n, lo, hi):
    return max(lo, min(hi, n))


def _normalize_url(raw):
    u = str(raw or "").strip()
    if not u:
        return ""
    if not re.match(r"^https?://", u, re.I):
        u = "http://" + u
    return u


def _fetch(url):
    """Return (final_url, status, html, used_https, error)."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE  # we only inspect markup; don't fail on cert issues
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=FETCH_TIMEOUT, context=ctx) as resp:
            final = resp.geturl()
            body = resp.read(400_000)  # cap
            html = body.decode("utf-8", errors="replace")
            return final, resp.status, html, final.lower().startswith("https://"), None
    except Exception as e:  # noqa: BLE001 - any failure = unreachable signal
        return url, 0, "", False, str(e)


def _analyze_site(website):
    """Analyze a homepage → (issues[list], signals[dict])."""
    url = _normalize_url(website)
    # Prefer https probe first for the SSL signal.
    https_url = re.sub(r"^http://", "https://", url, flags=re.I)
    final, status, html, used_https, err = _fetch(https_url)
    if status == 0:
        final, status, html, used_https, err = _fetch(url)

    if status == 0:
        return (
            ["Their website did not load (likely broken, expired, or misconfigured)"],
            {"reachable": False, "contact_page": "", "builder": None},
        )

    low = html.lower()
    issues = []
    if not used_https:
        issues.append("No HTTPS/SSL — the site is flagged 'Not Secure' in browsers")
    if "name=\"viewport\"" not in low and "name='viewport'" not in low:
        issues.append("Not mobile-friendly (no responsive viewport tag)")
    if "name=\"description\"" not in low and "name='description'" not in low:
        issues.append("Missing meta description — weak Google SEO")
    title_m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    title = (title_m.group(1).strip() if title_m else "")
    if len(title) < 5:
        issues.append("Weak or missing page title")
    if len(html) < 1500:
        issues.append("Thin / placeholder site — very little real content")

    builder = None
    for name, needle in (("Wix", "wix.com"), ("GoDaddy Builder", "godaddy"),
                         ("Squarespace", "squarespace"), ("Weebly", "weebly")):
        if needle in low:
            builder = name
            break

    # contact page discovery
    contact_page = ""
    m = re.search(r'href=["\']([^"\']*contact[^"\']*)["\']', html, re.I)
    if m:
        contact_page = urljoin(final, m.group(1))

    return issues, {"reachable": True, "title": title, "contact_page": contact_page,
                    "builder": builder, "used_https": used_https, "final_url": final}


def enrich(payload):
    """Return the enriched_lead body in the exact shape the CRM mapper reads
    (map-brain-enrichment-to-lead-patch.ts): `score` drives opportunity/conversion,
    `tags` merges into lead_tags, `best_next_move`+`pitch_angle` → recommended_next_action,
    `why_this_lead_is_here` applies only when the lead's current why is generic."""
    business = str(payload.get("business_name") or "").strip() or "this business"
    website = str(payload.get("website") or "").strip()
    category = str(payload.get("category") or "").strip()

    def out(score, why, best_next_move, pitch, extra_tags, contact_page=None):
        r = {
            "score": int(_clamp(round(score), 0, 100)),
            "why_this_lead_is_here": why,
            "best_next_move": best_next_move,
            "pitch_angle": pitch,
            "category": category or None,
            "tags": ["enriched"] + list(extra_tags),
        }
        if contact_page:
            r["contact_page"] = contact_page
        return r

    if not website:
        return out(
            88,
            f"{business} has no website on file — a brand-new site is the whole pitch.",
            "Send the custom preview",
            "you don't have a site yet — here's one ready to go",
            ["no-website"],
        )

    issues, sig = _analyze_site(website)

    if not sig.get("reachable"):
        return out(
            82,
            f"{business}'s current website didn't load — {issues[0].lower()}.",
            "Show the working preview",
            "their current site appears down/broken",
            ["site-down"],
            sig.get("contact_page"),
        )

    n = len(issues)
    if n == 0:
        return out(
            35,
            f"{business}'s site works and looks maintained — a lighter opportunity, sell polish/speed/leads.",
            "Position as an upgrade",
            "faster, more leads, fresher look — don't imply their site is bad",
            ["has-website"] + (["diy-builder"] if sig.get("builder") else []),
            sig.get("contact_page"),
        )

    opp = _clamp(42 + 12 * n, 42, 92)
    top = issues[:2]
    why = f"{business}'s site has {n} fixable problem{'s' if n != 1 else ''}: " + "; ".join(top) + "."
    first = issues[0].lower()
    if "https" in first:
        pitch = "the 'Not Secure' warning scares off customers"
    elif "mobile" in first:
        pitch = "most of their traffic is on phones and the site isn't mobile-friendly"
    elif "seo" in first or "description" in first:
        pitch = "they're nearly invisible on Google"
    else:
        pitch = issues[0].lower()
    extra = ["has-website"] + (["diy-builder"] if sig.get("builder") else [])
    return out(opp, why, "Show the custom preview and lead with the biggest problem", pitch, extra, sig.get("contact_page"))


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.rstrip("/") in ("/health", "/api/health"):
            return self._send(200, {"ok": True, "service": "scout-brain-local"})
        return self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path.rstrip("/") != "/api/enrich-lead":
            return self._send(404, {"error": "not found"})
        if API_KEY and self.headers.get("X-Scout-Enrich-Key", "") != API_KEY:
            return self._send(401, {"error": "bad key"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
        except Exception as e:  # noqa: BLE001
            return self._send(400, {"error": f"bad json: {e}"})
        try:
            enriched = enrich(payload)
            # Client (scout-brain-enrichment.ts) requires a top-level `ok: true`,
            # else it treats the response as a failure. Keep this.
            return self._send(200, {"ok": True, "enriched_lead": enriched})
        except Exception as e:  # noqa: BLE001
            return self._send(500, {"ok": False, "error": f"enrich failed: {e}"})

    def log_message(self, *args):  # quiet default logging
        pass


if __name__ == "__main__":
    print(f"[scout-brain] listening on http://127.0.0.1:{PORT}/api/enrich-lead", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
