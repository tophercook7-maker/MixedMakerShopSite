#!/usr/bin/env python3
"""
Atlas outbound → CRM bridge.

Reads the Lane-A preview pipeline ledger (~/AI-Labs/atlas/preview/pipeline.json) and
upserts each outbound prospect into the local Supabase CRM `leads` table, carrying the
preview Lane A already built (its live URL) and its outreach state. This unifies the two
previously-disconnected lead worlds into one CRM view.

REVIEW-FIRST: this only creates/updates CRM rows. It sends nothing. Prospects land tagged
`outbound` / `atlas-preview` with their preview link in recommended_next_action, so Topher
reviews and sends from one place. Idempotent (keyed by owner_id + email) — safe to re-run.
"""
import json
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone

LEDGER = Path.home() / "AI-Labs/atlas/preview/pipeline.json"
ENV = Path.home() / "Projects/MixedMakerShopSite/next-app/.env.production.local"
SOURCE = "atlas-outbound-preview"


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
        raise SystemExit("No CRM owner profile found — cannot import.")
    return rows[0]["id"]


def split_city(raw):
    raw = str(raw or "").strip()
    if "," in raw:
        city, st = raw.rsplit(",", 1)
        return city.strip(), st.strip()
    return raw, None


# Lane-A lifecycle state → CRM status (+ human note)
STATUS_MAP = {
    "prospect": "new", "built": "new", "unreached": "new",
    "sent": "contacted", "nudged": "contacted",
    "replied": "replied", "won": "won",
    "no": "lost", "expired": "lost",
}


def infer_category(name):
    n = (name or "").lower()
    for kw, cat in (("plumb", "Plumbing"), ("roof", "Roofing"), ("hvac", "HVAC"),
                    ("electric", "Electrical"), ("landscap", "Landscaping"),
                    ("salon", "Salon"), ("auto", "Automotive"), ("repair", "Repair"),
                    ("clean", "Cleaning"), ("pool", "Pool"), ("law", "Legal"),
                    ("dental", "Dental"), ("cafe", "Restaurant"), ("restaurant", "Restaurant")):
        if kw in n:
            return cat
    return None


def build_row(owner, p):
    name = str(p.get("name") or "").strip()
    if not name:
        return None
    email = str(p.get("email") or "").strip() or None
    website = str(p.get("website") or "").strip() or None
    city, state = split_city(p.get("city"))
    la_state = str(p.get("state") or "prospect").strip()
    preview = str(p.get("url") or "").strip()
    sent = str(p.get("sent_date") or "").strip()
    la_notes = str(p.get("notes") or "").strip()

    contacted = la_state in ("sent", "nudged", "replied", "won")
    next_action = (
        (f"Review the pre-built preview: {preview}" if preview else "Build/review a preview")
        + (f"  (Lane A already contacted {sent})" if contacted and sent else "  (not yet contacted — review before sending)")
    )
    note_lines = [
        f"Atlas outbound prospect (Lane A). Lifecycle: {la_state}.",
        f"Preview: {preview}" if preview else "",
        f"Last outreach: {sent}" if sent else "",
        f"Lane A notes: {la_notes}" if la_notes else "",
    ]
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
        "status": STATUS_MAP.get(la_state, "new"),
        "lead_tags": ["outbound", "atlas-preview", f"lane-a:{la_state}"],
        "has_website": bool(website),
        "why_this_lead_is_here": f"Atlas outbound preview prospect — Lane A state '{la_state}'.",
        "recommended_next_action": next_action,
        "notes": "\n".join([l for l in note_lines if l]),
        "last_updated_at": datetime.now(timezone.utc).isoformat(),
    }


def find_existing(owner, email, name):
    if email:
        q = f"?select=id&owner_id=eq.{owner}&email=eq.{urllib.parse.quote(email)}&limit=1"
    else:
        q = f"?select=id&owner_id=eq.{owner}&business_name=eq.{urllib.parse.quote(name)}&source=eq.{SOURCE}&limit=1"
    rows = rest("GET", "leads", params=q)
    return rows[0]["id"] if rows else None


def main():
    if not SR_KEY:
        raise SystemExit("No SUPABASE_SERVICE_ROLE_KEY in env.")
    if not LEDGER.exists():
        raise SystemExit(f"Ledger not found: {LEDGER}")
    ledger = json.loads(LEDGER.read_text())
    leads = ledger.get("leads", ledger)  # tolerate {leads:{...}} or flat
    owner = owner_id()

    prospects = list(leads.values()) if isinstance(leads, dict) else list(leads)
    inserted = updated = skipped = 0
    for p in prospects:
        row = build_row(owner, p)
        if not row:
            skipped += 1
            continue
        existing = find_existing(owner, row["email"], row["business_name"])
        try:
            if existing:
                rest("PATCH", "leads", body=row, params=f"?id=eq.{existing}")
                updated += 1
            else:
                rest("POST", "leads", body={**row, "created_at": row["last_updated_at"]})
                inserted += 1
        except Exception as e:  # noqa: BLE001
            print(f"  ! {row['business_name']}: {e}")
            skipped += 1

    print(f"Atlas→CRM sync done: {inserted} inserted, {updated} updated, {skipped} skipped "
          f"({len(prospects)} in ledger).")


if __name__ == "__main__":
    main()
