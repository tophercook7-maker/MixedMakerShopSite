import Link from "next/link";
import { LEAD_CONFIRMATION_MESSAGE } from "@/lib/lead-confirmation-message";

export default function FreeWebsiteCheckSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <h1 className="text-2xl font-bold">Request received</h1>
      <p className="mt-2 text-muted-foreground">{LEAD_CONFIRMATION_MESSAGE}</p>
      <Link href="/" className="mt-6 inline-block text-sm text-primary hover:underline">Back to home</Link>
    </div>
  );
}
