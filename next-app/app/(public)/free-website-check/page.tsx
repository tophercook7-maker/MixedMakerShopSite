"use client";

import { useState } from "react";
import { FormLegalConsent } from "@/components/public/LegalConsent";
import type { AuditReport, Finding } from "@/lib/audit/site-audit";

/**
 * Two steps, deliberately.
 *
 * Step one runs the real audit from a URL alone — no email, no form. That is
 * what makes it worth linking to and worth sharing, and it is the half that
 * used to not exist at all: the page collected a lead and left Topher to do
 * the audit by hand.
 *
 * Step two trades the fixes for an email address. By then the visitor has seen
 * a real score and real problems on their own site, so the ask is cheap — and
 * the lead arrives with the whole report already attached to it.
 */

const FREE_FINDINGS = 3;

const SEV_COLOR: Record<Finding["severity"], string> = {
  high: "#e5484d",
  medium: "#f5a524",
  low: "#8b949e",
};

function scoreVerdict(score: number) {
  if (score >= 90) return { label: "Healthy", color: "#3fb950" };
  if (score >= 70) return { label: "Needs work", color: "#f5a524" };
  return { label: "Losing you customers", color: "#e5484d" };
}

export default function FreeWebsiteCheckPage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const [unlocked, setUnlocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function runCheck(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setReport(null);
    setUnlocked(false);
    if (!url.trim()) return setError("Put your website address in first.");
    setScanning(true);
    try {
      const res = await fetch("/api/site-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "That check didn't run. Try again in a moment.");
      } else {
        setReport(data as AuditReport);
      }
    } catch {
      setError("That check didn't run. Try again in a moment.");
    } finally {
      setScanning(false);
    }
  }

  async function unlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSendError("");
    setSending(true);
    const fd = new FormData(e.currentTarget);
    // The whole report travels with the lead, so the first reply can be about
    // the site rather than a request for more information.
    const summary = report
      ? [
          `Automated check of ${report.finalUrl}`,
          `Score ${report.score}/100 · ${report.findings.length} issues · ${report.passed.length} passing`,
          "",
          ...report.findings.map(
            (f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}${f.observed ? ` — ${f.observed}` : ""}`,
          ),
        ].join("\n")
      : "Website check requested.";
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
          website: report?.finalUrl ?? url,
          message: summary,
          request: summary,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSendError(d.error?.email?.[0] ?? "That didn't send. Try again.");
      } else {
        setUnlocked(true);
      }
    } catch {
      setSendError("That didn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  const shown = report ? (unlocked ? report.findings : report.findings.slice(0, FREE_FINDINGS)) : [];
  const hidden = report ? report.findings.length - shown.length : 0;
  const verdict = report ? scoreVerdict(report.score) : null;

  return (
    <section className="section">
      <div className="container">
        {/* ── step 1: the check ─────────────────────────────────────── */}
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Free Website Check</h1>
          <p className="subhead" style={{ margin: "0 0 20px" }}>
            Type your address and get a real report in about twenty seconds. No email needed to see your
            score — I check the things that actually decide whether Google and AI assistants can find you.
          </p>

          <form onSubmit={runCheck} style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 620 }}>
            <input
              className="input"
              style={{ flex: "1 1 280px" }}
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourbusiness.com"
              aria-label="Your website address"
              autoComplete="url"
            />
            <button className="btn gold btn-cta-primary" type="submit" disabled={scanning}>
              {scanning ? "Checking…" : "Check my site"}
            </button>
          </form>
          {error ? (
            <p className="small" style={{ color: "#e5484d", marginTop: 12 }}>
              {error}
            </p>
          ) : null}
          {scanning ? (
            <p className="small" style={{ color: "var(--muted)", marginTop: 12 }}>
              Reading your homepage, robots.txt and sitemap…
            </p>
          ) : null}
        </div>

        {/* ── the report ────────────────────────────────────────────── */}
        {report && verdict ? (
          <>
            <div className="panel" style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 52, fontWeight: 800, color: verdict.color, lineHeight: 1 }}>
                  {report.score}
                </span>
                <span className="small" style={{ color: "var(--muted)" }}>out of 100</span>
                <span style={{ fontWeight: 700, color: verdict.color }}>{verdict.label}</span>
              </div>
              <p className="small" style={{ margin: "12px 0 0", color: "var(--muted)" }}>
                {report.finalUrl} · {report.findings.length} issue
                {report.findings.length === 1 ? "" : "s"} found · {report.passed.length} checks passing ·
                responded in {((report.responseMs ?? 0) / 1000).toFixed(1)}s
              </p>
            </div>

            <div className="panel" style={{ marginTop: 18 }}>
              <h2 className="section-heading" style={{ margin: "0 0 16px" }}>
                What I found
              </h2>
              {report.findings.length === 0 ? (
                <p className="small" style={{ color: "var(--muted)" }}>
                  Nothing broken. Your site passes every check here — which is rarer than you&apos;d think.
                </p>
              ) : (
                shown.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      borderLeft: `3px solid ${SEV_COLOR[f.severity]}`,
                      padding: "2px 0 2px 14px",
                      marginBottom: 18,
                    }}
                  >
                    <div className="small" style={{ color: SEV_COLOR[f.severity], fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                      {f.severity}
                    </div>
                    <h3 style={{ margin: "4px 0 6px" }}>{f.title}</h3>
                    <p className="small" style={{ margin: "0 0 6px", color: "var(--muted)", lineHeight: 1.6 }}>
                      {f.detail}
                    </p>
                    {f.observed ? (
                      <p className="small" style={{ margin: "0 0 6px", color: "var(--muted2)" }}>
                        On your site: {f.observed}
                      </p>
                    ) : null}
                    {unlocked ? (
                      <p className="small" style={{ margin: 0, color: "var(--fg)" }}>
                        <strong>Fix:</strong> {f.fix}
                      </p>
                    ) : null}
                  </div>
                ))
              )}

              {/* ── step 2: trade the fixes for an email ───────────── */}
              {!unlocked && report.findings.length > 0 ? (
                <div style={{ borderTop: "1px solid var(--line, #333)", paddingTop: 20, marginTop: 8 }}>
                  <h3 style={{ margin: "0 0 8px" }}>
                    {hidden > 0
                      ? `${hidden} more issue${hidden === 1 ? "" : "s"} — and how to fix every one`
                      : "How to fix each of these"}
                  </h3>
                  <p className="small" style={{ margin: "0 0 16px", color: "var(--muted)", lineHeight: 1.6 }}>
                    Leave an email and the rest opens up right here, with the fix written out for each
                    item. I&apos;ll also get a copy so I can tell you which one actually matters most for
                    your business — no charge for that either.
                  </p>
                  <form onSubmit={unlock} className="form-card" style={{ maxWidth: 520 }}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="fc-name">Name</label>
                        <input id="fc-name" name="name" className="input" autoComplete="name" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="fc-email">Email *</label>
                        <input id="fc-email" name="email" type="email" className="input" required autoComplete="email" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="fc-business">Business name</label>
                        <input id="fc-business" name="business_name" className="input" autoComplete="organization" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="fc-phone">Phone</label>
                        <input id="fc-phone" name="phone" type="tel" className="input" autoComplete="tel" />
                      </div>
                    </div>
                    <button className="btn gold btn-cta-primary" type="submit" disabled={sending} style={{ marginTop: 14 }}>
                      {sending ? "Opening…" : "Show me the fixes"}
                    </button>
                    {sendError ? (
                      <p className="small" style={{ color: "#e5484d", marginTop: 10 }}>
                        {sendError}
                      </p>
                    ) : null}
                    <FormLegalConsent />
                  </form>
                </div>
              ) : null}

              {unlocked ? (
                <div style={{ borderTop: "1px solid var(--line, #333)", paddingTop: 18, marginTop: 8 }}>
                  <p className="small" style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                    That&apos;s everything. I have a copy too — if you&apos;d rather I just did these,
                    reply to the email and I&apos;ll quote it. Most of them are an hour&apos;s work.
                  </p>
                </div>
              ) : null}
            </div>

            {report.passed.length > 0 ? (
              <div className="panel" style={{ marginTop: 18 }}>
                <h2 className="section-heading" style={{ margin: "0 0 12px" }}>
                  What you&apos;re already doing right
                </h2>
                <ul className="small" style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, color: "var(--muted)" }}>
                  {report.passed.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
