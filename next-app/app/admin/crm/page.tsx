import { permanentRedirect } from "next/navigation";

/** Local browser CRM removed — all leads live in Supabase. Use /admin/leads (Top Picks pool for hand-picked). */
export default function AdminCrmRedirectPage() {
  permanentRedirect("/admin/leads");
}
