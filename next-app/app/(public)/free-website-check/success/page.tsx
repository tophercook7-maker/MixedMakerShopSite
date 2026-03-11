import Link from "next/link";

export default function FreeWebsiteCheckSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <h1 className="text-2xl font-bold">Request received</h1>
      <p className="mt-2 text-muted-foreground">We’ll review your site and email you with feedback soon.</p>
      <Link href="/" className="mt-6 inline-block text-sm text-primary hover:underline">Back to home</Link>
    </div>
  );
}
