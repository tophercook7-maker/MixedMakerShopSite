#!/usr/bin/env python3
"""
Atlas email watcher — watches the business inbox (topher@mixedmakershop.com) for replies
to the auto-mailer and pings Topher's phone the moment a prospect responds.

For each NEW message: if the sender matches a CRM lead we emailed, mark that lead
'replied' (or do-not-contact on STOP) so the mailer never emails them again, log the
activity, and push a phone alert. First run just baselines existing mail (no alert spam).

Read-only on the inbox (BODY.PEEK — never marks your mail read). IMAP creds = the same
locked ~/.config/mailer/porkbun.env. Runs every ~20 min under launchd.
"""
import imaplib
import ssl
import json
import re
import email
import urllib.request
import urllib.parse
from email.header import decode_header
from pathlib import Path
from datetime import datetime, timezone

ENV = Path.home() / "Projects/MixedMakerShopSite/next-app/.env.production.local"
PORK = Path.home() / ".config/mailer/porkbun.env"
STATE = Path.home() / ".config/mailer/reply-watcher-seen.json"


def _read(path, key):
    if not path.exists():
        return ""
    for line in path.read_text().splitlines():
        line = line.strip()
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip()
    return ""


IMAP_USER = _read(PORK, "PORKBUN_USER")
IMAP_PASS = _read(PORK, "PORKBUN_PASS")
SUPA_URL = _read(ENV, "NEXT_PUBLIC_SUPABASE_URL") or "http://127.0.0.1:54321"
SR_KEY = _read(ENV, "SUPABASE_SERVICE_ROLE_KEY")
NTFY = _read(ENV, "NTFY_TOPIC") or "topher-cook-sales-2291"


def ntfy(title, msg, tag="email"):
    try:
        req = urllib.request.Request(f"https://ntfy.sh/{NTFY}", data=msg.encode(), method="POST")
        req.add_header("Title", title)
        req.add_header("Tags", tag)
        urllib.request.urlopen(req, timeout=10)
    except Exception:  # noqa: BLE001
        pass


def rest(method, path, body=None, params=""):
    url = f"{SUPA_URL}/rest/v1/{path}{params}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in (("apikey", SR_KEY), ("Authorization", f"Bearer {SR_KEY}"),
                 ("Content-Type", "application/json"), ("Prefer", "return=representation")):
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=15) as r:
        txt = r.read().decode()
        return json.loads(txt) if txt else []


def owner_id():
    rows = rest("GET", "profiles", params="?select=id&limit=1")
    return rows[0]["id"] if rows else ""


def decode(s):
    if not s:
        return ""
    out = []
    for part, enc in decode_header(s):
        out.append(part.decode(enc or "utf-8", "replace") if isinstance(part, bytes) else part)
    return "".join(out)


def sender_email(from_hdr):
    m = re.search(r"[\w.+-]+@[\w.-]+\.[a-z]{2,}", from_hdr or "", re.I)
    return m.group(0).lower() if m else ""


def body_text(msg):
    try:
        if msg.is_multipart():
            for p in msg.walk():
                if p.get_content_type() == "text/plain":
                    return p.get_payload(decode=True).decode("utf-8", "replace")
        else:
            return msg.get_payload(decode=True).decode("utf-8", "replace")
    except Exception:  # noqa: BLE001
        return ""
    return ""


def load_state():
    if STATE.exists():
        try:
            return set(json.loads(STATE.read_text()).get("seen", []))
        except Exception:  # noqa: BLE001
            return set()
    return None  # None = never run before (baseline mode)


def save_state(seen):
    STATE.write_text(json.dumps({"seen": sorted(seen)[-2000:]}))


def main():
    if not (IMAP_USER and IMAP_PASS and SR_KEY):
        print("missing creds"); return
    owner = owner_id()

    M = imaplib.IMAP4_SSL("imap.porkbun.com", 993, ssl_context=ssl.create_default_context())
    M.login(IMAP_USER, IMAP_PASS)
    M.select("INBOX")
    typ, data = M.search(None, "ALL")
    uids = data[0].split()
    current = {u.decode() for u in uids}

    seen = load_state()
    if seen is None:
        # First run — baseline everything already in the inbox, alert nothing.
        save_state(current)
        print(f"[atlas email-watch] baselined {len(current)} existing messages; watching for new replies.")
        M.logout(); return

    new = [u for u in uids if u.decode() not in seen]
    notified = 0
    for uid in new:
        try:
            typ, mdata = M.fetch(uid, "(BODY.PEEK[])")  # PEEK = don't mark read
            msg = email.message_from_bytes(mdata[0][1])
        except Exception:  # noqa: BLE001
            continue
        frm = sender_email(decode(msg.get("From")))
        subj = decode(msg.get("Subject"))
        body = body_text(msg)[:400]
        if not frm:
            continue
        lead = rest("GET", "leads",
                    params=f"?select=id,business_name,lead_tags,status&owner_id=eq.{owner}&email=eq.{urllib.parse.quote(frm)}&limit=1")
        if lead:
            l = lead[0]
            biz = l.get("business_name") or frm
            tags = l.get("lead_tags") or []
            is_stop = bool(re.search(r"\b(stop|unsubscribe|remove me|opt out)\b", (subj + " " + body).lower()))
            new_status = "do_not_contact" if is_stop else "replied"
            new_tag = "do-not-contact" if is_stop else "replied"
            rest("PATCH", "leads",
                 body={"status": new_status, "lead_tags": list(set(tags + [new_tag])),
                       "last_updated_at": datetime.now(timezone.utc).isoformat()},
                 params=f"?id=eq.{l['id']}")
            rest("POST", "lead_activities",
                 body={"lead_id": l["id"], "type": "reply_received",
                       "message": f"{'STOP/opt-out' if is_stop else 'Replied'}: {subj}"[:300]})
            if is_stop:
                ntfy(f"🛑 Opt-out: {biz}", f"{biz} asked to stop. Marked do-not-contact.", "no_entry")
            else:
                ntfy(f"📬 Lead reply: {biz}", f"{biz} replied: {subj}\n\n{body[:160]}", "tada")
            notified += 1
        # (Non-lead emails are ignored — no alert spam for personal/other mail.)
        seen.add(uid.decode())

    for u in current:
        seen.add(u)
    save_state(seen)
    M.logout()
    print(f"[atlas email-watch] {len(new)} new msgs, {notified} lead replies flagged.")


if __name__ == "__main__":
    main()
