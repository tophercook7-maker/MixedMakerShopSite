"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HomeMockupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Build message from form fields for API
    const message = [
      `Business: ${fd.get("business") || ""}`,
      `Industry: ${fd.get("industry") || ""}`,
      `What business does: ${fd.get("what_business_does") || ""}`,
      `Ideal customers: ${fd.get("ideal_customers") || ""}`,
      `Main goal: ${fd.get("main_goal") || ""}`,
      `Must include: ${fd.get("must_include") || ""}`,
      `Anything else: ${fd.get("anything_else") || ""}`,
    ].join("\n");

    try {
      const res = await fetch("/api/forms/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          business_name: fd.get("business"),
          email: fd.get("email"),
          phone: fd.get("phone") || undefined,
          website: fd.get("website") || undefined,
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ? JSON.stringify(data.error) : "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/connect/success");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="mockup-section-layout">
        <div className="mockup-support-col">
          <div className="what-happens-next card">
            <h3 className="what-happens-title">What happens next</h3>
            <ol className="what-happens-list">
              <li>You send your request</li>
              <li>I review your business and goals</li>
              <li>I design a homepage concept</li>
              <li>I send the mockup for feedback</li>
            </ol>
          </div>
        </div>
        <div className="mockup-form-col">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="mockup-name">
                Full Name <span className="req">*</span>
              </label>
              <input className="form-input" id="mockup-name" name="name" type="text" required placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mockup-business">
                Business Name <span className="req">*</span>
              </label>
              <input
                className="form-input"
                id="mockup-business"
                name="business"
                type="text"
                required
                placeholder="Your business name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mockup-email">
                Email Address <span className="req">*</span>
              </label>
              <input
                className="form-input"
                id="mockup-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mockup-phone">
                Phone Number
              </label>
              <input
                className="form-input"
                id="mockup-phone"
                name="phone"
                type="tel"
                placeholder="e.g. (501) 555-0123"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mockup-industry">
                Business Type / Industry <span className="req">*</span>
              </label>
              <input
                className="form-input"
                id="mockup-industry"
                name="industry"
                type="text"
                required
                placeholder="e.g. Restaurant, Contractor, Church"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mockup-website">
                Current Website URL
              </label>
              <input
                className="form-input"
                id="mockup-website"
                name="website"
                type="url"
                placeholder="https://example.com"
              />
            </div>
            <div className="form-group full">
              <label className="form-label" htmlFor="mockup-do">
                What does your business do? <span className="req">*</span>
              </label>
              <textarea
                className="form-textarea"
                id="mockup-do"
                name="what_business_does"
                required
                placeholder="Describe your business, services, or products..."
              />
            </div>
            <div className="form-group full">
              <label className="form-label" htmlFor="mockup-customers">
                Who are your ideal customers? <span className="req">*</span>
              </label>
              <textarea
                className="form-textarea"
                id="mockup-customers"
                name="ideal_customers"
                required
                placeholder="Describe who you're trying to reach..."
              />
            </div>
            <div className="form-group full">
              <label className="form-label" htmlFor="mockup-goal">
                Main website goal <span className="req">*</span>
              </label>
              <input
                className="form-input"
                id="mockup-goal"
                name="main_goal"
                type="text"
                required
                placeholder="e.g. Get more calls, build trust"
              />
            </div>
            <div className="form-group full">
              <label className="form-label" htmlFor="mockup-must-include">
                Must-have homepage elements <span className="req">*</span>
              </label>
              <textarea
                className="form-textarea large"
                id="mockup-must-include"
                name="must_include"
                required
                placeholder="Key elements, sections, or messages that need to be on the homepage..."
              />
            </div>
            <div className="form-group full">
              <label className="form-label" htmlFor="mockup-anything-else">
                Anything else I should know? <span className="req">*</span>
              </label>
              <textarea
                className="form-textarea large"
                id="mockup-anything-else"
                name="anything_else"
                required
                placeholder="Additional details, preferences, or ideas..."
              />
            </div>
          </div>
          {error && <p className="small" style={{ color: "var(--gold)", marginTop: 12 }}>{error}</p>}
          <button type="submit" className="btn gold" style={{ marginTop: 24 }} disabled={loading}>
            {loading ? "Sending…" : "Get My Free Website Preview"}
          </button>
          <p className="small" style={{ marginTop: 14 }}>More detail = a mockup that better fits your vision.</p>
        </div>
      </div>
    </form>
  );
}
