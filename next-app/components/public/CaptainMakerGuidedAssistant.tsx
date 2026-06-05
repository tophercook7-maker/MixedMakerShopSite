"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Anchor,
  ArrowRight,
  Bot,
  Check,
  Copy,
  Globe,
  MapPin,
  Printer,
  Sparkles,
} from "lucide-react";
import { FormLegalConsent } from "@/components/public/LegalConsent";
import { LEAD_CONFIRMATION_MESSAGE } from "@/lib/lead-confirmation-message";
import {
  buildGuidedRecommendation,
  buildProjectSummary,
  CAPTAIN_MAKER_BADGES,
  CAPTAIN_MAKER_DISCLAIMER,
  EMPTY_GUIDED_ANSWERS,
  GUIDED_DETAIL_QUESTIONS,
  GUIDED_GOAL_QUESTIONS,
  GUIDED_PROGRESS_STEPS,
  prefillAnswersForQuickStart,
  QUICK_START_OPTIONS,
  type CaptainMakerQuickStartKey,
  type GuidedAnswers,
  type GuidedStep,
} from "@/lib/captain-maker-guided";
import {
  buildCaptainMakerProjectSummaryStorage,
  isFreeMockupHref,
  saveAndNavigateToFreeMockup,
} from "@/lib/captain-maker-project-summary";
import { cn } from "@/lib/utils";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsH3OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-orange-300/45 focus:ring-2 focus:ring-orange-300/15";

const quickStartIcons: Record<CaptainMakerQuickStartKey, typeof Globe> = {
  website: Globe,
  landing_page: Sparkles,
  local_leads: MapPin,
  print_3d: Printer,
  ai_automation: Bot,
  unsure: Anchor,
};

type CaptainMakerGuidedAssistantProps = {
  showIntro?: boolean;
};

function StepPanel({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <div
      key={stepKey}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
    >
      {children}
    </div>
  );
}

export function CaptainMakerGuidedAssistant({ showIntro = true }: CaptainMakerGuidedAssistantProps) {
  const [step, setStep] = useState<GuidedStep>("project_type");
  const [quickStart, setQuickStart] = useState<CaptainMakerQuickStartKey | null>(null);
  const [answers, setAnswers] = useState<GuidedAnswers>(EMPTY_GUIDED_ANSWERS);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [sendStatus, setSendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sendError, setSendError] = useState("");
  const [showSendForm, setShowSendForm] = useState(false);

  const recommendation = useMemo(
    () => buildGuidedRecommendation(answers, quickStart),
    [answers, quickStart],
  );
  const summary = useMemo(
    () => buildProjectSummary(answers, quickStart, recommendation),
    [answers, quickStart, recommendation],
  );

  const currentStepIndex = GUIDED_PROGRESS_STEPS.findIndex((item) => item.key === step);

  function updateAnswer<K extends keyof GuidedAnswers>(key: K, value: GuidedAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function handleQuickStart(key: CaptainMakerQuickStartKey) {
    setQuickStart(key);
    setAnswers({ ...EMPTY_GUIDED_ANSWERS, ...prefillAnswersForQuickStart(key) });
    setStep("details");
  }

  function detailsComplete(): boolean {
    return GUIDED_DETAIL_QUESTIONS.every((question) => answers[question.key].trim().length > 0);
  }

  function goalComplete(): boolean {
    return GUIDED_GOAL_QUESTIONS.every((question) => answers[question.key].trim().length > 0);
  }

  function handleRecommendationNavigation(href: string) {
    if (isFreeMockupHref(href)) {
      const payload = buildCaptainMakerProjectSummaryStorage(answers, recommendation, quickStart);
      saveAndNavigateToFreeMockup(payload);
      return;
    }
    window.location.assign(href);
  }

  async function handleCopySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2200);
    } catch {
      setCopyStatus("error");
      window.setTimeout(() => setCopyStatus("idle"), 2200);
    }
  }

  async function handleSendToTopher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendStatus("loading");
    setSendError("");

    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "public_lead",
          source: "captain_maker_guided",
          name,
          business_name: answers.businessOrIdea || recommendation.service,
          email,
          phone: phone || undefined,
          category: recommendation.service,
          service_type: quickStart || "guided_assistant",
          request: answers.projectType || recommendation.service,
          message: summary,
          transcript: summary,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.ok !== true) {
        throw new Error(String(body?.error || "Could not send your summary right now."));
      }
      setSendStatus("success");
      form.reset();
    } catch (err) {
      setSendStatus("error");
      setSendError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function resetFlow() {
    setStep("project_type");
    setQuickStart(null);
    setAnswers(EMPTY_GUIDED_ANSWERS);
    setShowSendForm(false);
    setSendStatus("idle");
    setSendError("");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {showIntro ? (
        <div className="public-glass-box public-glass-box--pad border border-orange-300/20 shadow-[0_0_48px_rgba(251,146,60,0.07)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-300/30 bg-orange-400/10 text-orange-200">
              <Anchor className="h-7 w-7" aria-hidden />
            </div>
            <div className="flex-1">
              <p className={mmsSectionEyebrowOnGlass}>Ahoy, Maker</p>
              <h2 className={cn(mmsH2OnGlass, "mt-3 !text-2xl md:!text-3xl")}>
                I&apos;m Captain Maker — your project compass.
              </h2>
              <p className={cn("mt-4 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Tell me what you&apos;re trying to build, fix, promote, or print. I&apos;ll collect the useful details,
                point you toward the right MixedMakerShop path, and keep the next step plain.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CAPTAIN_MAKER_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-semibold text-white/85"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="public-glass-box--soft public-glass-box--pad">
        <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", mmsOnGlassSecondary)}>
          Guided path
        </p>
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GUIDED_PROGRESS_STEPS.map((progressStep, index) => {
            const isActive = progressStep.key === step;
            const isComplete = index < currentStepIndex;
            return (
              <li
                key={progressStep.key}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-center transition duration-300",
                  isActive
                    ? "border-orange-300/40 bg-orange-400/10 text-white"
                    : isComplete
                      ? "border-emerald-300/25 bg-emerald-400/8 text-emerald-100"
                      : "border-white/10 bg-black/15 text-white/65",
                )}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
                  {isComplete ? "Done" : `Step ${index + 1}`}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug">{progressStep.label}</p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="public-glass-box public-glass-box--pad border border-white/10">
        {step === "project_type" ? (
          <StepPanel stepKey="project_type">
            <p className={mmsSectionEyebrowOnGlass}>What are you trying to do?</p>
            <h3 className={cn(mmsH3OnGlass, "mt-3 text-xl md:text-2xl")}>Pick the closest starting line.</h3>
            <p className={cn("mt-3 text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
              No wrong door here — choose what sounds closest and Captain Maker will ask a few follow-ups.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {QUICK_START_OPTIONS.map((option) => {
                const Icon = quickStartIcons[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleQuickStart(option.key)}
                    className="group rounded-2xl border border-white/12 bg-black/20 px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-orange-300/35 hover:bg-black/30"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-orange-200 transition group-hover:border-orange-300/30">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-base font-bold text-white">{option.label}</span>
                        <span className={cn("mt-1 block text-sm leading-relaxed", mmsOnGlassSecondary)}>
                          {option.hint}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </StepPanel>
        ) : null}

        {step === "details" ? (
          <StepPanel stepKey="details">
            <p className={mmsSectionEyebrowOnGlass}>Project details</p>
            <h3 className={cn(mmsH3OnGlass, "mt-3 text-xl md:text-2xl")}>Help me understand the build.</h3>
            <p className={cn("mt-3 text-sm leading-relaxed", mmsOnGlassSecondary)}>
              Plain answers are perfect. You don&apos;t need polished copy yet.
            </p>
            <div className="mt-6 space-y-4">
              {GUIDED_DETAIL_QUESTIONS.map((question) => (
                <label key={question.key} className="block">
                  <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>{question.label}</span>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={answers[question.key]}
                    onChange={(event) => updateAnswer(question.key, event.currentTarget.value)}
                    placeholder={question.placeholder}
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className={cn(mmsBtnSecondaryOnGlass, "justify-center")}
                onClick={() => setStep("project_type")}
              >
                Back
              </button>
              <button
                type="button"
                disabled={!detailsComplete()}
                className={cn(mmsBtnPrimary, "justify-center")}
                onClick={() => setStep("goal")}
              >
                Continue to goals
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </StepPanel>
        ) : null}

        {step === "goal" ? (
          <StepPanel stepKey="goal">
            <p className={mmsSectionEyebrowOnGlass}>Goals & timing</p>
            <h3 className={cn(mmsH3OnGlass, "mt-3 text-xl md:text-2xl")}>What should this help you accomplish?</h3>
            <div className="mt-6 space-y-4">
              {GUIDED_GOAL_QUESTIONS.map((question) => (
                <label key={question.key} className="block">
                  <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>{question.label}</span>
                  {question.options ? (
                    <select
                      className={inputClass}
                      value={answers[question.key]}
                      onChange={(event) => updateAnswer(question.key, event.currentTarget.value)}
                    >
                      <option value="">Pick one</option>
                      {question.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={inputClass}
                      value={answers[question.key]}
                      onChange={(event) => updateAnswer(question.key, event.currentTarget.value)}
                      placeholder={question.placeholder}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className={cn(mmsBtnSecondaryOnGlass, "justify-center")}
                onClick={() => setStep("details")}
              >
                Back
              </button>
              <button
                type="button"
                disabled={!goalComplete()}
                className={cn(mmsBtnPrimary, "justify-center")}
                onClick={() => setStep("recommendation")}
              >
                See Captain Maker recommendation
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </StepPanel>
        ) : null}

        {step === "recommendation" ? (
          <StepPanel stepKey="recommendation">
            <p className={mmsSectionEyebrowOnGlass}>Captain Maker recommendation</p>
            <div className="mt-4 rounded-3xl border border-orange-300/30 bg-gradient-to-br from-orange-400/12 via-black/20 to-black/30 p-5 shadow-[0_0_56px_rgba(251,146,60,0.12)] md:p-7">
              <div className="flex flex-wrap gap-2">
                {recommendation.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-orange-200/25 bg-orange-300/12 px-3 py-1 text-xs font-bold text-orange-100"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
                {recommendation.service}
              </h3>
              <div className="mt-5 space-y-4 text-sm leading-relaxed md:text-base">
                <p>
                  <span className="font-bold text-orange-100">Why: </span>
                  <span className={mmsOnGlassSecondary}>{recommendation.why}</span>
                </p>
                <p>
                  <span className="font-bold text-orange-100">Next step: </span>
                  <span className={mmsOnGlassSecondary}>{recommendation.nextStep}</span>
                </p>
                <p className={cn("rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm", mmsOnGlassSecondary)}>
                  <span className="font-semibold text-white">Starting point: </span>
                  {recommendation.startingPriceNote}
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {isFreeMockupHref(recommendation.ctaHref) ? (
                  <button
                    type="button"
                    className={cn(mmsBtnPrimary, "inline-flex justify-center gap-2")}
                    onClick={() => handleRecommendationNavigation(recommendation.ctaHref)}
                  >
                    {recommendation.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <Link
                    href={recommendation.ctaHref}
                    className={cn(mmsBtnPrimary, "inline-flex justify-center gap-2 no-underline hover:no-underline")}
                  >
                    {recommendation.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
                {recommendation.preferMockupCta ? (
                  <button
                    type="button"
                    className={cn(mmsBtnSecondaryOnGlass, "justify-center")}
                    onClick={() => setShowSendForm(true)}
                  >
                    Send this to Topher
                  </button>
                ) : isFreeMockupHref(recommendation.secondaryCtaHref) ? (
                  <button
                    type="button"
                    className={cn(mmsBtnSecondaryOnGlass, "justify-center")}
                    onClick={() => handleRecommendationNavigation(recommendation.secondaryCtaHref)}
                  >
                    {recommendation.secondaryCtaLabel}
                  </button>
                ) : (
                  <Link
                    href={recommendation.secondaryCtaHref}
                    className={cn(mmsBtnSecondaryOnGlass, "inline-flex justify-center no-underline hover:no-underline")}
                  >
                    {recommendation.secondaryCtaLabel}
                  </Link>
                )}
                <button
                  type="button"
                  className={cn(mmsBtnSecondaryOnGlass, "justify-center gap-2")}
                  onClick={handleCopySummary}
                >
                  {copyStatus === "copied" ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden />
                      Copy my project summary
                    </>
                  )}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className={cn("mt-3 text-sm", mmsOnGlassSecondary)}>Could not copy — try selecting the text manually.</p>
              ) : null}
            </div>

            {showSendForm || !recommendation.preferMockupCta ? (
              <div className="mt-6 border-t border-white/10 pt-6">
                {sendStatus === "success" ? (
                  <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                    {LEAD_CONFIRMATION_MESSAGE}
                  </p>
                ) : (
                  <form onSubmit={handleSendToTopher} className="space-y-4">
                    <p className={cn("text-sm leading-relaxed", mmsOnGlassSecondary)}>
                      Send your Captain Maker summary to Topher for human review. No automated quote — he confirms scope,
                      pricing, and timing before work begins.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Name</span>
                        <input name="name" required className={inputClass} autoComplete="name" />
                      </label>
                      <label className="block">
                        <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Email</span>
                        <input name="email" required type="email" className={inputClass} autoComplete="email" />
                      </label>
                    </div>
                    <label className="block sm:max-w-xs">
                      <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Phone (optional)</span>
                      <input name="phone" type="tel" className={inputClass} autoComplete="tel" />
                    </label>
                    <FormLegalConsent variant="glass" className={mmsOnGlassSecondary} />
                    {sendStatus === "error" ? <p className={cn("text-sm", mmsOnGlassSecondary)}>{sendError}</p> : null}
                    <button type="submit" disabled={sendStatus === "loading"} className={cn(mmsBtnPrimary, "justify-center")}>
                      {sendStatus === "loading" ? "Sending..." : "Send this to Topher"}
                    </button>
                  </form>
                )}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" className={cn(mmsBtnSecondaryOnGlass, "justify-center")} onClick={() => setStep("goal")}>
                Adjust answers
              </button>
              <button type="button" className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-2 px-1 py-2")} onClick={resetFlow}>
                Start over
              </button>
            </div>
          </StepPanel>
        ) : null}
      </div>

      <p className={cn("text-sm leading-relaxed", mmsOnGlassSecondary)}>{CAPTAIN_MAKER_DISCLAIMER}</p>
    </div>
  );
}
