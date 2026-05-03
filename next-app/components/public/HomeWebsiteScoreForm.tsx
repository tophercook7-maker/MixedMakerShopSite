"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HomeWebsiteScoreForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const website = String(fd.get("website_url") || "").trim();
    let websiteUrl = website;
    if (websiteUrl && !websiteUrl.startsWith("http")) {
      websiteUrl = "https://" + websiteUrl;
    }
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "public_lead",
          source: "website_check",
          business_name: websiteUrl ? `Website check - ${websiteUrl}` : undefined,
          email: fd.get("email"),
          website: websiteUrl || undefined,
          message: websiteUrl ? `Website URL: ${websiteUrl}` : "Website check requested.",
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
    <form onSubmit={handleSubmit} className="website-score-form">
      <div className="website-score-fields">
        <div className="form-group">
          <label className="form-label" htmlFor="website-score-url">
            Website URL <span className="req">*</span>
          </label>
          <input
            className="form-input website-score-input"
            id="website-score-url"
            name="website_url"
            type="text"
            required
            placeholder="yourwebsite.com"
            inputMode="url"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="website-score-email">
            Email <span className="req">*</span>
          </label>
          <input
            className="form-input website-score-input"
            id="website-score-email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>
      </div>
      {error && <p className="small" style={{ color: "var(--gold)", marginBottom: 12 }}>{error}</p>}
      <button type="submit" className="btn gold website-score-btn" disabled={loading}>
        {loading ? "Sending…" : "Check My Website"}
      </button>
      <p className="website-score-helper">Results are reviewed personally and typically returned within 24 hours.</p>
    </form>
  );
}
