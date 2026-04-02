"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { trackPublicEvent } from "@/lib/public-analytics";

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const message = `Project type: ${fd.get("project") || ""}\n\n${fd.get("message") || ""}`;
    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message,
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      trackPublicEvent("public_contact_form_submit");
      router.push("/contact/success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const valuePoints = [
    "Free website preview when it makes sense",
    "Clear pricing and a simple process",
    "Built for real small businesses — not agency overhead",
  ];

  return (
    <section className="contact-page-premium section">
      <div className="contact-page-inner container max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <p className="contact-intro-eyebrow">Get in touch</p>
            <h1
              className="h1"
              style={{ margin: "0 0 12px", lineHeight: 1.12, maxWidth: "20ch" }}
            >
              Let&apos;s build something that works
            </h1>
            <p
              className="subhead"
              style={{
                margin: "0 0 1.5rem",
                maxWidth: "40ch",
                lineHeight: 1.65,
              }}
            >
              Tell me what you&apos;re working on — new site, redesign, or just
              questions before you start. I read every message and reply
              personally.
            </p>

            <ul
              className="contact-value-list"
              style={{ marginBottom: "1.75rem" }}
            >
              {valuePoints.map((line) => (
                <li key={line}>
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "rgba(201, 97, 44, 0.18)",
                      color: "var(--pub-accent)",
                    }}
                    aria-hidden
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div
              className="contact-side-card"
              style={{ marginBottom: "1.5rem" }}
            >
              <p
                className="small"
                style={{
                  margin: "0 0 10px",
                  fontWeight: 650,
                  color: "var(--pub-fg-heading)",
                }}
              >
                Not sure what to say?
              </p>
              <p className="small" style={{ margin: 0, lineHeight: 1.55 }}>
                Pick a prompt below or write one sentence about your business —
                that&apos;s enough to start.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:max-w-md">
              <Link href="/free-mockup" className="contact-prompt-link">
                <span style={{ color: "var(--pub-accent)", fontWeight: 650 }}>
                  →
                </span>
                Want a free homepage preview?
              </Link>
              <Link href="/web-design" className="contact-prompt-link">
                <span style={{ color: "var(--pub-accent)", fontWeight: 650 }}>
                  →
                </span>
                Need a new website for your business?
              </Link>
              <Link href="/pricing" className="contact-prompt-link">
                <span style={{ color: "var(--pub-accent)", fontWeight: 650 }}>
                  →
                </span>
                Have questions before getting started?
              </Link>
            </div>
          </div>

          <div>
            <div className="contact-form-shell">
              <h2
                className="text-xl font-semibold tracking-tight"
                style={{ margin: "0 0 6px", color: "var(--pub-fg-heading)" }}
              >
                Send a message
              </h2>
              <p
                className="small"
                style={{ margin: "0 0 20px", lineHeight: 1.55 }}
              >
                I&apos;ll follow up within one business day.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    className="form-input"
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    className="form-input"
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-phone">
                    Phone (optional)
                  </label>
                  <input
                    className="form-input"
                    id="contact-phone"
                    name="phone"
                    type="text"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-project">
                    What do you need?
                  </label>
                  <select
                    className="form-select"
                    id="contact-project"
                    name="project"
                  >
                    <option>Starter Setup ($400)</option>
                    <option>Business Setup ($900)</option>
                    <option>Custom Builds (custom quote)</option>
                    <option>Free Website Check</option>
                    <option>Hosting & Support ($89/mo)</option>
                    <option>Website Updates</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">
                    Tell me about your project
                  </label>
                  <textarea
                    className="form-textarea"
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                  />
                </div>
                {error && (
                  <p
                    className="small"
                    style={{ color: "#f87171", marginBottom: 12 }}
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn gold"
                  disabled={loading}
                  style={{ width: "100%", padding: "14px 22px", fontSize: 16 }}
                >
                  {loading ? "Sending…" : "Send message"}
                </button>
              </form>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="contact-side-card">
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "1rem",
                    fontWeight: 650,
                    color: "var(--pub-fg-heading)",
                  }}
                >
                  Fastest way
                </h3>
                <p
                  className="small"
                  style={{ margin: "0 0 12px", lineHeight: 1.55 }}
                >
                  Prefer email? I&apos;ll reply within one business day.
                </p>
                <a
                  className="btn gold"
                  style={{ display: "inline-flex", textDecoration: "none" }}
                  href="mailto:Topher@mixedmakershop.com?subject=Website%20Design%20Inquiry"
                >
                  Email Topher ↗
                </a>
                <p className="small" style={{ marginTop: 12, marginBottom: 0 }}>
                  Based in Hot Springs, AR — working with clients nationwide
                  online.
                </p>
              </div>
              <div className="contact-side-card">
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "1rem",
                    fontWeight: 650,
                    color: "var(--pub-fg-heading)",
                  }}
                >
                  Explore
                </h3>
                <p
                  className="small"
                  style={{ margin: "0 0 12px", lineHeight: 1.55 }}
                >
                  See samples, pricing, or start with a free preview.
                </p>
                <div
                  className="btn-row"
                  style={{ marginTop: 0, gap: 8, flexWrap: "wrap" }}
                >
                  <Link href="/free-mockup" className="btn">
                    Free preview
                  </Link>
                  <Link href="/pricing" className="btn">
                    Pricing
                  </Link>
                  <Link href="/web-design" className="btn">
                    Web design
                  </Link>
                </div>
              </div>
            </div>

            <p className="small" style={{ marginTop: 24, lineHeight: 1.55 }}>
              Find MixedMakerShop on Google:{" "}
              <a
                href="https://share.google.com/cJA3CmiybFK1WNE5D"
                target="_blank"
                rel="noopener noreferrer"
              >
                View our listing
              </a>{" "}
              — or{" "}
              <a
                href="https://share.google.com/cJA3CmiybFK1WNE5D"
                target="_blank"
                rel="noopener noreferrer"
              >
                leave a review
              </a>{" "}
              if we&apos;ve worked together.
            </p>

            <div style={{ marginTop: 22 }} className="contact-side-card">
              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: "0.95rem",
                  fontWeight: 650,
                  color: "var(--pub-fg-heading)",
                }}
              >
                What happens next
              </h3>
              <ol
                className="small"
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  lineHeight: 1.6,
                  color: "var(--pub-muted)",
                }}
              >
                <li style={{ marginBottom: 8 }}>
                  I reply personally within one business day
                </li>
                <li style={{ marginBottom: 8 }}>
                  We confirm scope and next steps
                </li>
                <li>
                  If we&apos;re a good fit, I&apos;ll send a deposit request
                  (often Cash App) to start
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
