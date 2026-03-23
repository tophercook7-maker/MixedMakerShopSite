import { permanentRedirect } from "next/navigation";

/** Sample local list removed — use database leads at /admin/leads. */
export default function LocalLeadsRedirectPage() {
  permanentRedirect("/admin/leads");
}
