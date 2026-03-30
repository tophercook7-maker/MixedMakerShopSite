"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { buildFunnelPreviewFromSnapshot, type FunnelFormSnapshot } from "@/lib/crm-mockup";
import { SITE_GOAL_OPTIONS } from "@/lib/lead-samples";
import { trackPublicEvent } from "@/lib/public-analytics";

/** Satisfies API + preview builder when visitors skip location/category pickers. */
const DEFAULT_CATEGORY = "Small Business";
const DEFAULT_CITY = "Not specified";

export function FreeMockupFunnelClient() {
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [hasWebsite, setHasWebsite] = useState<"yes" | "no">("no");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [submitEmail, setSubmitEmail] = useState("");
  const [submitPhone, setSubmitPhone] = useState("");

  const [phase, setPhase] = useState<"form" | "success">("form");
  const [savedUrl, setSavedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapshot: FunnelFormSnapshot = useMemo(
    () => ({
      business_name: businessName,
      category: DEFAULT_CATEGORY,
      city: DEFAULT_CITY,
      state: "",
      phone: submitPhone.trim(),
      email: submitEmail.trim(),
      website_url: hasWebsite === "yes" ? websiteUrl.trim() : "",
      facebook_url: "",
      services_text: servicesText,
      template_mode: "auto",
      headline_override: "",
      subheadline_override: "",
      cta_override: "",
      style_preset: "",
      color_preset: "",
      hero_preset: "",
    }),
    [businessName, hasWebsite, servicesText, submitEmail, submitPhone, websiteUrl]
  );

  const canPreview = Boolean(businessName.trim() && servicesText.trim());

  const preview = useMemo(() => {
    if (!canPreview) return null;
    try {
      return buildFunnelPreviewFromSnapshot(snapshot);
    } catch {
      return null;
    }
  }, [snapshot, canPreview]);

  async function submit() {
    setError(null);
    const cn = contactName.trim();
    const em = submitEmail.trim();
    const bn = businessName.trim();
    const svc = servicesText.trim();
    if (!cn) {
      setError("Please enter your name.");
      return;
    }
    if (!bn) {
      setError("Please enter your business name.");
      return;
    }
    if (!svc) {
      setError("Tell us briefly what your business does.");
      return;
    }
    if (!em) {
      setError("Please add your email so I can send your mockup.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Please enter a valid email.");
      return;
    }
    if (hasWebsite === "yes" && !websiteUrl.trim()) {
      setError("Add your website URL, or choose “No” if you don’t have one yet.");
      return;
    }

    const notesParts: string[] = [];
    if (mainGoal.trim()) notesParts.push(`Main goal: ${mainGoal.trim()}`);
    const notesTrim = notesParts.join("\n");

    setLoading(true);
    try {
      const mockupData = {
        funnelVersion: 1,
        contactName: cn,
        submitPhone: submitPhone.trim(),
        snapshot: {
          business_name: bn,
          category: DEFAULT_CATEGORY,
          city: DEFAULT_CITY,
          state: "",
          phone: submitPhone.trim(),
          email: em,
          website_url: hasWebsite === "yes" ? websiteUrl.trim() : "",
          facebook_url: "",
          services_text: svc,
          template_mode: "auto",
          headline_override: "",
          subheadline_override: "",
          cta_override: "",
          style_preset: "",
          color_preset: "",
          hero_preset: "",
        },
        preview: preview
          ? {
              stylePreset: preview.stylePreset,
              colorPreset: preview.colorPreset,
              imageCategoryKey: preview.imageCategoryKey,
              draft: preview.draft,
            }
          : null,
      };

      const res = await fetch("/api/public/website-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: em,
          notes: notesTrim || undefined,
          mockupData,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        previewUrl?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(String(data.error || "Something went wrong."));
        return;
      }
      setSavedUrl(String(data.previewUrl || ""));
      trackPublicEvent("public_free_mockup_submit");
      setPhase("success");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copySavedLink() {
    if (!savedUrl) return;
    try {
      await navigator.clipboard.writeText(savedUrl);
    } catch {
      // ignore
    }
  }

  if (phase === "success") {
    return (
      <div className="container free-mockup-success" style={{ maxWidth: 640, padding: "48px 20px 80px" }}>
        <div className="panel" style={{ padding: "28px 24px" }}>
          <h2 className="section-heading" style={{ marginBottom: 12 }}>
            Got it — your mockup is saved and sent.
          </h2>
          <p className="subhead" style={{ marginBottom: 20 }}>
            I&apos;ve got your mockup saved on my end, and I can review it when it&apos;s time to move forward. Your
            preview link is below — open or copy it anytime. You don&apos;t need every detail finished yet.
          </p>
          {savedUrl ? (
            <div className="btn-row" style={{ flexWrap: "wrap", marginBottom: 16 }}>
              <a href={savedUrl} target="_blank" rel="noreferrer" className="btn gold">
                Open your preview
              </a>
              <button type="button" className="btn ghost" onClick={() => void copySavedLink()}>
                Copy preview link
              </button>
            </div>
          ) : null}
          <p className="small" style={{ color: "var(--muted)", marginBottom: 20 }}>
            Keep this link handy — no automatic messages from me unless we connect about next steps.
          </p>
          <Link href="/web-design" className="btn ghost">
            Web design services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="free-mockup-start" className="free-mockup-funnel scroll-mt-24">
      <div className="free-mockup-funnel-grid">
        <div className="free-mockup-funnel-form card" style={{ padding: "20px 18px" }}>
          <h2 className="section-heading" style={{ marginBottom: 10, fontSize: "1.25rem" }}>
            Get Your Free Website Mockup
          </h2>
          <p className="small" style={{ color: "var(--muted)", marginTop: 0, marginBottom: 16, lineHeight: 1.55 }}>
            I&apos;ll design a custom homepage for your business so you can see exactly what your new site could look like
            — before you commit to anything.
          </p>

          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Name *
            <input
              className="form-input mt-1 w-full"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              autoComplete="name"
              placeholder="Your name"
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Business name *
            <input
              className="form-input mt-1 w-full"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder="e.g. ClearView Pressure Washing"
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            What does your business do? *
            <textarea
              className="form-textarea mt-1 w-full min-h-[80px]"
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              required
              placeholder="Short answer — what you offer and who you serve."
            />
          </label>

          <fieldset className="mb-3 border-0 p-0 m-0">
            <legend className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
              Do you have a website?
            </legend>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text)" }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="has-website"
                  checked={hasWebsite === "yes"}
                  onChange={() => setHasWebsite("yes")}
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="has-website"
                  checked={hasWebsite === "no"}
                  onChange={() => {
                    setHasWebsite("no");
                    setWebsiteUrl("");
                  }}
                />
                No
              </label>
            </div>
          </fieldset>
          {hasWebsite === "yes" ? (
            <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
              Website URL *
              <input
                className="form-input mt-1 w-full"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="yourbusiness.com or full https://…"
              />
            </label>
          ) : null}

          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            What&apos;s your main goal? (optional)
            <select
              className="form-select mt-1 w-full"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
            >
              <option value="">Select…</option>
              {SITE_GOAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
            Email *
            <input
              className="form-input mt-1 w-full"
              type="email"
              value={submitEmail}
              onChange={(e) => setSubmitEmail(e.target.value)}
              placeholder="you@business.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Phone (optional)
            <input
              className="form-input mt-1 w-full"
              type="tel"
              value={submitPhone}
              onChange={(e) => setSubmitPhone(e.target.value)}
              placeholder="(501) 555-0100"
              autoComplete="tel"
            />
          </label>

          {error ? (
            <p className="small" style={{ color: "#f87171", marginBottom: 10 }}>
              {error}
            </p>
          ) : null}
          <button type="button" className="btn gold w-full" disabled={loading} onClick={() => void submit()}>
            {loading ? "Sending…" : "Get My Free Mockup"}
          </button>
          <p className="small" style={{ color: "var(--muted)", marginTop: 12, marginBottom: 0, lineHeight: 1.55 }}>
            No pressure. I&apos;ll send you a custom design — you decide if you want to move forward.
          </p>
        </div>

        <div className="free-mockup-funnel-preview">
          {preview ? (
            <SampleDraftClient
              initialDraft={preview.draft}
              initialMode="presentation"
              embedOptions={{
                lockPresentation: true,
                initialStylePreset: preview.stylePreset,
                initialColorPreset: preview.colorPreset,
                secondaryHref: "#services",
                portfolioFooter: true,
                portfolioFooterMessage:
                  "Like what you're seeing? Submit the form with your email and I'll follow up with your saved mockup.",
                portfolioCopy: true,
                imageCategoryKey: preview.imageCategoryKey,
                wideLayout: true,
              }}
            />
          ) : (
            <div className="free-mockup-placeholder">
              <div>
                <p className="font-semibold" style={{ marginBottom: 8 }}>
                  Live preview
                </p>
                <p className="small" style={{ color: "var(--muted)", maxWidth: 360, margin: 0 }}>
                  Add your business name and a short description of what you do — your sample homepage appears here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
