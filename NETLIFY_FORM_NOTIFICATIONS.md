# Netlify Form Notifications — DMARC/DKIM Compliance

## Critical Rule

**Form notification emails must NOT use `topher@mixedmakershop.com` or any `@mixedmakershop.com` address as the From sender.** This causes DMARC/DKIM failures when Netlify (or any third party) sends on behalf of the domain.

## Expected Email Structure

- **From:** `formresponses@netlify.com` (Netlify default) or `notifications@netlify.com`
- **Reply-To:** Visitor-submitted email (from the form's `email` field)

## Dashboard Configuration

1. Go to **Site Settings → Forms → Form notifications** (or **Notifications → Emails and webhooks → Form submission notifications**)
2. For each form, use **Send to email** — Netlify's native notification
3. **Do NOT** configure a custom From address — Netlify does not support this for form notifications; emails should always come from Netlify infrastructure
4. **Do NOT** use Outbound webhooks or Functions that send email via Resend/SMTP using `@mixedmakershop.com` as the sender
5. Ensure each notification uses the visitor's email as **Reply-To** — this happens automatically when the form includes an `<input name="email">` field

## Forms on This Site

All forms below include `name` and `email` for proper Reply-To behavior:

| Form Name              | Location                    | Email Field      |
|------------------------|-----------------------------|------------------|
| contact                | contact.html                | required         |
| website-check          | website-check.html          | required         |
| website-score-check    | index.html                  | optional         |
| free-mockup-request    | index.html                  | required         |
| full-project-inquiry   | index.html                  | required         |
| website-roast-request  | website-roast/index.html    | required         |

## Disabled Code

The `netlify/functions_disabled/` folder contains `send-confirmation.js`, which sends from `Topher@mixedmakershop.com` via Resend. **Do not re-enable or deploy this function** — it causes DMARC/DKIM failures. Form notifications should use Netlify's native email notifications only.

## Result

- Emails are sent from Netlify infrastructure
- DKIM passes (Netlify signs its own domain)
- DMARC no longer reports failures from AWS/third-party senders
- Reply-To points to the visitor so you can reply directly
