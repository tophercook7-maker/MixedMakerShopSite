#!/usr/bin/env python3
"""
Atlas Lane-B discovery → CRM bridge.

Reads the nightly lead-discovery TSVs (~/AI-Labs/ops/leads/<date>.tsv, 7 tab cols:
name, city, busy-signal, site-flaw, website, email, price) and inserts genuinely-NEW
prospects into the Supabase CRM `leads` table so the daily discovery firehose flows
into the same board as inbound + Lane-A outbound.

REVIEW-FIRST + NON-DESTRUCTIVE: sends nothing, and SKIPS any email already in the CRM
(from inbound or Lane-A) so it never clobbers an existing lead. Only adds new ones.
Idempotent — safe to re-run / schedule daily. Carries the discovery's site-flaw as the
lead's "why this lead is here" and the discovery date + price in notes.
"""
import json
import urllib.request
import urllib.parse
import glob
import os
from pathlib import Path
from datetime import datetime, timezone

LEADS_DIR = Path.home() / "AI-Labs/ops/leads"
ENV = Path.home() / "Projects/MixedMakerShopSite/next-app/.env.production.local"
SOURCE = "atlas-discovery"


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
    req.add_header("apikey", SR_KEY)
    req.add_header("Authorization", f"Bearer {SR_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    with urllib.request.urlopen(req, timeout=20) as r:
        txt = r.read().decode()
        return json.loads(txt) if txt else []


def owner_id():
    rows = rest("GET", "profiles", params="?select=id&limit=1")
    if not rows:
        raise SystemExit("No CRM owner profile found.")
    return rows[0]["id"]


def existing_emails(owner):
    """All emails already in the CRM (any source) — so we never clobber/duplicate."""
    seen = set()
    step = 1000
    off = 0
    while True:
        rows = rest("GET", "leads",
                    params=f"?select=email&owner_id=eq.{owner}&email=not.is.null&limit={step}&offset={off}")
        for r in rows:
            e = str(r.get("email") or "").strip().lower()
            if e:
                seen.add(e)
        if len(rows) < step:
            break
        off += step
    return seen


def split_city(raw):
    raw = str(raw or "").strip()
    if "," in raw:
        c, s = raw.rsplit(",", 1)
        return c.strip(), s.strip()
    return raw, None


def infer_category(name):
    n = (name or "").lower()
    for kw, cat in (("plumb", "Plumbing"), ("roof", "Roofing"), ("hvac", "HVAC"),
                    ("electric", "Electrical"), ("landscap", "Landscaping"),
                    ("salon", "Salon"), ("auto", "Automotive"), ("repair", "Repair"),
                    ("clean", "Cleaning"), ("pool", "Pool"), ("law", "Legal"),
                    ("dental", "Dental"), ("concrete", "Concrete"), ("counter", "Countertops"),
                    ("restaurant", "Restaurant"), ("cafe", "Restaurant")):
        if kw in n:
            return cat
    return None


def parse_tsv(path):
    date_str = Path(path).stem  # YYYY-MM-DD
    rows = []
    for line in Path(path).read_text(errors="replace").splitlines():
        if not line.strip():
            continue
        cols = line.split("\t")
        if len(cols) < 6:
            continue
        name, city, signal, flaw, website, email = (cols + [""] * 7)[:6]
        price = cols[6] if len(cols) > 6 else ""
        rows.append({
            "name": name.strip(), "city": city.strip(), "signal": signal.strip(),
            "flaw": flaw.strip(), "website": website.strip(), "email": email.strip(),
            "price": price.strip(), "discovered": date_str,
        })
    return rows


def build_row(owner, r):
    name = r["name"]
    if not name:
        return None
    email = r["email"] or None
    website = r["website"] or None
    city, state = split_city(r["city"])
    flaw = r["flaw"]
    notes = "\n".join([l for l in [
        f"Atlas discovery {r['discovered']} — not yet contacted.",
        f"Site issue: {flaw}" if flaw else "",
        f"Signal: {r['signal']}" if r["signal"] else "",
        f"Suggested offer: {r['price']}" if r["price"] else "",
    ] if l])
    return {
        "owner_id": owner,
        "business_name": name,
        "email": email,
        "website": website,
        "city": city or None,
        "state": state,
        "category": infer_category(name),
        "source": SOURCE,
        "lead_source": SOURCE,
        "status": "new",
        "lead_tags": ["outbound", "discovery"],
        "has_website": bool(website),
        "why_this_lead_is_here": (f"Discovered prospect — {flaw}" if flaw else "Discovered prospect (Atlas nightly scan)."),
        "recommended_next_action": "Review — discovered prospect, not yet contacted. Build a preview if worth pursuing.",
        "notes": notes,
        "last_updated_at": datetime.now(timezone.utc).isoformat(),
    }


def main():
    if not SR_KEY:
        raise SystemExit("No SUPABASE_SERVICE_ROLE_KEY in env.")
    if not LEADS_DIR.exists():
        raise SystemExit(f"No leads dir: {LEADS_DIR}")

    owner = owner_id()
    already = existing_emails(owner)

    # Gather + dedupe within the discovery set (keep the EARLIEST discovery per email).
    seen_in_run = set()
    to_insert = []
    for path in sorted(glob.glob(str(LEADS_DIR / "*.tsv"))):
        for r in parse_tsv(path):
            email = (r["email"] or "").lower()
            key = email or f"name::{r['name'].lower()}"
            if key in seen_in_run:
                continue
            seen_in_run.add(key)
            if email and email in already:
                continue  # already in CRM (inbound / Lane-A / prior run) — never clobber
            row = build_row(owner, r)
            if row:
                to_insert.append(row)

    inserted = failed = 0
    # Batch insert for speed (PostgREST accepts arrays).
    BATCH = 100
    for i in range(0, len(to_insert), BATCH):
        chunk = [{**x, "created_at": x["last_updated_at"]} for x in to_insert[i:i + BATCH]]
        try:
            rest("POST", "leads", body=chunk)
            inserted += len(chunk)
        except Exception as e:  # noqa: BLE001
            # Fall back to one-by-one so one bad row doesn't sink the batch.
            for x in chunk:
                try:
                    rest("POST", "leads", body={**x, "created_at": x["last_updated_at"]})
                    inserted += 1
                except Exception as e2:  # noqa: BLE001
                    failed += 1
                    print(f"  ! {x['business_name']}: {e2}")

    print(f"Discovery→CRM sync: {inserted} new inserted, {failed} failed, "
          f"{len(seen_in_run)} unique discovered, {len(already)} already in CRM (skipped).")


if __name__ == "__main__":
    main()
