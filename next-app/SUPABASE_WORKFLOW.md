# Supabase Migration Workflow

Use `MixedMakerShopSite/next-app` as the migration source of truth for project `zwdsnwvuhaesbllzbfmt`.

## Daily command flow

1. `cd /Users/christophercook/Desktop/Projects/MixedMakerShopSite/next-app`
2. `supabase link --project-ref zwdsnwvuhaesbllzbfmt` (only needed first time or after environment reset)
3. `supabase db push --yes`

## When to run

- Run after adding a new SQL migration file in `supabase/migrations`.
- Run before/after deploys when schema changes are included.

## Important

- Do not run `supabase db push` from `Massive_Brain/scout-brain` (that folder uses a non-matching migration history format).
