"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HomeProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const message = [
      `Project type: ${fd.get("project_type") || ""}`,
      `What need: ${fd.get("what_need") || ""}`,
      `Goals: ${fd.get("goals") || ""}`,
      `Features: ${fd.get("features") || ""}`,
      `Timeline: ${fd.get("timeline") || ""}`,
      `Budget: ${fd.get("budget") || ""}`,
      `Inspiration: ${fd.get("inspiration") || ""}`,
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
      router.push("/contact/success");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="project-name">
            Full Name <span className="req">*</span>
          </label>
          <input className="form-input" id="project-name" name="name" type="text" required placeholder="Your name" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="project-business">
            Business Name <span className="req">*</span>
          </label>
          <input
            className="form-input"
            id="project-business"
            name="business"
            type="text"
            required
            placeholder="Your business name"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="project-email">
            Email Address <span className="req">*</span>
          </label>
          <input
            className="form-input"
            id="project-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="project-phone">
            Phone Number
          </label>
          <input
            className="form-input"
            id="project-phone"
            name="phone"
            type="tel"
            placeholder="e.g. (501) 555-0123"
          />
        </div>
        <div className="form-group full">
          <label className="form-label" htmlFor="project-website">
            Current Website URL
          </label>
          <input
            className="form-input"
            id="project-website"
            name="website"
            type="url"
            placeholder="https://example.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="project-type">
            Project Type <span className="req">*</span>
          </label>
          <select className="form-select" id="project-type" name="project_type" required>
            <option value="">Select...</option>
            <option value="New website">New website</option>
            <option value="Redesign">Redesign</option>
            <option value="Landing page">Landing page</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Ongoing site help">Ongoing site help</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group full">
          <label className="form-label" htmlFor="project-need">
            What do you need built? <span className="req">*</span>
          </label>
          <textarea
            className="form-textarea"
            id="project-need"
            name="what_need"
            required
            placeholder="Describe your project..."
          />
        </div>
        <div className="form-group full">
          <label className="form-label" htmlFor="project-goals">
            Main business goals <span className="req">*</span>
          </label>
          <textarea
            className="form-textarea"
            id="project-goals"
            name="goals"
            required
            placeholder="What do you want the site to achieve?"
          />
        </div>
        <div className="form-group full">
          <label className="form-label" htmlFor="project-features">
            Desired features/functionality <span className="req">*</span>
          </label>
          <textarea
            className="form-textarea"
            id="project-features"
            name="features"
            required
            placeholder="Contact form, booking, gallery, etc."
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="project-timeline">
            Timeline
          </label>
          <input className="form-input" id="project-timeline" name="timeline" type="text" placeholder="e.g. 2-3 weeks" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="project-budget">
            Budget Range
          </label>
          <select className="form-select" id="project-budget" name="budget">
            <option value="">Select...</option>
            <option value="Under $500">Under $500</option>
            <option value="$500–$1,500">$500–$1,500</option>
            <option value="$1,500–$3,000">$1,500–$3,000</option>
            <option value="$3,000+">$3,000+</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>
        <div className="form-group full">
          <label className="form-label" htmlFor="project-inspiration">
            Reference Websites / Inspiration
          </label>
          <textarea
            className="form-textarea"
            id="project-inspiration"
            name="inspiration"
            placeholder="Sites you like and why..."
          />
        </div>
        <div className="form-group full">
          <label className="form-label" htmlFor="project-else">
            Anything else I should know?
          </label>
          <textarea className="form-textarea" id="project-else" name="anything_else" placeholder="Additional details..." />
        </div>
      </div>
      {error && <p className="small" style={{ color: "var(--gold)", marginTop: 12 }}>{error}</p>}
      <button type="submit" className="btn gold" style={{ marginTop: 24 }} disabled={loading}>
        {loading ? "Sending…" : "Start a Full Project"}
      </button>
    </form>
  );
}
