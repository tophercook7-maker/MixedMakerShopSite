"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 8px" }}>Start a project, ask a question, pitch an idea</h1>
          <p className="subhead">
            Web design and digital tools — tell me what you&apos;re working on and I&apos;ll reply personally.
          </p>

          <form onSubmit={handleSubmit} className="card form-card" style={{ maxWidth: 520, marginTop: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Name</label>
              <input className="form-input" id="contact-name" name="name" type="text" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email</label>
              <input className="form-input" id="contact-email" name="email" type="email" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-phone">Phone (optional)</label>
              <input className="form-input" id="contact-phone" name="phone" type="text" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-project">What do you need?</label>
              <select className="form-select" id="contact-project" name="project">
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
              <label className="form-label" htmlFor="contact-message">Tell me about your project</label>
              <textarea className="form-textarea" id="contact-message" name="message" rows={5} required />
            </div>
            {error && <p className="small" style={{ color: "var(--gold)", marginBottom: 12 }}>{error}</p>}
            <button type="submit" className="btn gold" disabled={loading}>
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>

          <div style={{ marginTop: 28, maxWidth: 520 }}>
            <h2 style={{ margin: "0 0 14px" }}>What happens next</h2>
            <ol className="small" style={{ margin: "0 0 0 18px", color: "var(--muted)" }}>
              <li>I reply personally within one business day</li>
              <li>We confirm scope and next steps</li>
              <li>If we&apos;re a good fit I send a deposit request (often Cash App) to start</li>
            </ol>
          </div>

          <div className="grid-2" style={{ marginTop: 28 }}>
            <div className="card">
              <h3>Fastest way</h3>
              <p className="small">Send a message and I&apos;ll reply within 1 business day.</p>
              <div className="btn-row">
                <a className="btn gold" href="mailto:Topher@mixedmakershop.com?subject=Website%20Design%20Inquiry">
                  Email me ↗
                </a>
              </div>
              <p className="small" style={{ marginTop: 10 }}>Based in Hot Springs, AR — working nationwide online.</p>
            </div>
            <div className="card">
              <h3>Browse</h3>
              <p className="small">Want to show a style you like? Link a demo site and I&apos;ll match the direction.</p>
              <div className="btn-row">
                <Link href="/free-mockup" className="btn">
                  Free mockup
                </Link>
                <Link href="/pricing" className="btn">
                  Pricing
                </Link>
                <Link href="/web-design" className="btn">
                  Web Design
                </Link>
              </div>
            </div>
          </div>

          <p className="small" style={{ marginTop: 20 }}>
            Find MixedMakerShop on Google:{" "}
            <a href="https://share.google.com/cJA3CmiybFK1WNE5D" target="_blank" rel="noopener noreferrer">
              View our Google listing
            </a>{" "}
            — or{" "}
            <a href="https://share.google.com/cJA3CmiybFK1WNE5D" target="_blank" rel="noopener noreferrer">
              leave a review
            </a>{" "}
            if you&apos;ve worked with us before.
          </p>
        </div>
      </div>
    </section>
  );
}
