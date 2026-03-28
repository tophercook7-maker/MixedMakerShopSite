import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ServiceRoleConfigError = {
  ok: false;
  missing: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY";
};

export type ServiceRoleConfigOk = { ok: true; supabase: SupabaseClient };

/**
 * Service-role Supabase client for server routes that must bypass RLS (public forms, cron, etc.).
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the runtime environment.
 */
export function getServiceRoleSupabase(): ServiceRoleConfigOk | ServiceRoleConfigError {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url) {
    return { ok: false, missing: "NEXT_PUBLIC_SUPABASE_URL" };
  }
  if (!key) {
    return { ok: false, missing: "SUPABASE_SERVICE_ROLE_KEY" };
  }

  return { ok: true, supabase: createClient(url, key) };
}
