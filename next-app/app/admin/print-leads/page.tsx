import { redirect } from "next/navigation";

/** 3D print leads live in the main CRM; this URL deep-links the 3D lane. */
export default function AdminPrintLeadsRedirectPage() {
  redirect("/admin/crm/print");
}
