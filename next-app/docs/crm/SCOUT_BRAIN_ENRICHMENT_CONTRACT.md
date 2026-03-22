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
  "source_type": "extension | facebook | google | manual | unknown | mixed"
}
```

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
    "best_contact_method": "...",
    "best_next_move": "...",
    "pitch_angle": "...",
    "source_confidence": 0,
    "match_confidence": 0,
    "raw_signals": {},
    "place_id": "..."
  }
}
```

`normalized_facebook_url` is computed in next-app when applying `facebook_url`.

## Fields patched on `public.leads`

Mapping: `lib/crm/map-brain-enrichment-to-lead-patch.ts` → `pickLeadPatchFields` in `apply-scout-brain-enrichment.ts`.

- `email`, `email_source` (Brain `phone` → `phone`, `email` → `email` — not `primary_contact_*`)
- `website`, `normalized_website`, `has_website` (no Facebook over a real site)
- `facebook_url`, `normalized_facebook_url`
- `contact_page`, `city`, `state`, `category`
- `why_this_lead_is_here` (only if empty or generic capture text)
- `conversion_score`, `opportunity_score` from Brain `score` (**raise only**)
- `lead_tags` (**union**)
- `recommended_next_action` from `best_next_move` + `pitch_angle` when that field is empty (Brain best_contact / pitch are not stored as separate columns in this pass)
- `place_id` (if empty)

## Orchestration

- `fetchScoutBrainEnrichLead()` in `lib/crm/scout-brain-enrichment.ts` performs the HTTP call (structured `{ ok, error }`, no throw).
- `runCrmLeadEnrichmentAfterSave()` in `lib/crm/run-crm-lead-enrichment.ts` logs `lead_enrichment_requested` / `lead_enrichment_completed` / `lead_enrichment_no_change` / `lead_enrichment_failed` with `source: scout_brain` or `local_html`.

## Triggers

1. **`POST /api/crm/quick-add`** — response `message` is the exact string for UI (bookmarklet + quick-add page use `data.message`).
2. **`POST /api/crm/leads/[id]/enrich`** — manual **Enrich now**.

## When Brain is down

- User-facing: **“Enrichment unavailable right now.”** (save still succeeds on quick-add).

## Related Scout Brain docs

`Massive_Brain/scout-brain/docs/ENRICH_LEAD_API.md`
