# BIMI Configuration for mixedmakershop.com

## Overview

This document describes the BIMI (Brand Indicators for Message Identification) configuration for MixedMakerShop email branding. BIMI allows inbox providers that support it to display the MixedMakerShop logo next to outgoing emails in the inbox.

## Prerequisites

- **DMARC** must be configured and enforced (see [DMARC_CONFIGURATION.md](DMARC_CONFIGURATION.md))

## DNS Record

| Setting | Value |
|---------|-------|
| **Host** | `default._bimi` |
| **Type** | `TXT` |
| **Value** | `v=BIMI1; l=https://mixedmakershop.com/assets/logo-bimi.svg;` |

### Adding the Record in Netlify DNS

1. Log in to Netlify Dashboard
2. Go to **Domain management** → select **mixedmakershop.com**
3. Under **DNS records**, add a new record:
   - **Type:** TXT
   - **Host / Name:** `default._bimi`
   - **Value:** `v=BIMI1; l=https://mixedmakershop.com/assets/logo-bimi.svg;`

## Record Components Explained

| Tag | Value | Purpose |
|-----|-------|---------|
| `v` | BIMI1 | BIMI protocol version |
| `l` | https://mixedmakershop.com/assets/logo-bimi.svg | URL to the logo file |

## Logo Requirements

The BIMI logo must meet these specifications:

| Requirement | Specification |
|-------------|---------------|
| **Format** | SVG Tiny PS (Profile for Scalable Vector Graphics) |
| **Aspect ratio** | Square (1:1) |
| **Hosting** | Publicly accessible via HTTPS |
| **Domain** | Hosted on mixedmakershop.com |

### Logo File

- **Path:** `/assets/logo-bimi.svg`
- **URL:** `https://mixedmakershop.com/assets/logo-bimi.svg`

Place the SVG Tiny PS–compliant logo file at `assets/logo-bimi.svg` in the project. Some BIMI providers accept standard SVG; others require SVG Tiny PS. Use an SVG Tiny PS–compatible file for the broadest support.

## Expected Result

- **Email clients that support BIMI** (e.g., Gmail, Yahoo) may display the MixedMakerShop logo next to messages sent from the domain
- **Improved brand recognition** — Recipients can quickly identify legitimate emails from MixedMakerShop
- **Increased trust** — Logo display reinforces authenticity alongside DMARC authentication

## Support

BIMI support varies by provider. Gmail requires a Verified Mark Certificate (VMC) for logo display; some providers may show logos without a VMC for SVG Tiny PS logos. Results depend on the receiving provider’s implementation.
