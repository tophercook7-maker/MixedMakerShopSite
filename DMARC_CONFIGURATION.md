# DMARC Configuration for mixedmakershop.com

## Overview

This document describes the DMARC (Domain-based Message Authentication, Reporting and Conformance) configuration used by the MixedMakerShop domain to improve email deliverability, protect against spoofing, and signal domain trust to email providers.

## DNS Configuration

DNS records for mixedmakershop.com are managed through **Netlify DNS** (domain uses Netlify nameservers).

## Required DMARC Record

| Setting | Value |
|---------|-------|
| **Host** | `_dmarc` |
| **Type** | `TXT` |
| **Value** | `v=DMARC1; p=quarantine; rua=mailto:topher@mixedmakershop.com; fo=1` |

### Adding the Record in Netlify DNS

1. Log in to Netlify Dashboard
2. Go to **Domain management** → select **mixedmakershop.com**
3. Under **DNS records**, add a new record:
   - **Type:** TXT
   - **Host / Name:** `_dmarc` (or `_dmarc.mixedmakershop.com` if Netlify requires full subdomain)
   - **Value:** `v=DMARC1; p=quarantine; rua=mailto:topher@mixedmakershop.com; fo=1`

## Record Components Explained

| Tag | Value | Purpose |
|-----|-------|---------|
| `v` | DMARC1 | Specifies the DMARC protocol version |
| `p` | quarantine | Tells email providers to treat unauthenticated mail as suspicious (quarantine or flag) |
| `rua` | mailto:topher@mixedmakershop.com | Sends aggregate DMARC reports to this address |
| `fo` | 1 | Ensures reports are generated when SPF or DKIM authentication fails |

## Policy Notes

- **p=quarantine**: Unauthenticated messages may be routed to spam/junk. For stricter enforcement, use `p=reject` (blocks delivery). `quarantine` is a balanced default.
- **rua**: Aggregate reports help you monitor authentication failures and adjust SPF/DKIM if needed.

## Expected Results

- **Improved inbox placement** — Stronger domain trust signals for legitimate mail
- **Reduced spoofing risk** — Receiving providers can reject or quarantine spoofed messages
- **Visibility** — Aggregate reports at topher@mixedmakershop.com show authentication status

## Related Documentation

- [NETLIFY_FORM_NOTIFICATIONS.md](NETLIFY_FORM_NOTIFICATIONS.md) — Ensures form notification emails are sent from Netlify (formresponses@netlify.com), not from @mixedmakershop.com, to avoid DMARC/DKIM conflicts.
