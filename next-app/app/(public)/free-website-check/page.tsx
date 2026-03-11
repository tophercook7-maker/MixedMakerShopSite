"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FreeWebsiteCheckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form));
    const body = {
      name: fd.name || undefined,
      business_name: fd.business_name || undefined,
      email: fd.email,
      phone: fd.phone || undefined,
      website: fd.website || undefined,
      message: fd.message || undefined,
    };
    try {
      const res = await fetch("/api/forms/website-check", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.email?.[0] ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/free-website-check/success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-bold">Free Website Check</h1>
      <p className="mt-2 text-muted-foreground">
        Share your site and we’ll send a short list of improvements.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" name="name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium mb-1">Business name</label>
          <input id="business_name" name="business_name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email <span className="text-destructive">*</span></label>
          <input id="email" name="email" type="email" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
          <input id="phone" name="phone" type="tel" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1">Website URL</label>
          <input id="website" name="website" type="url" placeholder="https://" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
          <textarea id="message" name="message" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Submitting…" : "Submit"}
        </button>
      </form>
    </div>
  );
}
