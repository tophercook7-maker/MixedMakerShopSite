-- ============================================================================
-- Brand / logo canonical asset: m3-brand.png (no schema change)
-- ============================================================================
-- Canonical files in repo:
--   - next-app/public/m3-brand.png     → served at https://<app>/m3-brand.png
--   - assets/m3-brand.png              → static HTML site at https://<site>/assets/m3-brand.png
--
-- Replaced references:
--   - massive-brain-m3.png (nav, favicon, OG)
--   - JSON-LD logo URL previously assets/logo.png → assets/m3-brand.png
--   - Legacy routes /m3-icon.png, /m3-192.png, /m3-512.png, /m3-logo.png → redirect to /m3-brand.png
--
-- Apply: run `supabase db push` or your normal migration flow. This migration is a no-op in the
-- database and documents deploy expectations only.
-- ============================================================================

select 1;
