import { redirect } from "next/navigation";

/** Legacy URL — canonical policy lives at /privacy */
export default function PrivacyPolicyRedirectPage() {
  redirect("/privacy");
}
