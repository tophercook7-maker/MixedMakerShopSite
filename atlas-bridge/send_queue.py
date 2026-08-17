#!/usr/bin/env python3
"""
CRM outbound send queue — DRAFT-FIRST, per-lead approval, never blanket auto-send.

Topher approves a lead by adding the tag `approved-to-send` to it in the CRM. This
worker finds those leads, sends them their pre-built preview link (from his Gmail),
marks them sent, and stops at a daily cap. Nothing sends without his explicit per-lead
approval — this is the opposite of the Lane-A blanket auto-send we paused.

Guardrails: DAILY_CAP total/day, PER_RUN cap, pacing between sends, an opt-out line in
every email, and it only sends when a REAL preview URL exists (never a broken link).
Approve a lead → add tag `approved-to-send`. Kill switch → create atlas-bridge/.QUEUE_HOLD.
"""
import json
import re
import ssl
import smtplib
import sys
import time
import urllib.request
import urllib.parse
from email.message import EmailMessage
from pathlib import Path
from datetime import datetime, timezone

DRY_RUN = "--dry-run" in sys.argv

HERE = Path(__file__).parent
ENV = Path.home() / "Projects/MixedMakerShopSite/next-app/.env.production.local"
DAILY_CAP = 20
PER_RUN = 5
PACE_SECONDS = 8
REPLY_TO = "topher@mixedmakershop.com"


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
GMAIL_USER = env("GMAIL_USER")
GMAIL_PASS = env("GMAIL_APP_PASSWORD")


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
        raise SystemExit("No CRM owner profile.")
    return rows[0]["id"]


def valid_email(e):
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", str(e or "").strip()))


def preview_url_for(owner, lead):
    """A real preview link or None — never send without one."""
    for field in (lead.get("recommended_next_action"), lead.get("notes")):
        m = re.search(r"https?://mms-previews\.pages\.dev/[^\s)]+", str(field or ""))
        if m:
            return m.group(0)
    rows = rest("GET", "crm_mockups",
                params=f"?select=mockup_slug&owner_id=eq.{owner}&lead_id=eq.{lead['id']}&limit=1")
    slug = rows[0]["mockup_slug"] if rows and rows[0].get("mockup_slug") else ""
    return f"https://mixedmakershop.com/preview/{slug}" if slug else None


def sent_today(owner):
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    rows = rest("GET", "lead_activities",
                params=f"?select=id&type=eq.outbound_queue_sent&created_at=gte.{urllib.parse.quote(start)}&limit=1000")
    return len(rows)


def email_body(name, business, city, preview):
    greet = (name or "there").strip() or "there"
    where = f"{city} " if city else ""
    return (
        f"Hi {greet},\n\n"
        f"I build websites for {where}small businesses, and I put together a free custom preview "
        f"for {business} — a real look at what your site could be, no obligation:\n\n"
        f"{preview}\n\n"
        f"If you like the direction, I'd love to build it out for you. If not, no worries at all.\n\n"
        f"Topher\nMixed Maker Shop\nmixedmakershop.com\n\n"
        f"(Reply STOP and I won't reach out again.)"
    )


def send_email(to, subject, body):
    msg = EmailMessage()
    msg["From"] = f"Topher Cook <{GMAIL_USER}>"
    msg["To"] = to
    msg["Reply-To"] = REPLY_TO
    msg["Subject"] = subject
    msg.set_content(body)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ssl.create_default_context(), timeout=25) as s:
        s.login(GMAIL_USER, GMAIL_PASS)
        s.send_message(msg)


def main():
    if (HERE / ".QUEUE_HOLD").exists():
        print("[send-queue] .QUEUE_HOLD present — not sending.")
        return
    if not (SR_KEY and GMAIL_USER and GMAIL_PASS):
        raise SystemExit("Missing Supabase or Gmail creds in env.")
    owner = owner_id()

    already = sent_today(owner)
    if already >= DAILY_CAP:
        print(f"[send-queue] daily cap reached ({already}/{DAILY_CAP}).")
        return

    # Leads Topher approved (tag approved-to-send) that we haven't sent yet.
    rows = rest("GET", "leads",
                params=("?select=id,business_name,email,city,lead_tags,recommended_next_action,notes"
                        f"&owner_id=eq.{owner}&lead_tags=cs.{{approved-to-send}}&limit=200"))
    budget = min(PER_RUN, DAILY_CAP - already)
    sent = skipped = 0
    for lead in rows:
        if sent >= budget:
            break
        tags = lead.get("lead_tags") or []
        if "sent-by-queue" in tags:
            continue
        email = str(lead.get("email") or "").strip()
        if not valid_email(email):
            skipped += 1
            continue
        preview = preview_url_for(owner, lead)
        if not preview:
            skipped += 1
            continue  # never send without a real preview

        business = lead.get("business_name") or "your business"
        if DRY_RUN:
            print(f"  [dry-run] WOULD send → {business} <{email}>  preview={preview}")
            sent += 1
            continue
        try:
            send_email(email, f"A free website preview I built for {business}",
                       email_body(email.split("@")[0], business, lead.get("city"), preview))
        except Exception as e:  # noqa: BLE001
            print(f"  ! send failed {business} <{email}>: {e}")
            skipped += 1
            continue

        new_tags = [t for t in tags if t != "approved-to-send"] + ["sent-by-queue"]
        rest("PATCH", "leads",
             body={"lead_tags": new_tags, "status": "contacted",
                   "last_updated_at": datetime.now(timezone.utc).isoformat()},
             params=f"?id=eq.{lead['id']}")
        rest("POST", "lead_activities",
             body={"lead_id": lead["id"], "type": "outbound_queue_sent",
                   "message": f"Sent approved preview to {email}",
                   "metadata": {"preview": preview}})
        print(f"  ✓ sent {business} <{email}>")
        sent += 1
        if sent < budget:
            time.sleep(PACE_SECONDS)

    print(f"[send-queue] sent {sent}, skipped {skipped}, prior-today {already}, cap {DAILY_CAP}.")


if __name__ == "__main__":
    main()
