"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { PublicCtaRow } from "@/components/public/PublicCtaRow";
import { publicFreeMockupFunnelHref, publicGoogleMapsSearchHref } from "@/lib/public-brand";
import { trackPublicEvent } from "@/lib/public-analytics";

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needFromQuery, setNeedFromQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = new URLSearchParams(window.location.search).get("need");
    if (!raw) return;
    try {
      setNeedFromQuery(decodeURIComponent(raw.replace(/\+/g, " ")));
    } catch {
      setNeedFromQuery(raw);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const business = String(fd.get("business_name") || "").trim();
    const need = String(fd.get("need") || "").trim();
    const website = String(fd.get("website") || "").trim();
    const extra = String(fd.get("extra") || "").trim();
    const parts = [
      `Business: ${business}`,
      website ? `Website: ${website}` : "Website: (not provided)",
      "",
      "What do you need?",
      need,
    ];
    if (extra) {
      parts.push("", "Anything else:", extra);
    }
    const message = parts.join("\n");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "public_lead",
          source: "contact_form",
          name: fd.get("name"),
          business_name: business,
          email: fd.get("email"),
          website: website || undefined,
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
    "Free preview when it makes sense",
    "Clear pricing and a simple process",
    "Built for real small businesses — not agency overhead",
  ];

  return (
    <section className="contact-page-premium section">
      <div className="contact-page-inner container max-w-6xl">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          <div className="space-y-7 lg:pr-2">
            <p className="contact-intro-eyebrow">Contact</p>
            <h1
              className="h1"
              style={{ margin: "0 0 12px", lineHeight: 1.12, maxWidth: "24ch" }}
            >
              Talk directly with Topher
            </h1>
            <p
              className="subhead"
              style={{
                margin: 0,
                maxWidth: "46ch",
                lineHeight: 1.65,
              }}
            >
              MixedMakerShop is one studio — web design first, plus 3D printing and digital builds when that&apos;s what you
              need. Send a short message and we&apos;ll pick the simplest next step.
            </p>
            <p className="small" style={{ margin: 0, maxWidth: "48ch", lineHeight: 1.6 }}>
              No call center, no account manager — just a straight answer within one business day.
            </p>
            <p
              className="small"
              style={{
                margin: 0,
                maxWidth: "48ch",
                lineHeight: 1.55,
                fontWeight: 650,
                color: "var(--pub-fg-heading)",
              }}
            >
              Simple, direct, and no pressure.
            </p>

            <ul className="contact-value-list" style={{ margin: 0 }}>
              {valuePoints.map((line) => (
                <li key={line}>
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "rgba(184, 92, 30, 0.14)",
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
              style={{ marginBottom: 0 }}
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

            <div className="flex flex-col gap-2 sm:max-w-md" style={{ marginTop: "0.25rem" }}>
              <Link href={publicFreeMockupFunnelHref} className="contact-prompt-link">
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
                View pricing &amp; packages
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
                style={{ margin: "0 0 12px", lineHeight: 1.55 }}
              >
                I&apos;ll follow up within one business day.
              </p>
              <p
                className="small"
                style={{ margin: "0 0 20px", lineHeight: 1.55 }}
              >
                You can also request a free mockup if you&apos;re not ready to commit yet.
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
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-business">
                    Business name
                  </label>
                  <input
                    className="form-input"
                    id="contact-business"
                    name="business_name"
                    type="text"
                    autoComplete="organization"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-need">
                    What do you need?
                  </label>
                  <textarea
                    className="form-textarea"
                    id="contact-need"
                    name="need"
                    rows={4}
                    placeholder="A sentence or two is fine."
                    required
                    key={needFromQuery ? `need-${needFromQuery.slice(0, 48)}` : "need-default"}
                    defaultValue={needFromQuery}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-website">
                    Website <span className="font-normal opacity-75">(optional)</span>
                  </label>
                  <input
                    className="form-input"
                    id="contact-website"
                    name="website"
                    type="text"
                    inputMode="url"
                    placeholder="yoursite.com or leave blank"
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
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-extra">
                    Anything else you want me to know?{" "}
                    <span className="font-normal opacity-75">(optional)</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    id="contact-extra"
                    name="extra"
                    rows={3}
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
                <p
                  className="small text-center"
                  style={{ marginTop: 14, marginBottom: 0, lineHeight: 1.5, color: "var(--pub-muted)" }}
                >
                  No pressure · No obligation · Just a preview if you want one
                </p>
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
                  See examples, pricing, or start with a free preview.
                </p>
                <PublicCtaRow className="mt-1">
                  <Link href={publicFreeMockupFunnelHref} className="btn">
                    Free Preview
                  </Link>
                  <Link href="/examples" className="btn">
                    Examples
                  </Link>
                  <Link href="/web-design" className="btn">
                    Web Design
                  </Link>
                </PublicCtaRow>
              </div>
            </div>

            <p className="small" style={{ marginTop: 24, lineHeight: 1.55 }}>
              Prefer maps?{" "}
              <a href={publicGoogleMapsSearchHref} target="_blank" rel="noopener noreferrer">
                Open MixedMakerShop in Google Maps
              </a>
              . For reviews, use the review link on the Maps listing when it appears.
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
