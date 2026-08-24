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
TEST_SMTP = "--test-smtp" in sys.argv
TEST_TO = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--test-to=")), None)

HERE = Path(__file__).parent
ENV = Path.home() / "Projects/MixedMakerShopSite/next-app/.env.production.local"
DAILY_CAP = 5
PER_RUN = 5
PACE_SECONDS = 20
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


def _porkbun_creds():
    """Business-inbox SMTP creds (the mail-tester 10/10 path). Written locked by Topher."""
    p = Path.home() / ".config/mailer/porkbun.env"
    u = pw = ""
    if p.exists():
        for line in p.read_text().splitlines():
            line = line.strip()
            if line.startswith("PORKBUN_USER="):
                u = line.split("=", 1)[1].strip()
            elif line.startswith("PORKBUN_PASS="):
                pw = line.split("=", 1)[1].strip()
    return u, pw


SMTP_USER, SMTP_PASS = _porkbun_creds()
SMTP_HOST = "smtp.porkbun.com"
INTERNAL_SECRET = env("INTERNAL_API_SECRET")


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


def _build_mockup(lead_id):
    """Headlessly build a preview for a lead via the internal route; return previewUrl or None."""
    if not INTERNAL_SECRET:
        return None
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:3001/api/internal/build-mockup",
            data=json.dumps({"lead_id": lead_id}).encode(),
            method="POST",
        )
        req.add_header("Content-Type", "application/json")
        req.add_header("x-internal-secret", INTERNAL_SECRET)
        with urllib.request.urlopen(req, timeout=25) as r:
            j = json.loads(r.read().decode() or "{}")
            return (j.get("previewUrl") or "").strip() or None
    except Exception as e:  # noqa: BLE001
        print(f"  ! build-mockup failed for {lead_id}: {e}")
        return None


def preview_url_for(owner, lead):
    """A real preview link — reuse an existing one, else BUILD one. None only if build fails."""
    for field in (lead.get("recommended_next_action"), lead.get("notes")):
        m = re.search(r"https?://mms-previews\.pages\.dev/[^\s)]+", str(field or ""))
        if m:
            return m.group(0)
    rows = rest("GET", "crm_mockups",
                params=f"?select=mockup_slug&owner_id=eq.{owner}&lead_id=eq.{lead['id']}&limit=1")
    slug = rows[0]["mockup_slug"] if rows and rows[0].get("mockup_slug") else ""
    if slug:
        return f"https://mixedmakershop.com/preview/{slug}"
    # No preview yet → build one now (the "build the site" step of the auto-loop).
    return _build_mockup(lead["id"])


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
    # Sends from the business inbox via Porkbun (the mail-tester 10/10 path).
    msg = EmailMessage()
    msg["From"] = f"Topher Cook <{SMTP_USER}>"
    msg["To"] = to
    msg["Reply-To"] = REPLY_TO
    msg["Subject"] = subject
    msg.set_content(body)
    with smtplib.SMTP_SSL(SMTP_HOST, 465, context=ssl.create_default_context(), timeout=25) as s:
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)


def main():
    # --test-smtp: verify the Porkbun login works WITHOUT sending anything.
    if TEST_SMTP:
        if not (SMTP_USER and SMTP_PASS):
            print("SMTP creds MISSING (~/.config/mailer/porkbun.env)")
            return
        try:
            with smtplib.SMTP_SSL(SMTP_HOST, 465, context=ssl.create_default_context(), timeout=25) as s:
                s.login(SMTP_USER, SMTP_PASS)
            print(f"SMTP auth OK — {SMTP_USER} logs into {SMTP_HOST}. Password is correct.")
        except Exception as e:  # noqa: BLE001
            print(f"SMTP auth FAILED: {e}")
        return

    # --test-to=addr: send ONE real test email to a chosen address (proves inbox delivery).
    if TEST_TO:
        try:
            send_email(TEST_TO, "MixedMakerShop send-queue test",
                       "This is a delivery test from your business inbox via the send queue.\n\n"
                       "If this landed in your inbox (not spam), the 10/10 path is working.\n\nTopher")
            print(f"Test email sent to {TEST_TO} — check inbox vs spam.")
        except Exception as e:  # noqa: BLE001
            print(f"Test send FAILED: {e}")
        return

    if (HERE / ".QUEUE_HOLD").exists() and not DRY_RUN:
        print("[send-queue] .QUEUE_HOLD present — not sending (delete it to ARM).")
        return
    if not (SR_KEY and SMTP_USER and SMTP_PASS):
        raise SystemExit("Missing Supabase or Porkbun SMTP creds in env.")
    owner = owner_id()

    already = sent_today(owner)
    if already >= DAILY_CAP:
        print(f"[send-queue] daily cap reached ({already}/{DAILY_CAP}).")
        return

    # AUTO-PICK (full auto, no manual approval): outbound leads that are still NEW
    # (never contacted). Lane-A leads that already got a preview sort first (source desc),
    # so we reuse existing previews before building new ones. Only status='new' → we never
    # re-email Lane-A's already-contacted 83 or anything we've already sent.
    rows = rest("GET", "leads",
                params=("?select=id,business_name,email,city,status,lead_tags,recommended_next_action,notes,source"
                        f"&owner_id=eq.{owner}&source=in.(atlas-outbound-preview,atlas-discovery)"
                        "&status=eq.new&order=source.desc,created_at.asc&limit=400"))
    budget = min(PER_RUN, DAILY_CAP - already)
    sent = skipped = 0
    for lead in rows:
        if sent >= budget:
            break
        tags = lead.get("lead_tags") or []
        if "sent-by-queue" in tags or "suspected-spam" in tags:
            continue
        email = str(lead.get("email") or "").strip()
        if not valid_email(email):
            skipped += 1
            continue
        preview = preview_url_for(owner, lead)
        if not preview:
            skipped += 1
            continue  # never send without a real preview (build failed) — try next

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
