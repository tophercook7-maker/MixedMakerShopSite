"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WebsiteRoastForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    let website = String(fd.get("website_url") || "").trim();
    if (website && !website.startsWith("http")) website = "https://" + website;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "public_lead",
          source: "website_check",
          business_name: website ? `Website roast - ${website}` : undefined,
          email: fd.get("email"),
          website: website || undefined,
          message: website ? `Website URL: ${website}` : "Website roast requested.",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ? String(data.error) : "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/free-website-check/success");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="roast-website">
            Website URL <span className="req">*</span>
          </label>
          <input
            className="form-input"
            id="roast-website"
            name="website_url"
            type="text"
            required
            placeholder="yourwebsite.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="roast-email">
            Email <span className="req">*</span>
          </label>
          <input
            className="form-input"
            id="roast-email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>
      </div>
      {error && (
        <p className="small" style={{ color: "var(--gold)", marginBottom: 12 }}>
          {error}
        </p>
      )}
      <button type="submit" className="btn gold" disabled={loading}>
        {loading ? "Sending…" : "Get My Free Roast"}
      </button>
    </form>
  );
}
