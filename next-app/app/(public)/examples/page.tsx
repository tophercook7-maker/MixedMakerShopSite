import { redirect } from "next/navigation";

/** Legacy `/examples` URL — consolidated into Builds. */
export default function ExamplesRedirectPage() {
  redirect("/builds");
}
