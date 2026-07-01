"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FormLegalConsent } from "@/components/public/LegalConsent";
import { cn } from "@/lib/utils";
import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { buildFunnelPreviewFromSnapshot, type FunnelFormSnapshot } from "@/lib/crm-mockup";
import {
  FUNNEL_DESIGN_DIRECTION_OPTIONS,
  type FunnelDesignDirectionId,
} from "@/lib/funnel-design-directions";
import {
  FUNNEL_DESIRED_OUTCOME_IDS,
  FUNNEL_DESIRED_OUTCOME_LABELS,
  type FunnelDesiredOutcomeId,
} from "@/lib/funnel-desired-outcomes";
import { FreeMockupLivePreview } from "@/components/public/free-mockup-live-preview";
import { buildPreviewSnapshotFromFunnelSnapshot } from "@/lib/free-mockup-preview-snapshot";
import { publicShellClass } from "@/lib/public-brand";
import { trackPublicEvent } from "@/lib/public-analytics";

const FORM_STEPS = [
  { id: 1, label: "Basics", sectionId: "free-mockup-section-basics" },
  { id: 2, label: "Goals", sectionId: "free-mockup-section-goals" },
  { id: 3, label: "Style", sectionId: "free-mockup-section-style" },
  { id: 4, label: "Contact", sectionId: "free-mockup-section-contact" },
] as const;

const shell = publicShellClass;

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useMobileAccordion() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function FormProgress({
  basicsDone,
  goalsDone,
  styleDone,
  contactDone,
  onSectionSelect,
}: {
  basicsDone: boolean;
  goalsDone: boolean;
  styleDone: boolean;
  contactDone: boolean;
  onSectionSelect?: (sectionId: string) => void;
}) {
  const doneFlags = [basicsDone, goalsDone, styleDone, contactDone];
  const completedCount = doneFlags.filter(Boolean).length;
  const progressPct = Math.round((completedCount / FORM_STEPS.length) * 100);

  return (
    <div className="free-mockup-progress" aria-label="Form progress">
      <div className="free-mockup-progress-track" aria-hidden>
        <span className="free-mockup-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <ol className="free-mockup-progress-steps">
        {FORM_STEPS.map((step, index) => {
          const done = doneFlags[index];
          const active = !done && (index === 0 || doneFlags[index - 1]);
          return (
            <li key={step.id}>
              <button
                type="button"
                className={cn(
                  "free-mockup-progress-step",
                  done && "free-mockup-progress-step--done",
                  active && "free-mockup-progress-step--active",
                )}
                onClick={() => {
                  onSectionSelect?.(step.sectionId);
                  scrollToSection(step.sectionId);
                }}
              >
                <span className="free-mockup-progress-step-num" aria-hidden>
                  {done ? "✓" : step.id}
                </span>
                <span>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="free-mockup-progress-hint">
        {completedCount === FORM_STEPS.length
          ? "All set — submit when you're ready."
          : `${completedCount} of ${FORM_STEPS.length} sections complete`}
      </p>
    </div>
  );
}

function FormSection({
  id,
  title,
  hint,
  children,
  open,
  done,
  collapsible,
  onToggle,
}: {
  id: string;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
  open: boolean;
  done: boolean;
  collapsible: boolean;
  onToggle: () => void;
}) {
  const panelId = `${id}-panel`;

  return (
    <div
      id={id}
      className={cn(
        "free-mockup-form-section scroll-mt-28",
        collapsible && "free-mockup-form-section--collapsible",
        collapsible && open && "free-mockup-form-section--open",
        collapsible && done && "free-mockup-form-section--done",
      )}
    >
      <div className="free-mockup-form-section-head">
        {collapsible ? (
          <button
            type="button"
            className="free-mockup-form-section-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
          >
            <span className="free-mockup-form-section-toggle-main">
              <h3 className="free-mockup-form-section-title">{title}</h3>
              {done ? <span className="free-mockup-form-section-done">Done</span> : null}
            </span>
            <ChevronDown className="free-mockup-form-section-chevron" aria-hidden />
          </button>
        ) : (
          <h3 className="free-mockup-form-section-title">{title}</h3>
        )}
        {hint && (!collapsible || open) ? hint : null}
      </div>
      <div
        id={panelId}
        className={cn("free-mockup-form-section-body space-y-4", collapsible && !open && "free-mockup-form-section-body--collapsed")}
        hidden={collapsible ? !open : false}
      >
        {children}
      </div>
    </div>
  );
}

function toggleOutcome(
  set: Set<FunnelDesiredOutcomeId>,
  id: FunnelDesiredOutcomeId,
  on: boolean
): Set<FunnelDesiredOutcomeId> {
  const next = new Set(set);
  if (on) next.add(id);
  else next.delete(id);
  return next;
}

export function FreeMockupFunnelClient({
  funnelSource,
}: {
  /** e.g. `freshcut` from ?source=freshcut — soft defaults + contextual copy only */
  funnelSource?: string | null;
}) {
  const isFreshCutFunnel = funnelSource === "freshcut";
  const mobileAccordion = useMobileAccordion();
  const [openSectionId, setOpenSectionId] = useState<string>(FORM_STEPS[0].sectionId);

  const selectSection = (sectionId: string) => {
    setOpenSectionId(sectionId);
  };

  const toggleSection = (sectionId: string) => {
    setOpenSectionId(sectionId);
  };

  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [cityOrArea, setCityOrArea] = useState("");
  const [topServices, setTopServices] = useState("");
  const [hasWebsite, setHasWebsite] = useState<"yes" | "no">("no");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [designDirection, setDesignDirection] = useState<FunnelDesignDirectionId | "">(() =>
    isFreshCutFunnel ? "local-trust" : "",
  );
  const [desiredOutcomes, setDesiredOutcomes] = useState<Set<FunnelDesiredOutcomeId>>(() =>
    isFreshCutFunnel ? new Set<FunnelDesiredOutcomeId>(["get_more_calls", "get_more_leads"]) : new Set(),
  );

  const [whatMakesYouDifferent, setWhatMakesYouDifferent] = useState("");
  const [specialOffer, setSpecialOffer] = useState("");
  const [anythingToAvoid, setAnythingToAvoid] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  const [submitEmail, setSubmitEmail] = useState("");
  const [submitPhone, setSubmitPhone] = useState("");

  const [phase, setPhase] = useState<"form" | "success">("form");
  const [savedUrl, setSavedUrl] = useState("");
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const desiredOutcomeList = useMemo(() => Array.from(desiredOutcomes), [desiredOutcomes]);

  const snapshot: FunnelFormSnapshot | null = useMemo(() => {
    if (!designDirection) return null;
    return {
      business_name: businessName,
      category: businessType,
      city: cityOrArea,
      state: "",
      phone: submitPhone.trim(),
      email: submitEmail.trim(),
      website_url: hasWebsite === "yes" ? websiteUrl.trim() : "",
      facebook_url: "",
      services_text: topServices.trim(),
      template_mode: "auto",
      headline_override: "",
      subheadline_override: "",
      cta_override: "",
      style_preset: "",
      color_preset: "",
      hero_preset: "",
      selected_template_key: designDirection,
      desired_outcomes: desiredOutcomeList,
      top_services_to_feature: topServices.trim(),
      what_makes_you_different: whatMakesYouDifferent.trim(),
      special_offer_or_guarantee: specialOffer.trim(),
      anything_to_avoid: anythingToAvoid.trim(),
      anything_else_i_should_know: anythingElse.trim(),
    };
  }, [
    anythingElse,
    anythingToAvoid,
    businessName,
    businessType,
    cityOrArea,
    designDirection,
    desiredOutcomeList,
    hasWebsite,
    whatMakesYouDifferent,
    specialOffer,
    submitEmail,
    submitPhone,
    topServices,
    websiteUrl,
  ]);

  const canPreview = Boolean(
    businessName.trim() &&
      businessType.trim() &&
      cityOrArea.trim() &&
      topServices.trim() &&
      designDirection
  );

  const basicsDone = Boolean(
    contactName.trim() &&
      businessName.trim() &&
      businessType.trim() &&
      cityOrArea.trim() &&
      (hasWebsite === "no" || websiteUrl.trim()),
  );
  const goalsDone = Boolean(topServices.trim());
  const styleDone = Boolean(designDirection);
  const contactDone = Boolean(submitEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitEmail.trim()));

  const sectionDone = useMemo<Record<string, boolean>>(
    () => ({
      [FORM_STEPS[0].sectionId]: basicsDone,
      [FORM_STEPS[1].sectionId]: goalsDone,
      [FORM_STEPS[2].sectionId]: styleDone,
      [FORM_STEPS[3].sectionId]: contactDone,
    }),
    [basicsDone, contactDone, goalsDone, styleDone],
  );

  useEffect(() => {
    if (!mobileAccordion || !sectionDone[openSectionId]) return;
    const currentIndex = FORM_STEPS.findIndex((step) => step.sectionId === openSectionId);
    const nextStep = FORM_STEPS[currentIndex + 1];
    if (nextStep && !sectionDone[nextStep.sectionId]) {
      setOpenSectionId(nextStep.sectionId);
    }
  }, [mobileAccordion, openSectionId, sectionDone, basicsDone, goalsDone, styleDone, contactDone]);

  const preview = useMemo(() => {
    if (!canPreview || !snapshot) return null;
    try {
      return buildFunnelPreviewFromSnapshot(snapshot);
    } catch {
      return null;
    }
  }, [snapshot, canPreview]);

  async function submit() {
    setError(null);
    const cn = contactName.trim();
    const em = submitEmail.trim().toLowerCase();
    const bn = businessName.trim();
    const bt = businessType.trim();
    const city = cityOrArea.trim();
    const svc = topServices.trim();
    const dir = designDirection;

    if (!dir) {
      setError("Pick the design direction that feels closest to your business.");
      return;
    }
    if (!cn) {
      setError("Please enter your name.");
      return;
    }
    if (!bn) {
      setError("Please enter your business name.");
      return;
    }
    if (!bt) {
      setError("Add your business type or what you offer (e.g. HVAC, dental, landscaping).");
      return;
    }
    if (!city) {
      setError("Add your city or main service area.");
      return;
    }
    if (!svc) {
      setError("List a few services you want featured on the homepage.");
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

    const snapshotBody: FunnelFormSnapshot = {
      business_name: bn,
      category: bt,
      city,
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
      selected_template_key: dir,
      desired_outcomes: desiredOutcomeList,
      top_services_to_feature: svc,
      what_makes_you_different: whatMakesYouDifferent.trim(),
      special_offer_or_guarantee: specialOffer.trim(),
      anything_to_avoid: anythingToAvoid.trim(),
      anything_else_i_should_know: anythingElse.trim(),
    };

    setLoading(true);
    try {
      const preview_snapshot = buildPreviewSnapshotFromFunnelSnapshot(snapshotBody, funnelSource?.trim() || null);
      const mockupData = {
        funnelVersion: 2,
        funnel_source: funnelSource?.trim() || undefined,
        contactName: cn,
        submitPhone: submitPhone.trim(),
        snapshot: snapshotBody,
        preview_snapshot,
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
          notes: null,
          mockupData,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        previewUrl?: string;
        confirmation_email_sent?: boolean;
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        setError(String(data.error || "Something went wrong."));
        return;
      }
      setSavedUrl(String(data.previewUrl || ""));
      setConfirmationEmailSent(Boolean(data.confirmation_email_sent));
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
      <div className="free-mockup-success-wrap">
        <div className={cn(shell, "free-mockup-success")}>
          <div className="free-mockup-success-card public-glass-box--soft public-glass-box--pad">
            <p className="free-mockup-success-eyebrow">Request received</p>
            <h2 className="free-mockup-success-title">Got it — I&apos;ll take a look</h2>
            <p className="free-mockup-success-lead">
              I&apos;ll review your info and start putting together your preview. If I need anything, I&apos;ll reach
              out.
            </p>
            <p className="free-mockup-success-timing">You should hear from me within a day.</p>
            <p className="free-mockup-success-note">
              {confirmationEmailSent
                ? "Check your inbox for a quick confirmation email. Your live preview link is below whenever you want it."
                : "Your live preview link is below whenever you want it."}
            </p>
            {savedUrl ? (
              <div className="free-mockup-success-actions">
                <a href={savedUrl} target="_blank" rel="noreferrer" className={cn("btn gold", "no-underline hover:no-underline")}>
                  Open your preview
                </a>
                <button type="button" className="btn ghost" onClick={() => void copySavedLink()}>
                  Copy preview link
                </button>
              </div>
            ) : null}
            <p className="free-mockup-success-foot">
              One direction, done with care — we can refine after you&apos;ve seen it.
            </p>
            <Link href="/web-design" className="btn ghost">
              Web Design
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="free-mockup-start"
      className={cn("free-mockup-funnel scroll-mt-24", isFreshCutFunnel && "free-mockup-funnel--freshcut")}
    >
      <div className="free-mockup-funnel-grid">
        <div className="free-mockup-funnel-form card">
          <div className="free-mockup-intake-head">
            <p className="free-mockup-intake-eyebrow">Live preview · Guided intake</p>
            <h2 className="free-mockup-intake-title">Build your free preview</h2>
            <p className="free-mockup-intake-lead">
              Fill in the basics first — the preview on the right updates as you go. Four short sections, about two
              minutes for the essentials.
            </p>
            {isFreshCutFunnel ? (
              <p className="free-mockup-freshcut-note">
                You&apos;re getting a layout tuned for local trust and estimate-style requests — the same pattern family
                as the Fresh Cut example.
              </p>
            ) : null}
          </div>

          <FormProgress
            basicsDone={basicsDone}
            goalsDone={goalsDone}
            styleDone={styleDone}
            contactDone={contactDone}
            onSectionSelect={selectSection}
          />

          <FormSection
            id="free-mockup-section-basics"
            title="1 · Business basics"
            open={!mobileAccordion || openSectionId === "free-mockup-section-basics"}
            done={basicsDone}
            collapsible={mobileAccordion}
            onToggle={() => toggleSection("free-mockup-section-basics")}
            hint={
              <p className="free-mockup-form-section-hint">
                Fields marked <span className="font-semibold text-[var(--text)]">*</span> are required.
              </p>
            }
          >
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Your name *
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
              placeholder="e.g. ClearView Pressure Washing"
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Business type or services (summary) *
            <input
              className="form-input mt-1 w-full"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder={
                isFreshCutFunnel
                  ? "e.g. Local lawn care & property maintenance (service business)"
                  : "e.g. Residential HVAC · Hot Springs, AR area"
              }
            />
          </label>
          {isFreshCutFunnel ? (
            <p className="small mb-3" style={{ marginTop: -6, color: "var(--muted)", lineHeight: 1.5 }}>
              Tip: if you&apos;re a local service business, say so here — I&apos;ll match the structure to calls and
              estimates.
            </p>
          ) : null}
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            City or main service area *
            <input
              className="form-input mt-1 w-full"
              value={cityOrArea}
              onChange={(e) => setCityOrArea(e.target.value)}
              placeholder="e.g. Hot Springs, AR / Garland County"
            />
          </label>

          <fieldset className="mb-3 border-0 p-0 m-0">
            <legend className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
              Current website
            </legend>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text)" }}>
              <label className="free-mockup-choice flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="has-website"
                  checked={hasWebsite === "yes"}
                  onChange={() => setHasWebsite("yes")}
                />
                Yes
              </label>
              <label className="free-mockup-choice flex items-center gap-2 cursor-pointer">
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
          </FormSection>

          <FormSection
            id="free-mockup-section-goals"
            title="2 · Homepage goals"
            open={!mobileAccordion || openSectionId === "free-mockup-section-goals"}
            done={goalsDone}
            collapsible={mobileAccordion}
            onToggle={() => toggleSection("free-mockup-section-goals")}
          >
            <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
              Top services to feature on the homepage *
              <textarea
                className="form-textarea mt-1 w-full min-h-[88px]"
                value={topServices}
                onChange={(e) => setTopServices(e.target.value)}
                placeholder="One per line or comma-separated — what should visitors see first?"
              />
            </label>

          <fieldset className="mb-3 border-0 p-0 m-0">
            <legend className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
              What do you want your new website to help you do? (check all that apply)
            </legend>
            <div className="grid gap-2 text-sm" style={{ color: "var(--text)" }}>
              {FUNNEL_DESIRED_OUTCOME_IDS.map((id) => (
                <label key={id} className="free-mockup-choice flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={desiredOutcomes.has(id)}
                    onChange={(e) =>
                      setDesiredOutcomes((prev) => toggleOutcome(prev, id, e.target.checked))
                    }
                    className="mt-0.5"
                  />
                  <span>{FUNNEL_DESIRED_OUTCOME_LABELS[id]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            What makes you different?
            <textarea
              className="form-textarea mt-1 w-full min-h-[72px]"
              value={whatMakesYouDifferent}
              onChange={(e) => setWhatMakesYouDifferent(e.target.value)}
              placeholder="Experience, warranty, speed, specialty — a few honest lines."
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Special offer or guarantee (optional)
            <input
              className="form-input mt-1 w-full"
              value={specialOffer}
              onChange={(e) => setSpecialOffer(e.target.value)}
              placeholder="e.g. Same-day estimates · 1-year workmanship warranty"
            />
          </label>
          </FormSection>

          <FormSection
            id="free-mockup-section-style"
            title="3 · Preferences"
            open={!mobileAccordion || openSectionId === "free-mockup-section-style"}
            done={styleDone}
            collapsible={mobileAccordion}
            onToggle={() => toggleSection("free-mockup-section-style")}
            hint={
              <p className="free-mockup-form-section-hint">
                Choose the direction that feels closest — I&apos;ll refine from there.
              </p>
            }
          >
          <div
            className="rounded-lg p-3 mb-2"
            style={{ background: "rgba(0,255,178,0.06)", border: "1px solid rgba(0,255,178,0.2)" }}
          >
            <p className="small" style={{ margin: 0, lineHeight: 1.55, color: "var(--text)" }}>
              <strong>Design direction *</strong>
            </p>
            <p className="small" style={{ margin: "8px 0 0", lineHeight: 1.55, color: "var(--muted)" }}>
              Required so the live preview can match your business. Pick one — no need to overthink it.
            </p>
          </div>

          <fieldset className="mb-4 border-0 p-0 m-0">
            <legend className="sr-only">Design direction</legend>
            <div className="grid gap-2">
              {FUNNEL_DESIGN_DIRECTION_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="free-mockup-direction-option block cursor-pointer rounded-lg border p-3 transition-colors"
                  style={{
                    borderColor:
                      designDirection === opt.id ? "rgba(0,255,178,0.45)" : "var(--pub-border, rgba(255,255,255,0.12))",
                    background: designDirection === opt.id ? "rgba(0,255,178,0.05)" : "transparent",
                  }}
                >
                  <div className="flex gap-3 items-start">
                    <input
                      type="radio"
                      name="design-direction"
                      checked={designDirection === opt.id}
                      onChange={() => setDesignDirection(opt.id)}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {opt.label}
                      </span>
                      <p className="small" style={{ margin: "4px 0 0", color: "var(--muted)", lineHeight: 1.45 }}>
                        {opt.description}
                      </p>
                      <p className="small" style={{ margin: "6px 0 0", color: "var(--muted)", lineHeight: 1.45 }}>
                        <span style={{ opacity: 0.85 }}>Best for:</span> {opt.bestFor}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <div
            className="rounded-lg p-3 mb-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--pub-border, rgba(255,255,255,0.1))" }}
          >
            <p className="small" style={{ margin: 0, lineHeight: 1.55, color: "var(--muted)" }}>
              This preview shows one strong <strong style={{ color: "var(--text)" }}>direction</strong> for your business
              — not every possible variation.
            </p>
          </div>

          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Anything to avoid? (optional)
            <input
              className="form-input mt-1 w-full"
              value={anythingToAvoid}
              onChange={(e) => setAnythingToAvoid(e.target.value)}
              placeholder="Colors, tone, stock-photo vibes, competitor names…"
            />
          </label>
          <label className="block text-xs mb-3" style={{ color: "var(--muted)" }}>
            Anything else I should know? (optional)
            <textarea
              className="form-textarea mt-1 w-full min-h-[64px]"
              value={anythingElse}
              onChange={(e) => setAnythingElse(e.target.value)}
              placeholder="Timing, audience, brand constraints…"
            />
          </label>
          </FormSection>

          <FormSection
            id="free-mockup-section-contact"
            title="4 · Contact"
            open={!mobileAccordion || openSectionId === "free-mockup-section-contact"}
            done={contactDone}
            collapsible={mobileAccordion}
            onToggle={() => toggleSection("free-mockup-section-contact")}
          >
          <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
            Email *
            <input
              className="form-input mt-1 w-full"
              type="email"
              value={submitEmail}
              onChange={(e) => setSubmitEmail(e.target.value)}
              placeholder="you@business.com"
              autoComplete="email"
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
          </FormSection>

          <div className="free-mockup-submit-note">
            <p>
              Submit one serious request and I&apos;ll build the strongest version for your business. I can refine the
              direction after reviewing your request if needed.
            </p>
          </div>

          {error ? <p className="free-mockup-form-error">{error}</p> : null}
          <FormLegalConsent className="mb-4 text-[var(--muted)]" />
          <div className="free-mockup-cta-row">
            <button
              type="button"
              className={cn("btn gold", "w-full min-w-0 sm:w-auto sm:min-w-[220px]")}
              disabled={loading}
              onClick={() => void submit()}
            >
              {loading ? "Sending…" : "Get my free preview"}
            </button>
            <Link
              href="/examples"
              className={cn(
                "btn ghost w-full justify-center text-center no-underline sm:w-auto",
                "hover:no-underline",
              )}
            >
              {isFreshCutFunnel ? "See the Fresh Cut example" : "Browse real work"}
            </Link>
          </div>
          <p className="free-mockup-submit-foot">
            No payment, no contract — just a serious preview request.
          </p>
        </div>

        <div className="free-mockup-funnel-preview free-mockup-preview-stack flex min-h-0 flex-col">
          <div className="free-mockup-preview-star-label">
            <p className="free-mockup-preview-star-kicker">Live preview</p>
            <p className="free-mockup-preview-star-sub">Your homepage direction builds here as you type</p>
            <p className="free-mockup-preview-star-hint">
              Pick a design direction and fill in the basics to unlock the full interactive sample below.
            </p>
          </div>
          <div className="free-mockup-preview-frame">
            <div className="free-mockup-preview-chrome" role="presentation" aria-hidden>
              <span className="free-mockup-preview-chrome-dots">
                <span />
                <span />
                <span />
              </span>
              <span className="free-mockup-preview-chrome-label">Live homepage preview</span>
              <span className="free-mockup-preview-chrome-spacer" />
            </div>
            <div className="free-mockup-preview-viewport" role="region" aria-label="Live homepage preview">
              <FreeMockupLivePreview
                variant="framed"
                businessName={businessName}
                city={cityOrArea}
                servicesText={topServices}
                businessType={businessType}
                description={whatMakesYouDifferent}
                specialOffer={specialOffer}
                designDirection={designDirection}
                desiredOutcomes={desiredOutcomeList}
                isFreshCutFunnel={isFreshCutFunnel}
              />
              {preview ? (
                <div className="free-mockup-sample-embed min-h-0 flex-1 overflow-y-auto">
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
                        "This preview reflects your selected direction and details. Submit once when you’re ready — I’ll take it from there.",
                      portfolioCopy: true,
                      imageCategoryKey: preview.imageCategoryKey,
                      wideLayout: true,
                    }}
                  />
                </div>
              ) : (
                <div className="free-mockup-preview-empty flex flex-col justify-end">
                  <div className="free-mockup-preview-skeleton" aria-hidden>
                    <div className="free-mockup-preview-skeleton-bar free-mockup-preview-skeleton-bar--lg" />
                    <div className="free-mockup-preview-skeleton-bar free-mockup-preview-skeleton-bar--md" />
                    <div className="free-mockup-preview-skeleton-bar" />
                    <div className="free-mockup-preview-skeleton-cards">
                      <div className="free-mockup-preview-skeleton-card" />
                      <div className="free-mockup-preview-skeleton-card" />
                      <div className="free-mockup-preview-skeleton-card" />
                    </div>
                  </div>
                  <div className="free-mockup-preview-empty-copy">
                    <p className="free-mockup-preview-empty-title">Full interactive sample</p>
                    <p className="free-mockup-preview-empty-text">
                      Add your basics, services, area, and a design direction — a richer homepage loads here
                      automatically while the live preview above tracks every change.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
