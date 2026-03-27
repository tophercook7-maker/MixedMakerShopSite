"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import {
  buildFunnelPreviewFromSnapshot,
  FUNNEL_HERO_PRESET_KEYS,
  type FunnelFormSnapshot,
} from "@/lib/crm-mockup";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/lead-samples";

const STYLE_PRESETS = [
  { id: "clean-modern", label: "Clean / Modern" },
  { id: "bold-premium", label: "Bold / Premium" },
  { id: "friendly-local", label: "Friendly / Local" },
  { id: "minimal-elegant", label: "Minimal / Elegant" },
] as const;

const COLOR_PRESETS = [
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "dark", label: "Dark" },
  { id: "warm-neutral", label: "Warm neutral" },
  { id: "bold-accent", label: "Bold accent" },
  { id: "wellness", label: "Wellness (sand & sage layers)" },
] as const;

const TEMPLATES = [
  { value: "auto", label: "Auto — from your category" },
  { value: "generic-local", label: "Versatile local business" },
  { value: "pressure-washing", label: "Pressure washing" },
  { value: "auto-detailing", label: "Auto detailing" },
  { value: "landscaping", label: "Landscaping / lawn" },
  { value: "plumbing", label: "Plumbing / HVAC / trades" },
  { value: "restaurant", label: "Restaurant / food" },
  { value: "wellness", label: "Wellness / massage / yoga" },
] as const;

function heroPresetLabel(key: string): string {
  const m: Record<string, string> = {
    detailing: "Auto detailing",
    pressure_washing: "Pressure washing",
    landscaping: "Landscaping",
    service_business: "General service",
  };
  return m[key] || key.replace(/_/g, " ");
}

export function FreeMockupFunnelClient() {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [stateUS, setStateUS] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [templateMode, setTemplateMode] = useState("auto");
  const [headlineOverride, setHeadlineOverride] = useState("");
  const [subheadOverride, setSubheadOverride] = useState("");
  const [ctaOverride, setCtaOverride] = useState("");
  const [stylePreset, setStylePreset] = useState("");
  const [colorPreset, setColorPreset] = useState("");
  const [heroPreset, setHeroPreset] = useState("");

  const [contactName, setContactName] = useState("");
  const [submitEmail, setSubmitEmail] = useState("");
  const [submitPhone, setSubmitPhone] = useState("");

  const [phase, setPhase] = useState<"form" | "success">("form");
  const [savedUrl, setSavedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (email.trim() && !submitEmail.trim()) setSubmitEmail(email.trim());
  }, [email, submitEmail]);

  const snapshot: FunnelFormSnapshot = useMemo(
    () => ({
      business_name: businessName,
      category,
      city,
      state: stateUS,
      phone,
      email,
      website_url: websiteUrl,
      facebook_url: facebookUrl,
      services_text: servicesText,
      template_mode: templateMode,
      headline_override: headlineOverride,
      subheadline_override: subheadOverride,
      cta_override: ctaOverride,
      style_preset: stylePreset,
      color_preset: colorPreset,
      hero_preset: heroPreset,
    }),
    [
      businessName,
      category,
      city,
      stateUS,
      phone,
      email,
      websiteUrl,
      facebookUrl,
      servicesText,
      templateMode,
      headlineOverride,
      subheadOverride,
      ctaOverride,
      stylePreset,
      colorPreset,
      heroPreset,
    ]
  );

  const canPreview = Boolean(businessName.trim() && category.trim() && city.trim());

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
    if (!cn) {
      setError("Please enter your name.");
      return;
    }
    if (!em) {
      setError("Add your email so we can save your preview and follow up.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/public/website-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: cn,
          email: em,
          business_email: email.trim() || undefined,
          business_phone: phone.trim() || undefined,
          phone: submitPhone.trim() || undefined,
          website_url: websiteUrl.trim() || undefined,
          business_name: businessName.trim(),
          category: category.trim(),
          city: city.trim(),
          state: stateUS.trim() || undefined,
          facebook_url: facebookUrl.trim() || undefined,
          services_text: servicesText,
          template_mode: templateMode,
          headline_override: headlineOverride || undefined,
          subheadline_override: subheadOverride || undefined,
          cta_override: ctaOverride || undefined,
          style_preset: stylePreset || undefined,
          color_preset: colorPreset || undefined,
          hero_preset: heroPreset || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; previewUrl?: string; error?: string };
      if (!res.ok) {
        setError(String(data.error || "Something went wrong."));
        return;
      }
      setSavedUrl(String(data.previewUrl || ""));
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
            Got it — your preview has been saved.
          </h2>
          <p className="subhead" style={{ marginBottom: 20 }}>
            We&apos;ll follow up with you shortly. Your sample page is ready whenever you want to open or share it.
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
            If you entered an email, we&apos;ve sent your link there too (check spam just in case).
          </p>
          <Link href="/web-design" className="btn ghost">
            Web design services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="free-mockup-funnel">
      <div className="free-mockup-funnel-grid">
        <div className="free-mockup-funnel-form card" style={{ padding: "20px 18px" }}>
          <p className="text-sm font-semibold" style={{ marginBottom: 12 }}>
            Your business
          </p>
          <p className="small" style={{ color: "var(--muted)", marginTop: -6, marginBottom: 14 }}>
            Details here only power your sample preview — not a contract, not a mailing list signup.
          </p>
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
            Category *
            <select
              className="form-select mt-1 w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select…</option>
              {BUSINESS_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <label className="block text-xs" style={{ color: "var(--muted)" }}>
              City *
              <input
                className="form-input mt-1 w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Hot Springs"
              />
            </label>
            <label className="block text-xs" style={{ color: "var(--muted)" }}>
              State
              <input
                className="form-input mt-1 w-full"
                value={stateUS}
                onChange={(e) => setStateUS(e.target.value)}
                placeholder="AR"
              />
            </label>
          </div>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Phone (optional — shows on preview)
            <input
              className="form-input mt-1 w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(501) 555-0100"
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Email for the preview only (optional)
            <input
              className="form-input mt-1 w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
            />
          </label>
          <p className="small" style={{ color: "var(--muted)", marginTop: -10, marginBottom: 12 }}>
            If you add it, it can appear on the preview card — not the same as the email below for saving your link.
          </p>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Website (optional)
            <input
              className="form-input mt-1 w-full"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="yourbusiness.com"
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Facebook page (optional)
            <input
              className="form-input mt-1 w-full"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/…"
            />
          </label>
          <label className="block text-xs mb-4" style={{ color: "var(--muted)" }}>
            What do you need help with? (optional)
            <textarea
              className="form-textarea mt-1 w-full min-h-[72px]"
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              placeholder="e.g. better Google visibility, new landing page, clearer calls-to-action…"
            />
          </label>

          <p className="text-sm font-semibold" style={{ marginBottom: 10 }}>
            Fine-tune the preview
          </p>
          <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
            Layout template
            <select
              className="form-select mt-1 w-full"
              value={templateMode}
              onChange={(e) => setTemplateMode(e.target.value)}
            >
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
            Headline (optional override)
            <input
              className="form-input mt-1 w-full"
              value={headlineOverride}
              onChange={(e) => setHeadlineOverride(e.target.value)}
              placeholder="Leave blank for a smart default"
            />
          </label>
          <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
            Subheadline (optional)
            <textarea
              className="form-textarea mt-1 w-full min-h-[56px]"
              value={subheadOverride}
              onChange={(e) => setSubheadOverride(e.target.value)}
              placeholder="Make it easy for customers to find you…"
            />
          </label>
          <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
            Button text (optional)
            <input
              className="form-input mt-1 w-full"
              value={ctaOverride}
              onChange={(e) => setCtaOverride(e.target.value)}
              placeholder="Call Now, Get a Quote…"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <label className="block text-xs" style={{ color: "var(--muted)" }}>
              Style
              <select
                className="form-select mt-1 w-full"
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value)}
              >
                <option value="">Auto</option>
                {STYLE_PRESETS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs" style={{ color: "var(--muted)" }}>
              Color
              <select
                className="form-select mt-1 w-full"
                value={colorPreset}
                onChange={(e) => setColorPreset(e.target.value)}
              >
                <option value="">Auto</option>
                {COLOR_PRESETS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs mb-4" style={{ color: "var(--muted)" }}>
            Hero image style
            <select
              className="form-select mt-1 w-full"
              value={heroPreset}
              onChange={(e) => setHeroPreset(e.target.value)}
            >
              <option value="">Auto (from category)</option>
              {FUNNEL_HERO_PRESET_KEYS.map((k) => (
                <option key={k} value={k}>
                  {heroPresetLabel(k)}
                </option>
              ))}
            </select>
          </label>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 16,
              marginTop: 8,
            }}
          >
            <p className="text-sm font-semibold" style={{ marginBottom: 8 }}>
              Save your preview
            </p>
            <p className="small" style={{ color: "var(--muted)", marginBottom: 12 }}>
              To get a shareable link, add your name and the email you check most often — that&apos;s the main channel for
              your preview link and follow-up. You can play with the preview first and fill this when you&apos;re ready.
            </p>
            <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
              Your name *
              <input
                className="form-input mt-1 w-full"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Alex Johnson"
              />
            </label>
            <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
              Email <span style={{ color: "#f87171" }}>*</span> — where we&apos;ll send your link
              <input
                className="form-input mt-1 w-full"
                type="email"
                value={submitEmail}
                onChange={(e) => setSubmitEmail(e.target.value)}
                placeholder="you@gmail.com"
                required
              />
            </label>
            <p className="small" style={{ color: "var(--muted)", marginTop: -6, marginBottom: 10 }}>
              Replies and next steps go to this address first — keep it one you actually read.
            </p>
            <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
              Phone (optional)
              <input
                className="form-input mt-1 w-full"
                value={submitPhone}
                onChange={(e) => setSubmitPhone(e.target.value)}
                placeholder="(501) 555-0199"
              />
            </label>
            {error ? (
              <p className="small" style={{ color: "#f87171", marginBottom: 10 }}>
                {error}
              </p>
            ) : null}
            <button type="button" className="btn gold w-full" disabled={loading} onClick={() => void submit()}>
              {loading ? "Saving…" : "Save my preview & get my link"}
            </button>
          </div>
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
                  "Sample preview only — not a live site. Save your preview below to get a link you can share.",
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
                  Enter your business name, category, and city — your sample site appears here instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
