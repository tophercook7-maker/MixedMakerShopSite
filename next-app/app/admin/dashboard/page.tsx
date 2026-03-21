import { redirect } from "next/navigation";

/** Legacy route — command center moved to `/admin/today`. */
export default function DashboardRedirectPage() {
  redirect("/admin/today");
}
