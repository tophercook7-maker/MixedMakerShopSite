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
    const fd = new FormData(form);
    let website = String(fd.get("website") || "").trim();
    if (website && !website.startsWith("http")) website = "https://" + website;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "public_lead",
          source: "website_check",
          name: fd.get("name") || undefined,
          business_name: fd.get("business_name") || undefined,
          email: fd.get("email"),
          phone: fd.get("phone") || undefined,
          website: website || undefined,
          message: fd.get("message") || (website ? `Website URL: ${website}` : "Website check requested."),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.email?.[0] ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push("/free-website-check/success");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Free Website Check</h1>
          <p className="subhead" style={{ margin: "0 0 24px" }}>
            Share your site and I&apos;ll send a short list of improvements. I review personally — typically within 24
            hours.
          </p>
          <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: 520 }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="wcheck-name">Name</label>
                <input className="form-input" id="wcheck-name" name="name" type="text" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="wcheck-business">Business name</label>
                <input className="form-input" id="wcheck-business" name="business_name" type="text" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="wcheck-email">
                  Email <span className="req">*</span>
                </label>
                <input className="form-input" id="wcheck-email" name="email" type="email" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="wcheck-phone">Phone</label>
                <input className="form-input" id="wcheck-phone" name="phone" type="tel" />
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="wcheck-website">Website URL</label>
                <input
                  className="form-input"
                  id="wcheck-website"
                  name="website"
                  type="text"
                  placeholder="yourwebsite.com"
                />
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="wcheck-message">Message (optional)</label>
                <textarea className="form-textarea" id="wcheck-message" name="message" rows={3} />
              </div>
            </div>
            {error && (
              <p className="small" style={{ color: "var(--gold)", marginBottom: 12 }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn gold" disabled={loading}>
              {loading ? "Submitting…" : "Get My Free Website Check"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
