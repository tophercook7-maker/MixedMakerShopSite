#!/usr/bin/env python3
"""
Facebook-only businesses → CRM bridge.

Reads ~/AI-Labs/ops/facebook-leads/*.tsv (format: FB || name || city || signal ||
facebook_url || email) and inserts NEW facebook-only prospects into the CRM `leads`
table as prime web-design leads (a page, no website). Includes a ready-to-paste
Facebook message so Topher reaches out MANUALLY — never an auto-DM (that gets FB
accounts banned).

Non-destructive: skips any facebook_url OR email already in the CRM. Idempotent.
"""
import json
import re
import glob
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone

LEADS_DIR = Path.home() / "AI-Labs/ops/facebook-leads"
ENV = Path.home() / "Projects/MixedMakerShopSite/next-app/.env.production.local"
SOURCE = "facebook-discovery"


def env(key):
    if not ENV.exists():
        return ""
    for line in ENV.read_text().splitlines():
        line = line.strip()
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip()
    return ""


SUPA_URL = env("NEXT_PUBLIC_SUPABASE_URL") or "http://127.0.0.1:54321"
SR_KEY = env("SUPABASE_SERVICE_ROLE_KEY")


def rest(method, path, body=None, params=""):
    url = f"{SUPA_URL}/rest/v1/{path}{params}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in (("apikey", SR_KEY), ("Authorization", f"Bearer {SR_KEY}"),
                 ("Content-Type", "application/json"), ("Prefer", "return=representation")):
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=20) as r:
        txt = r.read().decode()
        return json.loads(txt) if txt else []


def owner_id():
    rows = rest("GET", "profiles", params="?select=id&limit=1")
    if not rows:
        raise SystemExit("No CRM owner profile.")
    return rows[0]["id"]


def existing_keys(owner):
    """Emails + facebook_urls already in the CRM, so we never duplicate/clobber."""
    emails, fbs = set(), set()
    step, off = 1000, 0
    while True:
        rows = rest("GET", "leads",
                    params=f"?select=email,facebook_url&owner_id=eq.{owner}&limit={step}&offset={off}")
        for r in rows:
            e = str(r.get("email") or "").strip().lower()
            f = str(r.get("facebook_url") or "").strip().lower().rstrip("/")
            if e:
                emails.add(e)
            if f:
                fbs.add(f)
        if len(rows) < step:
            break
        off += step
    return emails, fbs


def split_city(raw):
    raw = str(raw or "").strip()
    if "," in raw:
        c, s = raw.rsplit(",", 1)
        return c.strip(), s.strip()
    return raw, None


def draft_message(name, city):
    where = f"{city} " if city else ""
    return (f"Hi! I really like what you're doing at {name}. I build websites for {where}"
            f"small businesses, and I noticed you're running everything through Facebook — "
            f"I'd be glad to build you a real website (mixedmakershop.com). Want me to put "
            f"together a free preview so you can see what it'd look like? No obligation.")


def parse(path):
    out = []
    for line in Path(path).read_text(errors="replace").splitlines():
        line = line.strip()
        if not line.startswith("FB"):
            continue
        parts = [p.strip() for p in line.split("||")]
        # FB || name || city || signal || facebook_url || email
        if len(parts) < 5:
            continue
        _, name, city, signal, fb = parts[:5]
        email = parts[5] if len(parts) > 5 else ""
        if not name or "facebook.com" not in fb.lower():
            continue
        out.append({"name": name, "city": city, "signal": signal, "fb": fb, "email": email})
    return out


def main():
    if not SR_KEY:
        raise SystemExit("No SUPABASE_SERVICE_ROLE_KEY.")
    if not LEADS_DIR.exists():
        raise SystemExit(f"No facebook-leads dir yet: {LEADS_DIR} (run find-facebook-businesses.sh first)")
    owner = owner_id()
    emails, fbs = existing_keys(owner)

    seen = set()
    new_rows = []
    for path in sorted(glob.glob(str(LEADS_DIR / "*.tsv"))):
        for r in parse(path):
            fb_key = r["fb"].lower().rstrip("/")
            email = r["email"].strip().lower()
            if fb_key in seen:
                continue
            seen.add(fb_key)
            if fb_key in fbs or (email and email in emails):
                continue
            city, state = split_city(r["city"])
            new_rows.append({
                "owner_id": owner,
                "business_name": r["name"],
                "email": r["email"].strip() or None,
                "facebook_url": r["fb"],
                "website": None,
                "has_website": False,
                "city": city or None,
                "state": state,
                "source": SOURCE,
                "lead_source": SOURCE,
                "status": "new",
                "lead_tags": ["outbound", "facebook-only", "no-website"],
                "why_this_lead_is_here": f"Facebook-only, no website ({r['signal']}) — ideal web-design lead.",
                "recommended_next_action": f"Message on Facebook (manual): {r['fb']}",
                "notes": f"Facebook-only prospect. Signal: {r['signal']}\n\nSuggested FB message:\n{draft_message(r['name'], city)}",
                "last_updated_at": datetime.now(timezone.utc).isoformat(),
            })

    inserted = 0
    for i in range(0, len(new_rows), 100):
        chunk = [{**x, "created_at": x["last_updated_at"]} for x in new_rows[i:i + 100]]
        try:
            rest("POST", "leads", body=chunk)
            inserted += len(chunk)
        except Exception as e:  # noqa: BLE001
            print(f"  ! batch failed: {e}")
    print(f"Facebook→CRM sync: {inserted} new inserted, {len(seen)} unique found, "
          f"{len(new_rows)} were new.")


if __name__ == "__main__":
    main()
