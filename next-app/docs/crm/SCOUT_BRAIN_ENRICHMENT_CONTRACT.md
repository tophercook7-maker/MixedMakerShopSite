# Scout Brain ↔ next-app CRM enrichment

## Configuration (next-app)

| Variable | Purpose |
|----------|---------|
| `SCOUT_BRAIN_API_BASE_URL` | Base URL of the Scout Brain FastAPI service (no trailing slash). When unset, server logs a one-line hint and quick-add / enrich use **local** HTML enrichment (`lib/crm/lead-enrich.ts`). |
| `SCOUT_ENRICH_API_KEY` | Preferred. Sent as `X-Scout-Enrich-Key` on `POST /api/enrich-lead`. Must match Scout Brain’s `SCOUT_ENRICH_API_KEY` when Brain auth is enabled. |
| `SCOUT_BRAIN_API_KEY` | Legacy alias for the same header if `SCOUT_ENRICH_API_KEY` is unset. |

Helpers: `getScoutBrainEnrichBaseUrl()`, `scoutBrainEnrichEndpointUrl()`, `logScoutBrainEnrichConfigMissing()` in `lib/crm/scout-brain-enrichment.ts`.

**Timeout:** ~8–12s (default 11s, clamped to that range).

## Endpoint called

`POST {SCOUT_BRAIN_API_BASE_URL}/api/enrich-lead`

## Request payload (next-app → Brain)

```json
{
  "business_name": "string",
  "city": "string",
  "state": "string",
  "source_url": "string",
  "facebook_url": "string",
  "source_type": "extension | facebook | google | manual | unknown | mixed",
  "email": "optional — CRM row",
  "phone": "optional",
  "website": "optional",
  "contact_page": "optional",
  "google_business_url": "optional — Maps/Business URL when already known (CRM or prior Places); Brain does not invent this",
  "conversion_score": "optional int",
  "opportunity_score": "optional int",
  "why_this_lead_is_here": "optional",
  "category": "optional",
  "source": "optional",
  "source_label": "optional"
}
```

These optional fields let Scout Brain **classify** the lead even when Places/crawl return nothing (e.g. paused Google billing). See `docs/crm/LEAD_LANES.md`.

`source_type` comes from `mapCrmLeadRowToBrainType()` in `lib/crm/run-crm-lead-enrichment.ts` using `source`, `lead_source`, `source_label`, `facebook_url`:

| CRM signal | `source_type` |
|------------|----------------|
| `scout_google` | `google` |
| `scout_facebook` | `facebook` |
| `scout_mixed` | `mixed` |
| `extension` + Facebook URL / label | `facebook` |
| `extension` (otherwise) | `extension` |
| `quick_add`, `manual` | `unknown` |

## Response expected (Brain → next-app)

```json
{
  "ok": true,
  "enriched_lead": {
    "business_name": "...",
    "source_type": "...",
    "source_url": "...",
    "facebook_url": "...",
    "google_business_url": "...",
    "website": "...",
    "normalized_website": "...",
    "phone": "...",
    "email": "...",
    "email_source": "...",
    "contact_page": "...",
    "city": "...",
    "state": "...",
    "category": "...",
    "tags": ["..."],
    "score": 0,
    "why_this_lead_is_here": "...",
    "best_contact_method": "email | facebook | phone | contact_form | website | research_later",
    "best_contact_value": "email address, URL, or phone string; null when research_later",
    "advertising_page_url": "primary public-facing link (Facebook / Google listing / site / source)",
    "advertising_page_label": "e.g. Facebook page, Google listing, Website",
    "suggested_template_key": "Brain template id used for copy",
    "suggested_response": "short ready-to-send text",
    "best_next_move": "...",
    "pitch_angle": "...",
    "source_confidence": 0,
    "match_confidence": 0,
    "raw_signals": {},
    "place_id": "...",
    "lead_bucket": "ready_to_contact | has_email | …",
    "contact_readiness": "ready | partial | missing",
    "simplified_next_step": "contact now | message on facebook | call now | research later | skip for now",
    "lane_summary_line": "human-readable",
    "honest_headline": "short owner-facing summary"
  }
}
```

`normalized_facebook_url` is computed in next-app when applying `facebook_url`.

## `POST /api/classify-lead` (Brain only)

Classifies an existing record **without** running Places or site crawl. Same auth as enrich. Request body: optional CRM-shaped fields (`ClassifyLeadBody` in `scout/enriched_lead_schema.py`). Response: `{ "ok": true, "classification": { … } }` with `lead_bucket`, `contact_readiness`, `simplified_next_step`, flags, `honest_headline`, `summary_line`.

## Fields patched on `public.leads`

Mapping: `lib/crm/map-brain-enrichment-to-lead-patch.ts` → `pickLeadPatchFields` in `apply-scout-brain-enrichment.ts`.

- `email`, `email_source` (Brain `phone` → `phone`, `email` → `email` — not `primary_contact_*`)
- `website`, `normalized_website`, `has_website` (no Facebook over a real site)
- `facebook_url`, `normalized_facebook_url`
- `contact_page`, `city`, `state`, `category`
- `why_this_lead_is_here` (only if empty or generic capture text)
- `conversion_score`, `opportunity_score` from Brain `score` (**raise only**)
- `lead_tags` (**union**)
- `recommended_next_action` from `simplified_next_step` when that field is empty, else `best_next_move` + `pitch_angle` (Brain best_contact / pitch are not stored as separate columns in this pass)
- `place_id` (if empty)
- `google_business_url`, `advertising_page_url`, `advertising_page_label`, `best_contact_method`, `best_contact_value`, `suggested_template_key`, `suggested_response` (outreach handoff; see migration `20260320150000_leads_outreach_targets.sql`)

## Outreach templates (Brain)

- `GET /api/outreach-templates` — list templates (same `X-Scout-Enrich-Key` as enrich when `SCOUT_ENRICH_API_KEY` is set).
- `POST /api/outreach-templates` — create (`template_key`, `title`, `channel`, `category`, `body`, `active`).
- `PATCH /api/outreach-templates/{id}` — partial update.

next-app proxies these at `/api/scout/outreach-templates` (server uses env key toward Brain).

## Orchestration

- `fetchScoutBrainEnrichLead()` in `lib/crm/scout-brain-enrichment.ts` performs the HTTP call (structured `{ ok, error }`, no throw).
- `runCrmLeadEnrichmentAfterSave()` in `lib/crm/run-crm-lead-enrichment.ts` logs `lead_enrichment_requested` / `lead_enrichment_completed` / `lead_enrichment_no_change` / `lead_enrichment_failed` with `source: scout_brain` or `local_html`.

## Triggers

1. **`POST /api/crm/quick-add`** — response `message` is the exact string for UI (bookmarklet + quick-add page use `data.message`).
2. **`POST /api/crm/leads/[id]/enrich`** — manual **Enrich now**.

## Scout run (`scan_settings`)

The admin **Run Scout** action proxies to Brain with JSON `{ "scan_settings": { … } }` (scope, city, categories, filters, depth, discovery mode, etc.).

**Scout never takes website pictures.** It reads the link against the live site and returns **useful text only**: **business info**, **page copy**, **contact info**, **services**, **CTAs**, **SEO basics**, **issues**, **recommendations**, **outreach angles**, and **opportunities** (plus the website link and related notes), for CRM and outreach. Treat the flow as **live website review**, **link analysis**, and **content review** — not visual capture. Do not add screenshot or image-capture fields to this contract or to Scout run payloads.

## When Brain is down

- User-facing: **“Enrichment unavailable right now.”** (save still succeeds on quick-add).

## Related Scout Brain docs

`Massive_Brain/scout-brain/docs/ENRICH_LEAD_API.md`
