# CRM lead lanes (deterministic)

Buckets and next steps are computed **only** from fields already on the lead (email, phone, website, Facebook, contact page, scores, `why_this_lead_is_here`). **No live Google/Places** is required.

## Single source in the app

- **TypeScript:** `lib/crm/lead-lane.ts` — used for list cards, `/admin/leads?lane=`, and lead detail summaries.
- **Scout Brain:** `scout/lead_bucket_classifier.py` — same rules; merged into `POST /api/enrich-lead` and exposed as `POST /api/classify-lead` for tooling.

## `lead_bucket` values

| Value | Meaning (primary lane, one per lead) |
|-------|--------------------------------------|
| `ready_to_contact` | Score ≥ 58 and at least one contact path |
| `has_email` | Has email (and not in `ready_to_contact` first) |
| `has_phone` | Has phone, no email |
| `facebook_only` | Facebook URL, no standalone website |
| `no_website` | No standalone website |
| `needs_research` | No email, phone, contact page, or Facebook |
| `low_priority` | Fallback (e.g. low score with weak path) |

Priority order when assigning the primary lane: **ready_to_contact → has_email → has_phone → facebook_only → no_website → needs_research → low_priority**.

## `contact_readiness`

- `ready` — email or phone
- `partial` — contact page or Facebook only (no email/phone)
- `missing` — none of the above

## `simplified_next_step`

`contact now` · `message on facebook` · `call now` · `research later` · `skip for now`

## Schema

No new DB columns in this pass. Optional Brain fields on enrich responses: `lead_bucket`, `contact_readiness`, `simplified_next_step`, `lane_summary_line`, `honest_headline`. CRM may store `recommended_next_action` when Brain suggests a short next step.

## URL

- `/admin/leads?lane=ready_to_contact` (underscores; hyphens normalized client-side)
