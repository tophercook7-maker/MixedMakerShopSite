"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { addBusinessDaysIso } from "@/lib/crm/business-days";
import { appendEncodedSmsBody, cleanPhoneForSmsAndTel } from "@/lib/crm/lead-phone-link";
import { buildMarkLeadRepliedPatch } from "@/lib/crm/mark-lead-replied";
import { buildLeadSmsBody } from "@/lib/crm/lead-sms-body";
import { buildLeadPath } from "@/lib/lead-route";
import {
  BUSINESS_TYPE_OPTIONS,
  CTA_STYLE_OPTIONS,
  HEADLINE_STYLE_OPTIONS,
  SITE_GOAL_OPTIONS,
  TEMPLATE_TYPE_OPTIONS,
  VISUAL_THEME_OPTIONS,
  applyRandomImagesToSample,
  autofillLeadSample,
  buildHeadlineFromStyle,
  buildDefaultLeadSample,
  getSuggestedServicesForBusinessType,
  normalizeLeadSampleRecord,
  pickCtaPairFromSiteGoal,
  readableBusinessType,
  type LeadSampleAutofillOptions,
  type LeadSampleImage,
  type LeadSampleRecord,
  type LeadSampleStatus,
} from "@/lib/lead-samples";

type LeadWorkspaceActionsProps = {
  leadId: string;
  linkedOpportunityId: string | null;
  initialBusinessName: string;
  initialCategory: string;
  initialCity?: string | null;
  initialIssue: string;
  initialStatus: string | null;
  initialDealStatus: string | null;
  initialDealStage?: "new" | "interested" | "pricing" | "closing" | "won";
  initialLastReplyPreview?: string | null;
  initialUnreadReplyCount?: number | null;
  initialEmail: string | null;
  initialPhone: string | null;
  website: string | null;
  contactPage: string | null;
  facebookUrl?: string | null;
  caseHref: string | null;
  initialNotes: string[];
  initialDoorStatus?: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost" | null;
  initialRealWorldWhyTarget?: string | null;
  initialRealWorldWalkInPitch?: string | null;
  initialBestTimeToVisit?: string | null;
  quickFixSummary?: string | null;
  autoGenerate?: boolean;
  autoCompose?: boolean;
  autoOpenSampleBuilder?: boolean;
  /** Server-known last outreach (for persistent “sent” confidence on reload) */
  initialLastOutreachChannel?: "email" | "facebook" | "text" | null;
  initialLastOutreachStatus?: "draft" | "sending" | "sent" | "failed" | null;
  initialLastOutreachSentAt?: string | null;
  /** Prefill compose when opening with ?compose=1 (e.g. from suggested response). */
  initialSuggestedOutreachSubject?: string | null;
  initialSuggestedOutreachBody?: string | null;
};

type TemplateResponse = {
  short_email?: string;
  longer_email?: string;
  follow_up_note?: string;
};

type PreparedOutreachDraft = {
  leadId: string;
  subject: string;
  body: string;
  previewUrl: string;
  updatedAt: string;
};

const LOCAL_SAMPLES_KEY = "crm.lead_samples";

/** Stable fingerprint for dirty-check / auto-save (not cryptographic). */
function sampleDraftFingerprint(s: LeadSampleRecord): string {
  const svc = [...s.services].join("\u001f");
  const imgs = s.images.map((i) => `${i.id}:${i.role}:${i.src}`).join("\u001f");
  return [
    s.hero_headline,
    s.hero_subheadline,
    s.cta_text,
    s.cta_style,
    s.intro_text,
    svc,
    s.primary_image_url,
    s.business_name,
    s.business_type,
    s.site_goal,
    s.template_key,
    s.headline_style,
    s.visual_theme,
    s.template_type,
    s.accent_mode,
    s.preview_slug,
    s.status,
    imgs,
    s.gallery_image_urls.join("\u001f"),
    s.image_urls.join("\u001f"),
    s.additional_image_urls.join("\u001f"),
  ].join("\u0000");
}
const OUTREACH_DRAFTS_KEY = "crm.outreach_prepared_drafts";

const QUICK_REPLY_STORAGE_KEY = "crm.quick_replies.custom";

type DealStage = "new" | "interested" | "pricing" | "closing" | "won";

type QuickReplyTemplate = {
  id: string;
  label: string;
  message: string;
  isCustom?: boolean;
};

const QUICK_REPLIES: QuickReplyTemplate[] = [
  {
    id: "interested",
    label: "👍 Interested",
    message:
      "Nice, glad you like it 👍\n\nI can turn that into a real live site for you pretty quickly — want me to show you how it would work and pricing?",
  },
  {
    id: "price",
    label: "💰 Pricing Question",
    message:
      "Good question — I keep it simple.\n\nStarter setups are $400 (clean one-page site, mobile-friendly, click-to-call, contact form, basic Google setup).\n\nBusiness setups are $900 when you want 3–5 pages, service pages, stronger CTAs, Google profile optimization, and review setup.\n\nCustom work is quoted by project.\n\nWant me to break down what you'd get?",
  },
  {
    id: "facebook",
    label: "📱 Uses Facebook Only",
    message:
      "Totally get that — a lot of people rely on Facebook.\n\nThe difference is a simple site like this makes it way easier for new customers to find you, trust you, and actually reach out.\n\nIt works alongside your Facebook, not replaces it.",
  },
  {
    id: "not_now",
    label: "🕐 Not Now",
    message:
      "No worries at all 👍\n\nIf you ever want something like that set up later, just let me know — I can get it done pretty quick.",
  },
  {
    id: "more_info",
    label: "👀 More Info",
    message:
      "For sure — I keep it simple.\n\nI build you a clean site like the sample, make it easy for people to contact you, and help it look legit when people find you online.\n\nI can also handle updates if you ever need them.",
  },
  {
    id: "ready",
    label: "🔥 Ready to Start",
    message:
      "Awesome 🙌\n\nI’ll keep this simple — I just need a few details from you and I can get started.\n\nWhat’s the best way to reach you — text or call?",
  },
];

type ClosingReplyTemplate = {
  id: "interest" | "pricing" | "closing" | "lock_in";
  label: string;
  message: string;
  stage: DealStage;
  nextAction: string;
};

const CLOSING_REPLIES: ClosingReplyTemplate[] = [
  {
    id: "interest",
    label: "INTEREST",
    stage: "interested",
    nextAction: "Show how it works and share pricing range.",
    message:
      "Nice, glad you like it 👍\n\nI can get something like that live for you pretty quickly.\n\nWant me to show you how it would work and pricing?",
  },
  {
    id: "pricing",
    label: "PRICING",
    stage: "pricing",
    nextAction: "Confirm scope and align on budget.",
    message:
      "I keep it simple — starter setups are $400 and full business setups are $900, depending on how many pages and extras you need.\n\nMain goal is to help you get more calls and make it easy for customers to reach you.\n\nWant me to walk you through it real quick?",
  },
  {
    id: "closing",
    label: "CLOSING",
    stage: "closing",
    nextAction: "Ask for go-ahead and collect kickoff details.",
    message:
      "If you’re good with it, I can start putting it together for you and we can tweak anything you want as we go.\n\nI just need a couple details from you to get started.",
  },
  {
    id: "lock_in",
    label: "LOCK IN",
    stage: "won",
    nextAction: "Lock preferred contact method and kickoff.",
    message:
      "Awesome — what’s the best way to reach you, text or call?\n\nI’ll make this super simple and get you set up 👍",
  },
];

function normalizeDealStage(value: unknown): DealStage {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "interested" || normalized === "pricing" || normalized === "closing" || normalized === "won") {
    return normalized;
  }
  return "new";
}

function inferSuggestedClosingReply(replyText: string, currentStatus: string): ClosingReplyTemplate {
  const text = String(replyText || "").toLowerCase();
  const status = String(currentStatus || "").toLowerCase();
  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("budget") ||
    text.includes("$") ||
    text.includes("how much")
  ) {
    return CLOSING_REPLIES.find((entry) => entry.id === "pricing") || CLOSING_REPLIES[1];
  }
  if (
    text.includes("sounds good") ||
    text.includes("lets do it") ||
    text.includes("let's do it") ||
    text.includes("ready") ||
    text.includes("go ahead") ||
    text.includes("start")
  ) {
    return CLOSING_REPLIES.find((entry) => entry.id === "closing") || CLOSING_REPLIES[2];
  }
  if (
    status === "replied" ||
    text.includes("interested") ||
    text.includes("looks good") ||
    text.includes("like it") ||
    text.includes("yes")
  ) {
    return CLOSING_REPLIES.find((entry) => entry.id === "interest") || CLOSING_REPLIES[0];
  }
  return CLOSING_REPLIES[0];
}

function fallbackDraft(name: string, issue: string, opts?: { hasWebsite?: boolean; hasScreenshot?: boolean }) {
  const hasWebsite = Boolean(opts?.hasWebsite);
  const hasScreenshot = Boolean(opts?.hasScreenshot);
  const opener = hasWebsite
    ? `I was looking at your website and noticed: ${issue || "something that might be affecting conversions"}.`
    : `I was looking at your business online and noticed: ${issue || "you do not have a clear website presence yet"}.`;
  return {
    subject: hasWebsite ? "quick question about your website" : "quick idea for your business",
    body: [
      `Hi ${name || ""},`,
      "",
      opener,
      "",
      ...(hasScreenshot ? ["I grabbed a quick screenshot showing it.", ""] : []),
      "Would you like me to send it over?",
      "",
      "- Topher",
    ].join("\n"),
  };
}

function beginnerPricingSuggestion(category: string): { label: string; midpoint: number } {
  const normalized = String(category || "").toLowerCase();
  const isStandard =
    normalized.includes("contractor") ||
    normalized.includes("church") ||
    normalized.includes("service") ||
    normalized.includes("clinic");
  return isStandard
    ? { label: "Business setup ($900)", midpoint: 900 }
    : { label: "Starter setup ($400)", midpoint: 400 };
}

function sanitizeOutreachBody(body: string, opts: { hasWebsite: boolean; hasScreenshot: boolean }): string {
  let next = String(body || "").trim();
  if (!opts.hasWebsite) {
    next = next.replace(/looking at your website/gi, "looking at your business online");
    next = next.replace(/your website/gi, "your online presence");
  }
  if (!opts.hasScreenshot) {
    next = next
      .split("\n")
      .filter((line) => !/screenshot/i.test(line))
      .join("\n");
  }
  return next;
}

export function LeadWorkspaceActions({
  leadId,
  linkedOpportunityId,
  initialBusinessName,
  initialCategory,
  initialCity = null,
  initialIssue,
  initialStatus,
  initialDealStatus,
  initialDealStage = "new",
  initialLastReplyPreview = null,
  initialEmail,
  initialPhone,
  website,
  contactPage,
  facebookUrl = null,
  caseHref,
  initialNotes,
  initialDoorStatus = "not_visited",
  initialRealWorldWhyTarget = null,
  initialRealWorldWalkInPitch = null,
  initialBestTimeToVisit = null,
  quickFixSummary = null,
  autoGenerate = false,
  autoCompose = false,
  autoOpenSampleBuilder = false,
  initialLastOutreachChannel = null,
  initialLastOutreachStatus = null,
  initialLastOutreachSentAt = null,
  initialSuggestedOutreachSubject = null,
  initialSuggestedOutreachBody = null,
  initialUnreadReplyCount = null,
}: LeadWorkspaceActionsProps) {
  const hasWebsitePresence = Boolean(String(website || "").trim());
  const prefilledSmsHrefValue = useMemo(() => {
    const phone = String(initialPhone || "").trim();
    if (!phone) return null;
    const links = cleanPhoneForSmsAndTel(phone);
    if (!links) return null;
    const body = buildLeadSmsBody({
      website: String(website || ""),
      lead_tags: undefined,
      has_website: null,
    });
    return appendEncodedSmsBody(links.smsHref, body);
  }, [initialPhone, website]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>(initialNotes);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [proposalText, setProposalText] = useState("");
  const [doorStatus, setDoorStatus] = useState<string>(String(initialDoorStatus || "not_visited"));
  const [realWorldWhyTarget, setRealWorldWhyTarget] = useState(String(initialRealWorldWhyTarget || ""));
  const [realWorldWalkInPitch, setRealWorldWalkInPitch] = useState(String(initialRealWorldWalkInPitch || ""));
  const [bestTimeToVisit, setBestTimeToVisit] = useState(String(initialBestTimeToVisit || ""));
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [sampleBuilderOpen, setSampleBuilderOpen] = useState(autoOpenSampleBuilder);
  const [sample, setSample] = useState<LeadSampleRecord | null>(null);
  const [sampleStorageSource, setSampleStorageSource] = useState<"server" | "local" | null>(null);
  const [generatedSampleEmail, setGeneratedSampleEmail] = useState("");
  const [generatedSampleText, setGeneratedSampleText] = useState("");
  const [pastedImageUrl, setPastedImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAddingImageUrl, setIsAddingImageUrl] = useState(false);
  const [quickReplyMode, setQuickReplyMode] = useState<"replace" | "append">("replace");
  const [selectedQuickReplyId, setSelectedQuickReplyId] = useState("");
  const [customQuickReplies, setCustomQuickReplies] = useState<QuickReplyTemplate[]>([]);
  const [selectedClosingReplyId, setSelectedClosingReplyId] = useState("");
  const [dealStage, setDealStage] = useState<DealStage>(normalizeDealStage(initialDealStage));
  const [isPreparingSend, setIsPreparingSend] = useState(false);
  const [preparedPreviewUrl, setPreparedPreviewUrl] = useState("");
  const [isPreparedReady, setIsPreparedReady] = useState(false);
  type DraftSaveUiState = "idle" | "saving" | "saved" | "saved_local" | "failed";
  const [draftSaveUi, setDraftSaveUi] = useState<DraftSaveUiState>("idle");
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<string | null>(null);
  const lastSavedDraftFingerprintRef = useRef<string>("");
  const sampleLatestRef = useRef<LeadSampleRecord | null>(null);

  useEffect(() => {
    if (!message) return;
    setToastMessage(message);
    const t = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);
  const skipAutosaveUntilRef = useRef(0);
  sampleLatestRef.current = sample;

  const [outreachEcho, setOutreachEcho] = useState<{
    ok: boolean;
    channel: "email" | "preview_email";
    at: string;
    error?: string;
  } | null>(null);

  const hasDraft = subject.trim().length > 0 || body.trim().length > 0;
  const showCompose = autoCompose || hasDraft;
  const proposalEligible =
    String(initialStatus || "").trim().toLowerCase() === "replied" ||
    String(initialDealStatus || "").trim().toLowerCase() === "interested";

  useEffect(() => {
    if (autoGenerate) {
      void generateDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, leadId]);

  useEffect(() => {
    if (autoOpenSampleBuilder) setSampleBuilderOpen(true);
  }, [autoOpenSampleBuilder]);

  useEffect(() => {
    if (sampleBuilderOpen) {
      skipAutosaveUntilRef.current = Date.now() + 2000;
    }
  }, [sampleBuilderOpen]);

  const outreachBanner = useMemo(() => {
    if (outreachEcho) return outreachEcho;
    if (initialLastOutreachStatus === "sent" && initialLastOutreachSentAt) {
      return {
        ok: true as const,
        channel: "email" as const,
        at: initialLastOutreachSentAt,
      };
    }
    if (initialLastOutreachStatus === "failed") {
      return {
        ok: false as const,
        channel: "email" as const,
        at: new Date().toISOString(),
        error: "Last email send failed. Check Scout / Resend or try again.",
      };
    }
    return null;
  }, [outreachEcho, initialLastOutreachStatus, initialLastOutreachSentAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(QUICK_REPLY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<QuickReplyTemplate>;
      if (!Array.isArray(parsed)) return;
      const normalized = parsed
        .map((item) => ({
          id: String(item.id || "").trim() || `custom-${crypto.randomUUID()}`,
          label: String(item.label || "").trim(),
          message: String(item.message || "").trim(),
          isCustom: true,
        }))
        .filter((item) => item.label && item.message);
      setCustomQuickReplies(normalized);
    } catch {
      // ignore parse failures
    }
  }, []);

  useEffect(() => {
    const suggested = inferSuggestedClosingReply(
      String(initialLastReplyPreview || ""),
      String(initialStatus || "")
    );
    setSelectedClosingReplyId(suggested.id);
  }, [initialLastReplyPreview, initialStatus, leadId]);

  useEffect(() => {
    const draft = readPreparedOutreachDraft(leadId);
    if (draft) {
      if (draft.subject) setSubject(draft.subject);
      if (draft.body) setBody(draft.body);
      if (draft.previewUrl) {
        setPreparedPreviewUrl(draft.previewUrl);
        setPreviewUrl(draft.previewUrl);
        setIsPreparedReady(true);
      }
      return;
    }
    const sugBody = String(initialSuggestedOutreachBody || "").trim();
    if (sugBody) {
      setBody(sugBody);
      const sugSub = String(initialSuggestedOutreachSubject || "").trim();
      if (sugSub) setSubject(sugSub);
    }
  }, [leadId, initialSuggestedOutreachBody, initialSuggestedOutreachSubject]);

  useEffect(() => {
    const preview = String(preparedPreviewUrl || previewUrl || "").trim();
    const draftBody = String(body || "").trim();
    const draftSubject = String(subject || "").trim();
    if (!preview && !draftBody && !draftSubject) return;
    writePreparedOutreachDraft({
      leadId,
      subject: subject || "",
      body: body || "",
      previewUrl: preview,
      updatedAt: new Date().toISOString(),
    });
  }, [body, leadId, previewUrl, preparedPreviewUrl, subject]);

  function readLocalSamples(): LeadSampleRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_SAMPLES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as LeadSampleRecord[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => normalizeLeadSampleRecord(item));
    } catch {
      return [];
    }
  }

  function writeLocalSamples(next: LeadSampleRecord[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_SAMPLES_KEY, JSON.stringify(next));
  }

  function upsertLocalSample(nextSample: LeadSampleRecord) {
    const current = readLocalSamples();
    const remaining = current.filter((item) => item.id !== nextSample.id);
    writeLocalSamples([nextSample, ...remaining]);
  }

  function readPreparedOutreachDraft(lookupLeadId: string): PreparedOutreachDraft | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(OUTREACH_DRAFTS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Record<string, PreparedOutreachDraft>;
      const entry = parsed?.[lookupLeadId];
      if (!entry) return null;
      return {
        leadId: lookupLeadId,
        subject: String(entry.subject || ""),
        body: String(entry.body || ""),
        previewUrl: String(entry.previewUrl || ""),
        updatedAt: String(entry.updatedAt || ""),
      };
    } catch {
      return null;
    }
  }

  function writePreparedOutreachDraft(draft: PreparedOutreachDraft) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(OUTREACH_DRAFTS_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, PreparedOutreachDraft>) : {};
      parsed[draft.leadId] = draft;
      localStorage.setItem(OUTREACH_DRAFTS_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore storage failures.
    }
  }

  function buildSamplePreviewLink(sampleId: string): string {
    if (typeof window === "undefined") return `/samples/${encodeURIComponent(sampleId)}`;
    return `${window.location.origin}/samples/${encodeURIComponent(sampleId)}`;
  }

  function generateShareCopy(nextSample: LeadSampleRecord) {
    const previewLink = buildSamplePreviewLink(nextSample.id);
    const subject = `Quick website idea for ${nextSample.business_name}`;
    const emailBody = [
      `Hi ${nextSample.business_name},`,
      "",
      "I put together a quick sample to show how your business could look with a cleaner, more modern website.",
      "",
      "You can preview it here:",
      previewLink,
      "",
      "If you want, I can build something like this out into a real live site for you.",
      "",
      "- Topher",
    ].join("\n");
    const textBody = [
      "Hey, I put together a quick website sample to show what your business could look like online:",
      previewLink,
      "If you want, I can build something like this out for real.",
    ].join("\n");
    setGeneratedSampleEmail(`Subject: ${subject}\n\n${emailBody}`);
    setGeneratedSampleText(textBody);
  }

  function applyAutofill(
    base: LeadSampleRecord,
    trigger: "open_builder" | "first_generate",
    opts?: LeadSampleAutofillOptions
  ): LeadSampleRecord {
    const result = autofillLeadSample(
      base,
      {
        businessName: initialBusinessName,
        category: initialCategory,
        city: initialCity,
        issue: initialIssue,
        quickFixSummary,
        notes: savedNotes,
        website,
      },
      opts
    );
    if (process.env.NODE_ENV !== "production" && result.filledFields.length > 0) {
      console.info("[Lead Sample Autofill]", {
        lead_id: leadId,
        trigger,
        filled_fields: result.filledFields,
        sources: result.sources,
      });
    }
    return result.sample;
  }

  function applySelectionDerivations(base: LeadSampleRecord): LeadSampleRecord {
    const next = normalizeLeadSampleRecord({
      ...base,
      business_type: String(base.business_type || "").trim() || readableBusinessType(initialCategory || "service business"),
      template_key:
        String(base.template_type || "").toLowerCase().includes("before")
          ? "before-after"
          : String(base.template_type || "").toLowerCase().includes("lead gen")
            ? "lead-gen"
            : String(base.template_type || "").toLowerCase().includes("trust")
              ? "local-trust"
              : "service-business",
      accent_mode:
        String(base.visual_theme || "").toLowerCase().includes("bold")
          ? "bold-premium"
          : String(base.visual_theme || "").toLowerCase().includes("friendly")
            ? "friendly-local"
            : String(base.visual_theme || "").toLowerCase().includes("premium")
              ? "minimal-elegant"
              : "clean-modern",
    });
    return normalizeLeadSampleRecord({
      ...next,
      hero_headline: buildHeadlineFromStyle({
        style: next.headline_style,
        businessType: next.business_type,
        city: initialCity,
        businessName: next.business_name || initialBusinessName,
      }),
      cta_text: next.cta_style || next.cta_text,
    });
  }

  function resetToSuggestedDefaults() {
    const base = buildDefaultLeadSample({
      leadId,
      businessName: initialBusinessName,
      businessType: initialCategory,
      note: initialIssue,
    });
    const withDefaults = applyAutofill(base, "first_generate", { forcePersonalizedCopy: true });
    setSampleAndRefresh(withDefaults);
    lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(withDefaults);
    setDraftSaveUi("idle");
    setMessage("Reset to suggested copy and defaults.");
    setError(null);
  }

  function regenerateSampleCopy() {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const suggested = normalizeLeadSampleRecord({
      ...base,
      hero_headline: "",
      hero_subheadline: "",
      intro_text: "",
      services: [],
      site_goal: "",
      headline_style: "",
      cta_style: "",
      cta_text: "",
      template_type: "",
      visual_theme: "",
    });
    const withDefaults = applyAutofill(suggested, "open_builder", { forcePersonalizedCopy: true });
    setSampleAndRefresh(withDefaults);
    lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(withDefaults);
    setDraftSaveUi("idle");
    setMessage("Copy regenerated from lead insights.");
    setError(null);
  }

  function setSampleAndRefresh(next: LeadSampleRecord) {
    setSample(next);
    buildPreviewUrl(next);
    generateShareCopy(next);
  }

  function deriveImageFieldsFromImages(images: LeadSampleImage[]) {
    const hero = images.find((entry) => entry.role === "hero") || images[0] || null;
    const gallery = images.filter((entry) => entry.role === "gallery").map((entry) => entry.src);
    return {
      primary_image_url: hero?.src || "",
      additional_image_urls: gallery,
      image_urls: gallery,
      gallery_image_urls: gallery.slice(0, 3),
    };
  }

  function updateSampleImages(images: LeadSampleImage[]) {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    if (!images.length) {
      const cleared = normalizeLeadSampleRecord({
        ...base,
        images: [],
        primary_image_url: "",
        additional_image_urls: [],
        image_urls: [],
        gallery_image_urls: [],
      });
      setSampleAndRefresh(cleared);
      return;
    }
    const heroExists = images.some((entry) => entry.role === "hero");
    const normalizedImages: LeadSampleImage[] = heroExists
      ? images
      : images.map((entry, idx) => ({
          ...entry,
          role: (idx === 0 ? "hero" : "gallery") as "hero" | "gallery",
        }));
    const fields = deriveImageFieldsFromImages(normalizedImages);
    const next = normalizeLeadSampleRecord({
      ...base,
      images: normalizedImages,
      ...fields,
    });
    setSampleAndRefresh(next);
  }

  function addImageToSample(src: string, source: "upload" | "url" | "stock") {
    const base = sample || buildDefaultLeadSample({ leadId, businessName: initialBusinessName, businessType: initialCategory, note: initialIssue });
    const existing = Array.isArray(base.images) ? base.images : [];
    if (existing.some((entry) => entry.src === src)) return;
    const nextImages: LeadSampleImage[] = [
      ...existing,
      {
        id: crypto.randomUUID(),
        src,
        source,
        role: existing.length === 0 ? "hero" : "gallery",
      },
    ];
    updateSampleImages(nextImages);
  }

  async function uploadImageFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("lead_id", leadId);
    const res = await fetch("/api/lead-samples/upload", {
      method: "POST",
      body: form,
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string; mode?: string };
    if (!res.ok || !data.url) {
      throw new Error(String(data.error || "Could not upload image."));
    }
    return data.url;
  }

  async function handleUploadImages(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setIsUploadingImage(true);
    setError(null);
    let added = 0;
    try {
      const files = Array.from(fileList);
      for (const file of files) {
        const url = await uploadImageFile(file);
        addImageToSample(url, "upload");
        added += 1;
      }
      setMessage(added > 0 ? `Added ${added} uploaded image${added > 1 ? "s" : ""}.` : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function looksLikeImageUrl(url: string): boolean {
    const value = String(url || "").trim();
    if (!/^https?:\/\//i.test(value)) return false;
    return (
      /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value) ||
      value.includes("images.unsplash.com") ||
      value.includes("fbcdn.net") ||
      value.includes("cdn") ||
      value.includes("image")
    );
  }

  async function canRenderImage(url: string): Promise<boolean> {
    if (typeof window === "undefined") return true;
    return new Promise((resolve) => {
      const image = new Image();
      const timer = window.setTimeout(() => resolve(false), 5000);
      image.onload = () => {
        window.clearTimeout(timer);
        resolve(true);
      };
      image.onerror = () => {
        window.clearTimeout(timer);
        resolve(false);
      };
      image.src = url;
    });
  }

  async function addImageFromUrl() {
    const nextUrl = String(pastedImageUrl || "").trim();
    if (!nextUrl) {
      setError("Paste an image URL first.");
      return;
    }
    setError(null);
    setIsAddingImageUrl(true);
    try {
      const res = await fetch("/api/lead-samples/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: nextUrl, lead_id: leadId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      const finalUrl = String(data.url || "").trim() || nextUrl;
      if (!res.ok && !finalUrl) {
        throw new Error(String(data.error || "Could not add image URL."));
      }
      if (!looksLikeImageUrl(finalUrl) && !(await canRenderImage(finalUrl))) {
        throw new Error("This URL does not look like a valid image.");
      }
      addImageToSample(finalUrl, "url");
      setPastedImageUrl("");
      setMessage("Image added from URL.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add image from URL.");
    } finally {
      setIsAddingImageUrl(false);
    }
  }

  async function loadLeadSample() {
    setIsSampleLoading(true);
    const fallback = readLocalSamples().find((item) => item.lead_id === leadId) || null;
    if (fallback) {
      setSample(fallback);
      setSampleStorageSource("local");
      buildPreviewUrl(fallback);
      generateShareCopy(fallback);
      lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(fallback);
    }
    try {
      const res = await fetch(`/api/lead-samples?lead_id=${encodeURIComponent(leadId)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        items?: Array<Partial<LeadSampleRecord>>;
      };
      if (!res.ok) {
        console.warn("[Lead Sample] server load failed", {
          lead_id: leadId,
          status: res.status,
          error: data.error || "unknown",
        });
        return;
      }
      const first = Array.isArray(data.items) ? data.items[0] : null;
      if (first) {
        const localTwin =
          fallback && String(fallback.id || "").trim() === String((first as Record<string, unknown>).id || "").trim()
            ? fallback
            : null;
        const normalized = normalizeLeadSampleRecord({
          ...(localTwin || {}),
          ...first,
          source: "server",
          isLocalOnly: false,
        });
        setSample(normalized);
        setSampleStorageSource("server");
        buildPreviewUrl(normalized);
        generateShareCopy(normalized);
        lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(normalized);
      }
    } catch {
      // local fallback already loaded when available
    } finally {
      setIsSampleLoading(false);
    }
  }

  useEffect(() => {
    setDraftSaveUi("idle");
    setLastDraftSavedAt(null);
    lastSavedDraftFingerprintRef.current = "";
    void loadLeadSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  useEffect(() => {
    if (!sampleBuilderOpen || isSampleLoading) return;
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const next = applyAutofill(base, "open_builder");
    setSampleAndRefresh(next);
    lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleBuilderOpen, isSampleLoading]);

  async function generateDraft() {
    console.info("[Action Debug] Generate Email clicked", { leadId });
    setIsGenerating(true);
    setError(null);
    setMessage(null);
    try {
      console.info("[Action Debug] Generate Email request started", { leadId });
      const res = await fetch("/api/scout/outreach/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          linked_opportunity_id: linkedOpportunityId,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as TemplateResponse & { error?: string };
      console.info("[Action Debug] Generate Email response", { leadId, status: res.status, body: data });
      if (!res.ok) throw new Error(data.error || "Could not generate outreach preview.");

      const fallback = fallbackDraft(initialBusinessName, initialIssue, {
        hasWebsite: hasWebsitePresence,
        hasScreenshot: false,
      });
      const nextSubject = fallback.subject;
      let nextBody =
        String(data.short_email || "").trim() ||
        String(data.longer_email || "").trim() ||
        String(data.follow_up_note || "").trim() ||
        fallback.body;
      if (
        quickFixSummary &&
        !/quick improvement idea|quick fix/i.test(nextBody)
      ) {
        nextBody = `${nextBody}\n\nI put together a quick improvement idea: ${quickFixSummary}`;
      }
      nextBody = sanitizeOutreachBody(nextBody, {
        hasWebsite: hasWebsitePresence,
        hasScreenshot: false,
      });

      setSubject(nextSubject);
      setBody(nextBody);
      setMessage("Outreach draft generated.");
      console.info("[Action Debug] Generate Email request succeeded", { leadId });
    } catch (e) {
      const fallback = fallbackDraft(initialBusinessName, initialIssue, {
        hasWebsite: hasWebsitePresence,
        hasScreenshot: false,
      });
      setSubject(fallback.subject);
      setBody(
        sanitizeOutreachBody(
          quickFixSummary
            ? `${fallback.body}\n\nI put together a quick improvement idea: ${quickFixSummary}`
            : fallback.body,
          {
            hasWebsite: hasWebsitePresence,
            hasScreenshot: false,
          }
        )
      );
      setError(e instanceof Error ? e.message : "Could not generate outreach draft.");
      console.error("[Action Debug] Generate Email request failed", {
        leadId,
        error: e instanceof Error ? e.message : "unknown",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function sendEmail() {
    console.info("[Action Debug] Send Email clicked", { leadId });
    if (!body.trim()) {
      setError("Draft body is empty.");
      return;
    }
    setIsSending(true);
    setError(null);
    setMessage(null);
    setOutreachEcho(null);
    const attemptAt = new Date().toISOString();
    try {
      console.info("[Action Debug] Send Email request started", { leadId });
      const res = await fetch("/api/scout/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          linked_opportunity_id: linkedOpportunityId,
          subject: subject.trim() || "quick question about your website",
          body: body.trim(),
          message_type: "short",
          preview_url: String(preparedPreviewUrl || previewUrl || "").trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      console.info("[Action Debug] Send Email response", { leadId, status: res.status, body: data });
      if (!res.ok) {
        const detail = data.error || "Could not send outreach email.";
        setError(`Email failed to send: ${detail}`);
        setOutreachEcho({ ok: false, channel: "email", at: attemptAt, error: detail });
        return;
      }
      const inferredStage = inferDealStageFromBodyText(body.trim());
      if (inferredStage) {
        const patchRes = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deal_stage: inferredStage }),
        });
        if (patchRes.ok) {
          setDealStage(inferredStage);
        }
      }
      setMessage("Email sent successfully.");
      setOutreachEcho({ ok: true, channel: "email", at: new Date().toISOString() });
      console.info("[Action Debug] Send Email request succeeded", { leadId });
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Could not send outreach email.";
      setError(`Email failed to send: ${detail}`);
      setOutreachEcho({ ok: false, channel: "email", at: attemptAt, error: detail });
      console.error("[Action Debug] Send Email request failed", {
        leadId,
        error: e instanceof Error ? e.message : "unknown",
      });
    } finally {
      setIsSending(false);
    }
  }

  async function sendPreviewEmail() {
    console.info("[Action Debug] Send Preview Email clicked", { leadId });
    setIsSendingPreview(true);
    setError(null);
    setMessage(null);
    setOutreachEcho(null);
    const attemptAt = new Date().toISOString();
    try {
      console.info("[Action Debug] Send Preview Email request started", { leadId });
      const res = await fetch("/api/scout/outreach/send-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          linked_opportunity_id: linkedOpportunityId,
          business_name: initialBusinessName,
          category: initialCategory,
          email: initialEmail,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        preview_url?: string;
        message?: string;
      };
      console.info("[Action Debug] Send Preview Email response", { leadId, status: res.status, body: data });
      if (!res.ok) {
        const detail = data.error || "Could not send preview email.";
        setError(`Email failed to send: ${detail}`);
        setOutreachEcho({ ok: false, channel: "preview_email", at: attemptAt, error: detail });
        return;
      }
      if (data.preview_url) setPreviewUrl(data.preview_url);
      setMessage(data.message || "Preview email sent successfully.");
      setOutreachEcho({ ok: true, channel: "preview_email", at: new Date().toISOString() });
      console.info("[Action Debug] Send Preview Email request succeeded", { leadId });
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Could not send preview email.";
      setError(`Email failed to send: ${detail}`);
      setOutreachEcho({ ok: false, channel: "preview_email", at: attemptAt, error: detail });
      console.error("[Action Debug] Send Preview Email request failed", {
        leadId,
        error: e instanceof Error ? e.message : "unknown",
      });
    } finally {
      setIsSendingPreview(false);
    }
  }

  async function updateLead(payload: Record<string, unknown>, successMessage: string): Promise<boolean> {
    console.info("[Action Debug] Lead status action clicked", { leadId, payload });
    setIsUpdating(true);
    setError(null);
    setMessage(null);
    try {
      console.info("[Action Debug] Lead status request started", { leadId, payload });
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      console.info("[Action Debug] Lead status response", { leadId, status: res.status, body: data });
      if (!res.ok) throw new Error(data.error || "Could not update lead.");
      setMessage(successMessage);
      console.info("[Action Debug] Lead status request succeeded", { leadId, payload });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update lead.");
      console.error("[Action Debug] Lead status request failed", {
        leadId,
        payload,
        error: e instanceof Error ? e.message : "unknown",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }

  async function createLeadLinkedEvent(eventType: "followup" | "client_call" | "reminder", title: string, daysOut = 1) {
    const start = new Date();
    start.setDate(start.getDate() + daysOut);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const isBlocking = eventType === "client_call";
    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        event_type: eventType,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: `Auto-created from lead ${leadId}.`,
        is_blocking: isBlocking,
        lead_id: leadId,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    console.info("[Action Debug] Calendar event response", { leadId, status: res.status, body, eventType });
    if (!res.ok) throw new Error(body.error || "Could not create calendar event.");
  }

  async function markContactedWithFollowUp() {
    const next = addBusinessDaysIso(new Date(), 3);
    const ok = await updateLead(
      { status: "contacted", next_follow_up_at: next, automation_paused: false },
      "Marked contacted — follow-up date set."
    );
    if (!ok) return;
    try {
      await createLeadLinkedEvent("followup", `Follow up: ${initialBusinessName || "Lead"}`, 1);
      setMessage("Marked contacted and calendar reminder added.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create follow-up event.");
    }
    void fetch("/api/crm/automation-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, event_type: "mark_contacted", payload: {} }),
    }).catch(() => {});
  }

  async function postSendScheduleFollowUp() {
    const ok = await updateLead(
      {
        next_follow_up_at: new Date(Date.now() + 2 * 86400000).toISOString(),
        follow_up_status: "pending",
      },
      "Follow-up scheduled."
    );
    if (!ok) return;
    try {
      await createLeadLinkedEvent("followup", `Follow up: ${initialBusinessName || "Lead"}`, 2);
    } catch {
      void 0;
    }
  }

  async function postSendMarkReplied() {
    const already =
      String(initialStatus || "")
        .trim()
        .toLowerCase() === "replied";
    await updateLead(
      buildMarkLeadRepliedPatch({
        currentUnread: initialUnreadReplyCount,
        alreadyReplied: already,
      }),
      "Lead marked as replied."
    );
  }

  async function postSendArchive() {
    await updateLead(
      { status: "lost", automation_paused: true, sequence_active: false },
      "Closed and follow-ups paused."
    );
  }

  async function markRepliedWithReminder() {
    const already =
      String(initialStatus || "")
        .trim()
        .toLowerCase() === "replied";
    const ok = await updateLead(
      buildMarkLeadRepliedPatch({
        currentUnread: initialUnreadReplyCount,
        alreadyReplied: already,
      }),
      "Lead marked replied."
    );
    if (!ok) return;
    try {
      await createLeadLinkedEvent("reminder", `Reply to lead: ${initialBusinessName || "Lead"}`, 0);
      setMessage("Lead marked replied and calendar reminder added.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create reply reminder.");
    }
  }

  async function scheduleClientCall() {
    try {
      await createLeadLinkedEvent("client_call", `Client call: ${initialBusinessName || "Lead"}`, 1);
      setMessage("Client call event created and linked to lead.");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not schedule client call.");
    }
  }

  async function updateDealStatus(nextStatus: "interested" | "proposal_sent" | "won" | "lost") {
    const nowIso = new Date().toISOString();
    if (nextStatus === "won") {
      const pricing = beginnerPricingSuggestion(initialCategory);
      const input = window.prompt(
        `Deal value for ${initialBusinessName || "this lead"}\nSuggested: ${pricing.label}`,
        String(pricing.midpoint)
      );
      const parsed = Number(input || "");
      const wantsRecurring = window.confirm(
        "Offer hosting/maintenance plan now? Click OK for yes, Cancel for no."
      );
      const recurringDefault = "20";
      const recurringInput = wantsRecurring
        ? window.prompt("Monthly plan amount ($15-$30 recommended)", recurringDefault)
        : null;
      const recurringParsed = Number(recurringInput || "");
      const ok = await updateLead(
        {
          deal_status: "won",
          deal_stage: "won",
          deal_value: Number.isFinite(parsed) && parsed > 0 ? parsed : pricing.midpoint,
          closed_at: nowIso,
          status: "won",
          automation_paused: true,
          sequence_active: false,
          is_recurring_client: wantsRecurring,
          monthly_value:
            wantsRecurring && Number.isFinite(recurringParsed) && recurringParsed > 0
              ? recurringParsed
              : wantsRecurring
                ? 20
                : null,
          subscription_started_at: wantsRecurring ? nowIso : null,
        },
        wantsRecurring
          ? "Deal marked won and recurring plan started."
          : "Deal marked won."
      );
      if (ok) setDealStage("won");
      return;
    }
    if (nextStatus === "lost") {
      const ok = await updateLead(
        {
          deal_status: "lost",
          deal_stage: "new",
          closed_at: nowIso,
          status: "lost",
          automation_paused: true,
          sequence_active: false,
        },
        "Deal marked lost."
      );
      if (ok) setDealStage("new");
      return;
    }
    const mappedStage = nextStatus === "interested" ? "interested" : "pricing";
    const ok = await updateLead(
      { deal_status: nextStatus, deal_stage: nextStatus === "interested" ? "interested" : "pricing", status: "contacted" },
      nextStatus === "interested" ? "Deal marked interested." : "Proposal marked sent."
    );
    if (ok) setDealStage(mappedStage);
  }

  async function updateDoorStatus(nextDoorStatus: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost") {
    const statusPatch: Record<string, unknown> =
      nextDoorStatus === "closed_won"
        ? { status: "won", automation_paused: true, sequence_active: false }
        : nextDoorStatus === "closed_lost"
          ? { status: "lost", automation_paused: true, sequence_active: false }
          : nextDoorStatus === "follow_up"
            ? { status: "contacted" }
            : {};
    const ok = await updateLead(
      { door_status: nextDoorStatus, ...statusPatch },
      `Door status updated to ${nextDoorStatus.replace(/_/g, " ")}.`
    );
    if (ok) setDoorStatus(nextDoorStatus);
  }

  async function saveRealWorldPlan() {
    await updateLead(
      {
        real_world_why_target: realWorldWhyTarget.trim() || null,
        real_world_walk_in_pitch: realWorldWalkInPitch.trim() || null,
        best_time_to_visit: bestTimeToVisit.trim() || null,
      },
      "Real World Plan saved."
    );
  }

  async function copyEmail() {
    if (!body.trim()) {
      setError("Generate a draft first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `Subject: ${subject.trim() || "quick question about your website"}\n\n${body.trim()}`
      );
      setMessage("Email copied to clipboard.");
      setError(null);
    } catch {
      setError("Clipboard copy failed.");
    }
  }

  function generateProposal() {
    const pricing = beginnerPricingSuggestion(initialCategory);
    const proposal = [
      `Proposal for ${initialBusinessName || "your business"}`,
      "",
      "What I will improve:",
      `- Build a clean, mobile-friendly ${initialCategory || "business"} website`,
      `- Fix this key issue: ${initialIssue || "make it easier for customers to contact you"}`,
      quickFixSummary ? `- Priority fix: ${quickFixSummary}` : "- Improve key website issue found in review",
      "- Add clear calls-to-action for calls/quotes",
      "- Improve speed and layout so visitors stay and convert",
      "",
      "Timeline:",
      "- First version in 3-5 days",
      "- Revisions included",
      "",
      "Beginner-friendly investment:",
      `- ${pricing.label}`,
      "",
      "Next step:",
      "Reply with 'yes' and I will send a quick kickoff checklist.",
      "",
      "- Topher",
      "Topher's Web Design",
    ].join("\n");
    setProposalText(proposal);
    setMessage("Proposal generated.");
    setError(null);
  }

  async function copyProposal() {
    if (!proposalText.trim()) {
      setError("Generate a proposal first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(proposalText.trim());
      setMessage("Proposal copied to clipboard.");
      setError(null);
    } catch {
      setError("Could not copy proposal.");
    }
  }

  async function markReferredClient() {
    const referredBy = window.prompt("Referred by (lead id or name)", "");
    const referralSource = window.prompt("Referral source (client referral, church network, etc.)", "client referral");
    await updateLead(
      {
        is_referred_client: true,
        referred_by: String(referredBy || "").trim() || undefined,
        referral_source: String(referralSource || "").trim() || "client referral",
      },
      "Lead marked as referred client."
    );
  }

  async function copyNumber() {
    const next = String(initialPhone || "").trim();
    if (!next) {
      setError("No phone number on this lead.");
      return;
    }
    try {
      await navigator.clipboard.writeText(next);
      setMessage("Phone number copied.");
      setError(null);
    } catch {
      setError("Could not copy number.");
    }
  }

  async function copyTextScript() {
    try {
      await navigator.clipboard.writeText(
        buildLeadSmsBody({
          website: String(website || ""),
          lead_tags: undefined,
          has_website: null,
        })
      );
      setMessage("Text script copied.");
      setError(null);
    } catch {
      setError("Could not copy text script.");
    }
  }

  async function addNote() {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    const merged = [...savedNotes, trimmed].join("\n");
    await updateLead({ notes: merged }, "Note saved.");
    setSavedNotes((prev) => [...prev, trimmed]);
    setNoteDraft("");
  }

  function hasDataUrlImage(nextSample: LeadSampleRecord | null | undefined): boolean {
    if (!nextSample) return false;
    const imageFields = [
      String(nextSample.primary_image_url || "").trim(),
      ...nextSample.additional_image_urls,
      ...nextSample.image_urls,
      ...nextSample.gallery_image_urls,
      ...nextSample.images.map((entry) => String(entry.src || "").trim()),
    ];
    return imageFields.some((value) => value.startsWith("data:image/"));
  }

  function logPreviewLinkDiagnostics(url: string, nextSample: LeadSampleRecord | null | undefined) {
    const hasDataImage = hasDataUrlImage(nextSample);
    const hasImageDataInQuery =
      url.includes("hero_image=data%3Aimage") ||
      url.includes("image_urls=data%3Aimage") ||
      url.includes("data:image/");
    console.info("[Lead Sample Preview] preview URL built", {
      lead_id: leadId,
      sample_id: String(nextSample?.id || "").trim() || null,
      preview_url: url,
      url_length: url.length,
      has_query: url.includes("?"),
      has_image_data_in_query: hasImageDataInQuery,
      contains_data_url_image: hasDataImage,
    });
  }

  function buildPreviewUrl(overrideSample?: LeadSampleRecord | null) {
    if (typeof window === "undefined") return "";
    const activeSample = overrideSample || sample;
    const sampleId = String(activeSample?.id || "").trim();
    if (!sampleId) return "";
    const generated = buildSamplePreviewLink(sampleId);
    setPreviewUrl(generated);
    logPreviewLinkDiagnostics(generated, activeSample || null);
    return generated;
  }

  async function ensurePersistedSampleForPreview(nextSample: LeadSampleRecord): Promise<LeadSampleRecord> {
    console.info("[Lead Sample Preview] sample save started", {
      lead_id: leadId,
      sample_id: nextSample.id,
      source: nextSample.source,
      is_local_only: nextSample.isLocalOnly,
    });
    const saved = await persistSample(
      normalizeLeadSampleRecord({
        ...nextSample,
        updated_at: new Date().toISOString(),
      })
    );
    lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(saved);
    console.info("[Lead Sample Preview] sample saved", {
      lead_id: leadId,
      sample_id: saved.id,
      storage: saved.isLocalOnly ? "local_draft" : "backend",
      image_storage_mode: hasDataUrlImage(saved) ? "local_draft_data_url" : "url_or_storage_path",
    });
    return saved;
  }

  async function copyPreviewUrl() {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const saved = await ensurePersistedSampleForPreview(base);
    setSampleAndRefresh(saved);
    const url = buildPreviewUrl(saved);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Preview URL copied.");
      setError(null);
    } catch {
      setError("Could not copy preview URL.");
    }
  }

  async function persistSampleRecord(
    nextSample: LeadSampleRecord,
    options?: { silent?: boolean }
  ): Promise<{ record: LeadSampleRecord; backendOk: boolean }> {
    const payload = normalizeLeadSampleRecord({
      ...nextSample,
      updated_at: new Date().toISOString(),
    });
    try {
      const res = await fetch("/api/lead-samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) throw new Error(String(data.error || "Could not save to backend."));
      const serverSaved = normalizeLeadSampleRecord({
        ...payload,
        ...data,
        source: "server",
        isLocalOnly: false,
      });
      upsertLocalSample(serverSaved);
      setSampleStorageSource("server");
      return { record: serverSaved, backendOk: true };
    } catch (e) {
      const localSaved = normalizeLeadSampleRecord({ ...payload, source: "local", isLocalOnly: true });
      upsertLocalSample(localSaved);
      setSampleStorageSource("local");
      if (!options?.silent) {
        setError(
          `Saved locally. Backend save failed: ${e instanceof Error ? e.message : "unknown error"}`
        );
      }
      return { record: localSaved, backendOk: false };
    }
  }

  async function persistSample(nextSample: LeadSampleRecord): Promise<LeadSampleRecord> {
    const { record } = await persistSampleRecord(nextSample);
    return record;
  }

  async function handleSaveSampleDraft() {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    setDraftSaveUi("saving");
    setError(null);
    const { record, backendOk } = await persistSampleRecord(
      normalizeLeadSampleRecord({ ...base, updated_at: new Date().toISOString() }),
      { silent: true }
    );
    setSampleAndRefresh(record);
    lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(record);
    setLastDraftSavedAt(new Date().toISOString());
    setDraftSaveUi(backendOk ? "saved" : "saved_local");
    setMessage(backendOk ? "Draft saved to backend." : "Draft saved locally (backend unavailable).");
  }

  useEffect(() => {
    if (!sampleBuilderOpen || isSampleLoading || !sample) return;
    const fp = sampleDraftFingerprint(sample);
    if (fp === lastSavedDraftFingerprintRef.current) return;
    const timer = window.setTimeout(() => {
      if (Date.now() < skipAutosaveUntilRef.current) return;
      const latest = sampleLatestRef.current;
      if (!latest) return;
      const latestFp = sampleDraftFingerprint(latest);
      if (latestFp === lastSavedDraftFingerprintRef.current) return;
      void (async () => {
        setDraftSaveUi("saving");
        const { record, backendOk } = await persistSampleRecord(
          normalizeLeadSampleRecord({ ...latest, updated_at: new Date().toISOString() }),
          { silent: true }
        );
        lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(record);
        setSampleAndRefresh(record);
        setLastDraftSavedAt(new Date().toISOString());
        setDraftSaveUi(backendOk ? "saved" : "saved_local");
      })();
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [sample, sampleBuilderOpen, isSampleLoading]);

  async function createOrOpenSample() {
    setError(null);
    setMessage(null);
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const prefilled = applyAutofill(base, "first_generate");
    const saved = await persistSample(prefilled);
    setSampleAndRefresh(saved);
    lastSavedDraftFingerprintRef.current = sampleDraftFingerprint(saved);
    setLastDraftSavedAt(new Date().toISOString());
    setDraftSaveUi(saved.isLocalOnly ? "saved_local" : "saved");
    setMessage(saved.isLocalOnly ? "Sample saved locally." : "Sample saved to backend.");
    setSampleBuilderOpen(true);
  }

  async function updateSampleField<K extends keyof LeadSampleRecord>(field: K, value: LeadSampleRecord[K]) {
    const base = sample || buildDefaultLeadSample({ leadId, businessName: initialBusinessName, businessType: initialCategory, note: initialIssue });
    let next = normalizeLeadSampleRecord({
      ...base,
      [field]: value,
      lead_id: leadId,
      business_name: base.business_name || initialBusinessName || "Business Name",
      business_type: base.business_type || initialCategory || "service business",
      updated_at: new Date().toISOString(),
    });
    if (field === "site_goal") {
      const pair = pickCtaPairFromSiteGoal(String(value));
      next = normalizeLeadSampleRecord({
        ...next,
        cta_style: pair.cta_style,
        cta_text: pair.cta_text,
      });
    }
    const shouldDerive = [
      "business_type",
      "headline_style",
      "cta_style",
      "visual_theme",
      "template_type",
      "site_goal",
    ].includes(String(field));
    setSampleAndRefresh(shouldDerive ? applySelectionDerivations(next) : next);
  }

  async function updateServiceSelection(service: string, selected: boolean) {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const current = Array.isArray(base.services) ? base.services : [];
    const nextServices = selected
      ? Array.from(new Set([...current, service])).slice(0, 8)
      : current.filter((entry) => entry !== service);
    const next = normalizeLeadSampleRecord({
      ...base,
      services: nextServices,
      updated_at: new Date().toISOString(),
    });
    setSampleAndRefresh(next);
  }

  async function useFacebookOrWebsiteImage() {
    const preferred = String(facebookUrl || "").trim() || String(website || "").trim();
    if (!preferred) {
      setError("No Facebook or website URL found on this lead. Paste an image URL or upload an image.");
      return;
    }
    setPastedImageUrl(preferred);
    setMessage("URL added to image input. Paste a direct image URL if needed.");
    if (looksLikeImageUrl(preferred)) {
      await addImageFromUrl();
    }
  }

  function regenerateSampleImages() {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const { sample: withImages, poolKey } = applyRandomImagesToSample(base, initialCategory || base.business_type, {
      force: true,
      minAdditional: 2,
      maxAdditional: 4,
    });
    setSampleAndRefresh(withImages);
    if (process.env.NODE_ENV !== "production") {
      console.info("[Lead Sample Autofill]", {
        lead_id: leadId,
        trigger: "regenerate_images",
        filled_fields: ["primary_image_url", "additional_image_urls"],
        sources: {
          primary_image_url: `image_pool:${poolKey}`,
          additional_image_urls: `image_pool:${poolKey}`,
        },
      });
    }
    setMessage("Images regenerated.");
    setError(null);
  }

  function useSuggestedStockImages() {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const { sample: withImages } = applyRandomImagesToSample(base, initialCategory || base.business_type, {
      force: false,
      minAdditional: 2,
      maxAdditional: 4,
    });
    setSampleAndRefresh(withImages);
    setMessage("Suggested stock images applied.");
    setError(null);
  }

  function sampleHasHeroImage(nextSample: LeadSampleRecord | null | undefined): boolean {
    if (!nextSample) return false;
    const heroByRole = Array.isArray(nextSample.images)
      ? nextSample.images.some((entry) => entry.role === "hero" && String(entry.src || "").trim())
      : false;
    const heroByField = Boolean(String(nextSample.primary_image_url || "").trim());
    return heroByRole || heroByField;
  }

  async function openGeneratedPreview(nextSample: LeadSampleRecord) {
    const saved = await ensurePersistedSampleForPreview(nextSample);
    setSampleAndRefresh(saved);
    const url = buildPreviewUrl(saved);
    if (!sampleHasHeroImage(saved)) {
      setMessage("Add an image to generate a strong preview.");
    }
    if (url && typeof window !== "undefined") {
      console.info("[Lead Sample Preview] opening preview URL", {
        lead_id: leadId,
        sample_id: saved.id,
        preview_url: url,
        url_length: url.length,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function imageSourceRank(source: LeadSampleImage["source"]): number {
    if (source === "upload") return 0;
    if (source === "url") return 1;
    return 2;
  }

  function enforceHeroImagePriority(nextSample: LeadSampleRecord): LeadSampleRecord {
    const images = Array.isArray(nextSample.images) ? [...nextSample.images] : [];
    if (!images.length) return nextSample;
    const explicitHero = images.find((entry) => entry.role === "hero");
    if (explicitHero) return nextSample;
    const sorted = [...images].sort((a, b) => imageSourceRank(a.source) - imageSourceRank(b.source));
    const bestId = sorted[0]?.id;
    if (!bestId) return nextSample;
    const nextImages = images.map((entry) => ({
      ...entry,
      role: entry.id === bestId ? "hero" : "gallery",
    })) as LeadSampleImage[];
    return normalizeLeadSampleRecord({
      ...nextSample,
      images: nextImages,
      ...deriveImageFieldsFromImages(nextImages),
    });
  }

  function buildPreparedOutreachMessage(previewLink: string): { subject: string; body: string } {
    const hasWebsite = Boolean(String(website || "").trim());
    const hasFacebook = Boolean(String(facebookUrl || "").trim());
    const business = String(initialBusinessName || "your business").trim();
    const issue = String(initialIssue || "a few opportunities").trim();
    if (!hasWebsite) {
      if (hasFacebook) {
        return {
          subject: `Quick sample for ${business}`,
          body: [
            `Hey ${business},`,
            "",
            "I came across your business and put together a quick sample showing what your website could look like:",
            previewLink,
            "",
            "Totally optional, but if you want I can build this out quickly and keep it simple.",
            "",
            "- Topher",
          ].join("\n"),
        };
      }
      return {
        subject: `Quick website idea for ${business}`,
        body: [
          `Hi ${business},`,
          "",
          "I came across your business and put together a quick sample showing what your website could look like:",
          previewLink,
          "",
          "This is just a quick mockup to make it easier for customers to find you, trust you, and reach out.",
          "",
          "- Topher",
        ].join("\n"),
      };
    }
    return {
      subject: `Quick idea for ${business}'s website`,
      body: [
        `Hi ${business},`,
        "",
        `I was looking at your website and noticed ${issue}.`,
        "I put together a quick sample showing an updated version here:",
        previewLink,
        "",
        "If you want, I can build this out into a live site quickly.",
        "",
        "- Topher",
      ].join("\n"),
    };
  }

  async function generateAndPrepareSend() {
    setIsPreparingSend(true);
    setError(null);
    setMessage(null);
    try {
      const base =
        sample ||
        buildDefaultLeadSample({
          leadId,
          businessName: initialBusinessName,
          businessType: initialCategory,
          note: initialIssue,
        });
      const prefilled = applySelectionDerivations(applyAutofill(base, "first_generate"));
      const withImage =
        sampleHasHeroImage(prefilled)
          ? prefilled
          : applyRandomImagesToSample(prefilled, initialCategory || prefilled.business_type, {
              force: false,
              minAdditional: 2,
              maxAdditional: 4,
            }).sample;
      const prioritized = enforceHeroImagePriority(withImage);
      const saved = await persistSample(
        normalizeLeadSampleRecord({
          ...prioritized,
          status: "ready",
        })
      );
      setSampleAndRefresh(saved);
      setSampleBuilderOpen(true);
      const finalPreviewUrl = buildPreviewUrl(saved);
      const finalLink = finalPreviewUrl || buildSamplePreviewLink(saved.id);
      setPreparedPreviewUrl(finalLink);
      const outreach = buildPreparedOutreachMessage(finalLink);
      setSubject(outreach.subject);
      setBody(outreach.body);
      setGeneratedSampleEmail(`Subject: ${outreach.subject}\n\n${outreach.body}`);
      setGeneratedSampleText(outreach.body);
      writePreparedOutreachDraft({
        leadId,
        subject: outreach.subject,
        body: outreach.body,
        previewUrl: finalLink,
        updatedAt: new Date().toISOString(),
      });
      setIsPreparedReady(true);
      setMessage("Preview and outreach message are ready to review.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate and prepare send.");
    } finally {
      setIsPreparingSend(false);
    }
  }

  function quickGenerateWithDefaults() {
    const base =
      sample ||
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      });
    const prefilled = applyAutofill(base, "first_generate");
    const withImage = sampleHasHeroImage(prefilled)
      ? prefilled
      : applyRandomImagesToSample(prefilled, initialCategory || prefilled.business_type, {
          force: false,
          minAdditional: 2,
          maxAdditional: 4,
        }).sample;
    setSampleAndRefresh(withImage);
    setSampleBuilderOpen(true);
    setError(null);
    void openGeneratedPreview(withImage);
  }

  function removeAdditionalImage(index: number) {
    if (!sample) return;
    const galleryImages = sample.images.filter((entry) => entry.role === "gallery");
    const target = galleryImages[index];
    if (!target) return;
    const nextImages = sample.images.filter((entry) => entry.id !== target.id);
    updateSampleImages(nextImages);
  }

  function replaceAdditionalImage(index: number, nextUrl: string) {
    if (!sample) return;
    const galleryImages = sample.images.filter((entry) => entry.role === "gallery");
    const target = galleryImages[index];
    if (!target) return;
    const trimmed = String(nextUrl || "").trim();
    const nextImages = sample.images.map((entry) =>
      entry.id === target.id ? { ...entry, src: trimmed } : entry
    );
    updateSampleImages(nextImages);
  }

  function setImageAsHero(imageId: string) {
    if (!sample) return;
    const nextImages: LeadSampleImage[] = sample.images.map((entry) => ({
      ...entry,
      role: (entry.id === imageId ? "hero" : "gallery") as "hero" | "gallery",
    }));
    updateSampleImages(nextImages);
  }

  function setImageAsGallery(imageId: string) {
    if (!sample) return;
    const current = sample.images.find((entry) => entry.id === imageId);
    if (!current) return;
    const others = sample.images.filter((entry) => entry.id !== imageId);
    if (current.role === "hero" && others.length === 0) {
      setError("At least one image must remain the hero.");
      return;
    }
    const nextImages: LeadSampleImage[] = sample.images.map((entry) =>
      entry.id === imageId
        ? { ...entry, role: "gallery" as const }
        : current.role === "hero" && entry.id === others[0]?.id
          ? { ...entry, role: "hero" as const }
          : entry
    );
    updateSampleImages(nextImages);
  }

  function removeImage(imageId: string) {
    if (!sample) return;
    const target = sample.images.find((entry) => entry.id === imageId);
    if (!target) return;
    const nextImages = sample.images.filter((entry) => entry.id !== imageId);
    if (!nextImages.length) {
      updateSampleImages([]);
      return;
    }
    if (target.role === "hero" && !nextImages.some((entry) => entry.role === "hero")) {
      nextImages[0] = { ...nextImages[0], role: "hero" };
    }
    updateSampleImages(nextImages);
  }

  async function saveSampleStatus(nextStatus: LeadSampleStatus) {
    if (!sample) {
      setError("Build a sample first.");
      return;
    }
    const next = normalizeLeadSampleRecord({ ...sample, status: nextStatus, updated_at: new Date().toISOString() });
    const saved = await persistSample(next);
    setSample(saved);
    buildPreviewUrl(saved);
    generateShareCopy(saved);
    setMessage(`Sample marked ${nextStatus}.`);
  }

  async function copySamplePreviewLink() {
    if (!sample) {
      setError("Build a sample first.");
      return;
    }
    const link = buildSamplePreviewLink(sample.id);
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Sample preview link copied.");
      if (sample.status === "draft") {
        await saveSampleStatus("ready");
      }
    } catch {
      setError("Could not copy sample preview link.");
    }
  }

  async function copySampleEmail() {
    if (!generatedSampleEmail.trim()) {
      setError("Build a sample first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedSampleEmail);
      setMessage("Sample email copy copied.");
    } catch {
      setError("Could not copy sample email.");
    }
  }

  async function copySampleText() {
    if (!generatedSampleText.trim()) {
      setError("Build a sample first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedSampleText);
      setMessage("Sample text copy copied.");
    } catch {
      setError("Could not copy sample text.");
    }
  }

  function quickReplyOptions(): QuickReplyTemplate[] {
    return [...QUICK_REPLIES, ...customQuickReplies];
  }

  function applyQuickReply(replyId: string) {
    const id = String(replyId || "").trim();
    if (!id) return;
    const selected = quickReplyOptions().find((entry) => entry.id === id);
    if (!selected) return;
    setSelectedQuickReplyId(id);
    setBody((prev) => {
      if (quickReplyMode === "append" && String(prev || "").trim()) {
        return `${String(prev).trim()}\n\n${selected.message}`;
      }
      return selected.message;
    });
    setMessage("Quick reply inserted.");
    setError(null);
  }

  function closingReplyById(replyId: string): ClosingReplyTemplate | null {
    return CLOSING_REPLIES.find((entry) => entry.id === replyId) || null;
  }

  function applyClosingReply(replyId: string) {
    const selected = closingReplyById(String(replyId || "").trim());
    if (!selected) return;
    setSelectedClosingReplyId(selected.id);
    setBody((prev) => {
      if (quickReplyMode === "append" && String(prev || "").trim()) {
        return `${String(prev).trim()}\n\n${selected.message}`;
      }
      return selected.message;
    });
    setMessage(`Closing reply inserted (${selected.label}).`);
    setError(null);
  }

  function recommendedClosingAction(currentStage: DealStage): string {
    if (currentStage === "new") return "Send INTEREST reply";
    if (currentStage === "interested") return "Send PRICING reply";
    if (currentStage === "pricing") return "Send CLOSING reply";
    if (currentStage === "closing") return "Send LOCK IN reply";
    return "Collect payment / kickoff details";
  }

  function inferDealStageFromBodyText(text: string): DealStage | null {
    const normalized = String(text || "").toLowerCase();
    if (!normalized) return null;
    if (normalized.includes("best way to reach you") || normalized.includes("text or call")) return "won";
    if (normalized.includes("i just need a couple details") || normalized.includes("start putting it together")) return "closing";
    if (
      normalized.includes("$400") ||
      normalized.includes("$900") ||
      normalized.includes("most sites like that") ||
      normalized.includes("starter setup") ||
      normalized.includes("business setup") ||
      normalized.includes("pricing")
    ) {
      return "pricing";
    }
    if (normalized.includes("glad you like it") || normalized.includes("show you how it would work")) return "interested";
    return null;
  }

  function saveCurrentAsQuickReply() {
    const current = String(body || "").trim();
    if (!current) {
      setError("Write or insert a message first.");
      return;
    }
    const label = String(window.prompt("Template label", "Custom Reply") || "").trim();
    if (!label) return;
    const nextTemplate: QuickReplyTemplate = {
      id: `custom-${Date.now()}`,
      label,
      message: current,
      isCustom: true,
    };
    const next = [...customQuickReplies, nextTemplate];
    setCustomQuickReplies(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(QUICK_REPLY_STORAGE_KEY, JSON.stringify(next));
    }
    setMessage("Saved custom quick reply.");
    setError(null);
  }

  const sampleForUi =
    sample ||
    applyAutofill(
      buildDefaultLeadSample({
        leadId,
        businessName: initialBusinessName,
        businessType: initialCategory,
        note: initialIssue,
      }),
      "open_builder"
    );
  const suggestedBusinessType = sampleForUi.business_type || readableBusinessType(initialCategory || "service business");
  const suggestedServices = getSuggestedServicesForBusinessType(suggestedBusinessType);
  const isLikelyFacebookOnly = !String(website || "").trim();
  const selectedClosingTemplate = closingReplyById(selectedClosingReplyId);

  return (
    <aside className="space-y-3 sticky top-4">
      <div className="admin-card space-y-3">
        <h3 className="text-sm font-semibold">Lead Sample Generator</h3>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Status: <strong>{sample?.status || "none"}</strong>
          {sampleStorageSource ? ` - ${sampleStorageSource === "server" ? "Backend" : "Local only"}` : ""}
        </p>
        {sampleStorageSource === "local" ? (
          <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
            Local-only sample is usable for building previews. Send/email actions work best after backend save succeeds.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {!sample ? (
            <button className="admin-btn-primary text-xs" onClick={() => void createOrOpenSample()} disabled={isSampleLoading}>
              {isSampleLoading ? "Loading..." : "Generate Sample"}
            </button>
          ) : (
            <>
              <button className="admin-btn-primary text-xs" onClick={() => setSampleBuilderOpen((prev) => !prev)}>
                {sampleBuilderOpen ? "Hide Builder" : "Open Sample"}
              </button>
              <a href={buildSamplePreviewLink(sample.id)} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs">
                Open Preview
              </a>
            </>
          )}
          {sample ? (
            <>
              <button className="admin-btn-ghost text-xs" onClick={() => void copySamplePreviewLink()}>
                Copy Preview Link
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void copySampleEmail()}>
                Copy Email
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void copySampleText()}>
                Copy Text
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void saveSampleStatus("sent")}>
                Mark Sent
              </button>
            </>
          ) : null}
        </div>
        {sampleBuilderOpen ? (
          <div className="space-y-3">
            <div className="rounded border p-2" style={{ borderColor: "var(--admin-border)", background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs font-semibold">Sample Builder</p>
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Build the sample here, then use Generate Preview to open it.
              </p>
              <p className="text-xs font-semibold mt-2">Section 1: Business Summary</p>
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                {sampleForUi.business_name || initialBusinessName} - {sampleForUi.business_type || suggestedBusinessType}
              </p>
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Suggested defaults: CTA {sampleForUi.cta_style} - Theme {sampleForUi.visual_theme} - Template {sampleForUi.template_type}
              </p>
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Typical time: 30-60 seconds.
              </p>
            </div>

            <div className="space-y-2 rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
                Step 1: Choose Main Image
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="admin-btn-primary text-xs cursor-pointer">
                  {isUploadingImage ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void handleUploadImages(e.target.files)}
                    disabled={isUploadingImage}
                  />
                </label>
                <button className="admin-btn-ghost text-xs" onClick={() => useSuggestedStockImages()}>
                  Use Suggested Images
                </button>
                <button className="admin-btn-ghost text-xs" onClick={() => void useFacebookOrWebsiteImage()}>
                  Use Facebook / Website Image
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  className="admin-input h-9"
                  value={pastedImageUrl}
                  onChange={(e) => setPastedImageUrl(e.target.value)}
                  placeholder="Paste image URL"
                />
                <button className="admin-btn-ghost text-xs" onClick={() => void addImageFromUrl()} disabled={isAddingImageUrl}>
                  {isAddingImageUrl ? "Adding..." : "Paste Image URL"}
                </button>
              </div>
              {!sampleHasHeroImage(sampleForUi) ? (
                <p className="text-xs" style={{ color: "#fbbf24" }}>
                  Add an image to generate a strong preview.
                </p>
              ) : null}
              {sample?.images?.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {sample.images.map((image) => {
                    const isHero = image.role === "hero";
                    return (
                      <div
                        key={image.id}
                        className="rounded border p-1"
                        style={{ borderColor: isHero ? "var(--admin-gold)" : "var(--admin-border)" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.src} alt={image.label || "Sample image"} style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 6 }} />
                        <div className="mt-1 flex flex-wrap gap-1">
                          <button className="admin-btn-ghost text-[11px] px-2 py-1" onClick={() => setImageAsHero(image.id)}>
                            Set Hero
                          </button>
                          <button className="admin-btn-ghost text-[11px] px-2 py-1" onClick={() => removeImage(image.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Section 3: Optional Text Tweaks - Headline
              <input
                className="admin-input mt-1 h-9"
                value={sampleForUi.hero_headline || ""}
                onChange={(e) => void updateSampleField("hero_headline", e.target.value)}
              />
            </label>

            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Subheadline (prefilled)
              <textarea
                className="admin-input mt-1 min-h-[70px]"
                value={sampleForUi.hero_subheadline || ""}
                onChange={(e) => void updateSampleField("hero_subheadline", e.target.value)}
              />
            </label>

            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Local trust line (auto — shows as local positioning on the sample)
              <textarea
                className="admin-input mt-1 min-h-[56px]"
                value={sampleForUi.intro_text || ""}
                onChange={(e) => void updateSampleField("intro_text", e.target.value)}
              />
            </label>

            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Step 3: Services (auto)
              <textarea
                className="admin-input mt-1 min-h-[90px]"
                value={sampleForUi.services.join("\n") || ""}
                onChange={(e) =>
                  void updateSampleField(
                    "services",
                    e.target.value
                      .split(/\n|,/g)
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .slice(0, 6)
                  )
                }
              />
            </label>

            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              CTA
              <select
                className="admin-input mt-1 h-9"
                value={sampleForUi.cta_style}
                onChange={(e) => void updateSampleField("cta_style", e.target.value)}
              >
                {CTA_STYLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div
              className="rounded border p-2 space-y-2"
              style={{ borderColor: "var(--admin-border)", background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
                Save &amp; preview
              </p>
              <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
                Headline, subheadline, services, trust line, and CTA are auto-filled from the lead. Tweak below, then save
                or generate.
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  className="admin-btn-primary text-xs"
                  onClick={() => void handleSaveSampleDraft()}
                  disabled={draftSaveUi === "saving"}
                >
                  {draftSaveUi === "saving" ? "Saving..." : "Save Draft"}
                </button>
                <button type="button" className="admin-btn-ghost text-xs" onClick={() => resetToSuggestedDefaults()}>
                  Reset to Suggested
                </button>
                <button
                  type="button"
                  className="admin-btn-ghost text-xs"
                  onClick={() => void openGeneratedPreview(sampleForUi)}
                >
                  Generate Preview
                </button>
              </div>
              <p className="text-[11px] font-medium" style={{ color: "var(--admin-fg)" }}>
                {draftSaveUi === "saving"
                  ? "Saving..."
                  : draftSaveUi === "failed"
                    ? "Save failed — try again or check your connection."
                    : draftSaveUi === "saved"
                      ? `Draft saved · Last saved at ${lastDraftSavedAt ? new Date(lastDraftSavedAt).toLocaleString() : "—"}`
                      : draftSaveUi === "saved_local"
                        ? `Saved locally only · Last saved at ${lastDraftSavedAt ? new Date(lastDraftSavedAt).toLocaleString() : "—"} — backend save did not succeed.`
                        : lastDraftSavedAt
                          ? `Last saved at ${new Date(lastDraftSavedAt).toLocaleString()} — auto-save runs ~1.5s after you stop editing.`
                          : "Auto-save runs ~1.5s after you stop editing. Use Save Draft anytime."}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
                More actions
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="admin-btn-primary text-xs"
                  onClick={() => void generateAndPrepareSend()}
                  disabled={isPreparingSend}
                >
                  {isPreparingSend ? "Preparing..." : "Generate + Prepare Send"}
                </button>
                <button className="admin-btn-ghost text-xs" onClick={() => quickGenerateWithDefaults()}>
                  Generate Preview (Use Defaults)
                </button>
                <button className="admin-btn-ghost text-xs" onClick={() => void copyPreviewUrl()}>
                  Copy Preview Link
                </button>
                <button className="admin-btn-ghost text-xs" onClick={() => void copyEmail()}>
                  Copy Message
                </button>
              </div>
            </div>

            <details className="rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <summary className="cursor-pointer text-xs font-medium" style={{ color: "var(--admin-fg)" }}>
                Advanced options
              </summary>
              <div className="mt-2 space-y-2">
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    Business Name
                    <input
                      className="admin-input mt-1 h-9"
                      value={sampleForUi.business_name || initialBusinessName || ""}
                      onChange={(e) => void updateSampleField("business_name", e.target.value)}
                    />
                  </label>
                  <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    Business Type
                    <select
                      className="admin-input mt-1 h-9"
                      value={sampleForUi.business_type || "Small Business"}
                      onChange={(e) => void updateSampleField("business_type", e.target.value)}
                    >
                      {BUSINESS_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
                    Site Goal / Focus
                    <select
                      className="admin-input mt-1 h-9"
                      value={sampleForUi.site_goal}
                      onChange={(e) => void updateSampleField("site_goal", e.target.value)}
                    >
                      {SITE_GOAL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
                    Headline Style
                    <select
                      className="admin-input mt-1 h-9"
                      value={sampleForUi.headline_style}
                      onChange={(e) => void updateSampleField("headline_style", e.target.value)}
                    >
                      {HEADLINE_STYLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
                    Visual Style / Theme
                    <select
                      className="admin-input mt-1 h-9"
                      value={sampleForUi.visual_theme}
                      onChange={(e) => void updateSampleField("visual_theme", e.target.value)}
                    >
                      {VISUAL_THEME_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
                    Template Type
                    <select
                      className="admin-input mt-1 h-9"
                      value={sampleForUi.template_type}
                      onChange={(e) => void updateSampleField("template_type", e.target.value)}
                    >
                      {TEMPLATE_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="admin-btn-ghost text-xs" onClick={() => regenerateSampleCopy()}>
                    Regenerate Copy
                  </button>
                  <button className="admin-btn-ghost text-xs" onClick={() => regenerateSampleImages()}>
                    Regenerate Images
                  </button>
                  <button className="admin-btn-ghost text-xs" onClick={() => resetToSuggestedDefaults()}>
                    Reset to Suggested
                  </button>
                  <button className="admin-btn-ghost text-xs" onClick={() => void handleSaveSampleDraft()}>
                    Save Draft
                  </button>
                </div>
                {isLikelyFacebookOnly ? (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    Facebook-only flow detected: Upload Image or Paste Image URL is the fastest path.
                  </p>
                ) : null}
              </div>
            </details>

            {(isPreparedReady || preparedPreviewUrl || previewUrl) ? (
              <div className="rounded border p-2 space-y-2" style={{ borderColor: "var(--admin-border)", background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold">Section 5: Ready to Send</p>
                <div>
                  <p className="text-xs font-medium">Preview Ready</p>
                  <p className="text-xs break-all" style={{ color: "var(--admin-muted)" }}>
                    {preparedPreviewUrl || previewUrl || "No preview URL yet"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    Sample status: {sample?.status || "draft"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium">Message Ready</p>
                  <textarea
                    className="admin-input min-h-[120px]"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Generated outreach message appears here."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="admin-btn-primary text-xs"
                    onClick={() => {
                      const url = preparedPreviewUrl || previewUrl;
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Open Preview
                  </button>
                  <button className="admin-btn-ghost text-xs" onClick={() => void copyPreviewUrl()}>
                    Copy Preview Link
                  </button>
                  <button className="admin-btn-ghost text-xs" onClick={() => void copyEmail()}>
                    Copy Message
                  </button>
                  {facebookUrl ? (
                    <a href={facebookUrl} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs">
                      Open Facebook
                    </a>
                  ) : null}
                  <button className="admin-btn-primary text-xs" onClick={() => void sendEmail()} disabled={isSending}>
                    {isSending ? "Sending..." : "Send Email"}
                  </button>
                </div>
                {sampleStorageSource === "local" ? (
                  <p className="text-[11px]" style={{ color: "#fbbf24" }}>
                    Local-only lead: preview and message prep work now, send/email actions may require backend save.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Deal Progress</h3>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Current stage: <strong>{dealStage}</strong>
        </p>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Next recommended action: {recommendedClosingAction(dealStage)}
        </p>
        {initialLastReplyPreview ? (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Last reply signal: "{String(initialLastReplyPreview).slice(0, 140)}"
          </p>
        ) : null}
      </div>

      <div className="admin-card space-y-3">
        <h3 className="text-sm font-semibold">Email &amp; messages</h3>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Draft, send, and track outreach from here.
        </p>
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto]">
          <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Quick Replies
            <select
              className="admin-input mt-1 h-9"
              value={selectedQuickReplyId}
              onChange={(e) => applyQuickReply(e.target.value)}
            >
              <option value="">Select a quick reply...</option>
              {quickReplyOptions().map((reply) => (
                <option key={reply.id} value={reply.id}>
                  {reply.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Closing Replies
            <select
              className="admin-input mt-1 h-9"
              value={selectedClosingReplyId}
              onChange={(e) => applyClosingReply(e.target.value)}
            >
              <option value="">Select a closing reply...</option>
              {CLOSING_REPLIES.map((reply) => (
                <option key={reply.id} value={reply.id}>
                  {reply.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Insert Mode
            <select
              className="admin-input mt-1 h-9"
              value={quickReplyMode}
              onChange={(e) => setQuickReplyMode(e.target.value === "append" ? "append" : "replace")}
            >
              <option value="replace">Replace</option>
              <option value="append">Append</option>
            </select>
          </label>
          <div className="flex items-end">
            <button className="admin-btn-ghost text-xs" onClick={() => saveCurrentAsQuickReply()}>
              Save as Template
            </button>
          </div>
        </div>
        {selectedClosingTemplate ? (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Suggested stage: <strong>{selectedClosingTemplate.stage}</strong> - {selectedClosingTemplate.nextAction}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button className="admin-btn-primary text-xs" onClick={() => void generateDraft()} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Email"}
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void generateDraft()} disabled={isGenerating}>
            Preview Email
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void copyEmail()}>
            Copy Email
          </button>
          <button className="admin-btn-primary text-xs" onClick={() => void sendEmail()} disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </button>
          <button
            className="admin-btn-primary text-xs"
            onClick={() => void sendPreviewEmail()}
            disabled={isSendingPreview}
          >
            {isSendingPreview ? "Sending Preview..." : "Send Preview Email"}
          </button>
        </div>
        {showCompose ? (
          <div className="space-y-2">
            <input
              className="admin-input h-9"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
            <textarea
              className="admin-input min-h-[180px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body"
            />
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Generate a draft from dossier intelligence, then edit and send.
          </p>
        )}
        {outreachBanner ? (
          <div
            className="rounded-lg border px-3 py-3 space-y-2 mt-2"
            style={{
              borderColor: outreachBanner.ok ? "rgba(34,197,94,0.4)" : "rgba(248,113,113,0.45)",
              background: outreachBanner.ok ? "rgba(22,101,52,0.2)" : "rgba(127,29,29,0.2)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: outreachBanner.ok ? "#86efac" : "#fecaca" }}>
              {outreachBanner.ok ? "Email sent successfully" : "Email failed to send"}
            </p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Status: <strong>{outreachBanner.ok ? "Sent" : "Failed"}</strong>
              {" · "}
              Channel:{" "}
              <strong>
                {outreachBanner.channel === "preview_email"
                  ? "Preview email"
                  : initialLastOutreachChannel === "text"
                    ? "Text"
                    : initialLastOutreachChannel === "facebook"
                      ? "Facebook"
                      : "Email"}
              </strong>
              {" · "}
              {outreachBanner.at ? new Date(outreachBanner.at).toLocaleString() : "—"}
            </p>
            {!outreachBanner.ok && outreachBanner.error ? (
              <p className="text-xs" style={{ color: "#fecaca" }}>
                {outreachBanner.error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Link href={buildLeadPath(leadId, initialBusinessName)} className="admin-btn-ghost text-xs">
                View Lead
              </Link>
              <button type="button" className="admin-btn-ghost text-xs" onClick={() => void postSendScheduleFollowUp()} disabled={isUpdating}>
                Schedule Follow-Up
              </button>
              <button type="button" className="admin-btn-ghost text-xs" onClick={() => void postSendMarkReplied()} disabled={isUpdating}>
                Mark Replied
              </button>
              <button type="button" className="admin-btn-ghost text-xs" onClick={() => void postSendArchive()} disabled={isUpdating}>
                Archive
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Proposal Generator</h3>
        {proposalEligible ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn-primary text-xs" onClick={() => generateProposal()}>
                Generate Proposal
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void copyProposal()}>
                Copy Proposal
              </button>
            </div>
            {proposalText ? (
              <textarea
                className="admin-input min-h-[220px]"
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                aria-label="Generated proposal copy"
                title="Generated proposal copy"
              />
            ) : (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Proposal is available for replied/interested leads.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Proposal unlocks when lead is replied or marked interested.
          </p>
        )}
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Client Site Draft</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-primary text-xs"
            onClick={() => {
              const url = buildPreviewUrl();
              if (url) window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            Generate Client Site Draft
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void copyPreviewUrl()}>
            Copy Preview URL
          </button>
        </div>
        {previewUrl ? (
          <p className="text-xs break-all" style={{ color: "var(--admin-muted)" }}>
            {previewUrl}
          </p>
        ) : (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Generates a shareable client site draft at <code>/preview/&lt;lead_id&gt;</code>.
          </p>
        )}
      </div>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Real World Plan</h3>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Door status: <strong>{doorStatus.replace(/_/g, " ")}</strong>
        </p>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--admin-muted)" }}>Why this is a good target</label>
          <textarea
            className="admin-input min-h-[72px]"
            value={realWorldWhyTarget}
            onChange={(e) => setRealWorldWhyTarget(e.target.value)}
            placeholder="Active business, local visibility, clear website gap..."
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--admin-muted)" }}>What to say when I walk in</label>
          <textarea
            className="admin-input min-h-[72px]"
            value={realWorldWalkInPitch}
            onChange={(e) => setRealWorldWalkInPitch(e.target.value)}
            placeholder="Quick intro and value statement for walk-ins."
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--admin-muted)" }}>Best time to visit</label>
          <input
            className="admin-input"
            value={bestTimeToVisit}
            onChange={(e) => setBestTimeToVisit(e.target.value)}
            placeholder="Weekday mornings, after lunch, etc."
          />
        </div>
        <button className="admin-btn-primary text-xs" onClick={() => void saveRealWorldPlan()} disabled={isUpdating}>
          Save Real World Plan
        </button>
      </div>

      <details className="admin-card space-y-2">
        <summary className="text-sm font-semibold cursor-pointer" style={{ color: "var(--admin-fg)" }}>
          More options
        </summary>
        <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
          Extra actions if you need them — the main buttons are at the top of this lead.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void markContactedWithFollowUp()}
            disabled={isUpdating}
          >
            Mark contacted (with reminder)
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() =>
              void updateLead(
                { status: "contacted", next_follow_up_at: addBusinessDaysIso(new Date(), 3) },
                "Follow-up scheduled."
              )
            }
            disabled={isUpdating}
          >
            Schedule follow-up (3 business days)
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void markRepliedWithReminder()}
            disabled={isUpdating}
          >
            Mark replied + calendar reminder
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void scheduleClientCall()}
            disabled={isUpdating}
          >
            Schedule call
          </button>
          <button
            className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
            onClick={() => void postSendArchive()}
            disabled={isUpdating}
          >
            Close file (same as Mark closed)
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("planned")}
            disabled={isUpdating}
          >
            Visit planned
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("visited")}
            disabled={isUpdating}
          >
            Visited
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("follow_up")}
            disabled={isUpdating}
          >
            Door follow-up
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("closed_won")}
            disabled={isUpdating}
          >
            Door → won
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("closed_lost")}
            disabled={isUpdating}
          >
            Door → closed
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("interested")} disabled={isUpdating}>
            Mark interested
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("proposal_sent")} disabled={isUpdating}>
            Proposal sent
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("won")} disabled={isUpdating}>
            Mark won (with deal details)
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("lost")} disabled={isUpdating}>
            Mark lost (with deal details)
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void markReferredClient()} disabled={isUpdating}>
            Referred client
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {website ? (
            <a href={website} target="_blank" rel="noreferrer" className="admin-btn-ghost">
              Open Website
            </a>
          ) : (
            <span className="admin-btn-ghost opacity-60 cursor-not-allowed">No website found</span>
          )}
          {contactPage ? (
            <a href={contactPage} target="_blank" rel="noreferrer" className="admin-btn-ghost">
              Open Contact Page
            </a>
          ) : (
            <span className="admin-btn-ghost opacity-60 cursor-not-allowed">No contact page</span>
          )}
          {caseHref ? (
            <a
              href={caseHref}
              className="admin-btn-ghost"
              onClick={() => console.info("[Action Debug] Open Case clicked", { leadId, caseHref })}
            >
              Open Case
            </a>
          ) : (
            <span className="admin-btn-ghost opacity-60 cursor-not-allowed">No case yet</span>
          )}
          {initialEmail ? (
            <a href={`mailto:${initialEmail}`} className="admin-btn-ghost">
              Open Email App
            </a>
          ) : null}
          {initialPhone ? (
            <>
              <a
                href={prefilledSmsHrefValue ?? "#"}
                className="admin-btn-ghost"
                onClick={(event) => {
                  if (!prefilledSmsHrefValue) event.preventDefault();
                }}
              >
                Text from Mac
              </a>
              <button className="admin-btn-ghost" onClick={() => void copyNumber()}>
                Copy Number
              </button>
              <button className="admin-btn-ghost" onClick={() => void copyTextScript()}>
                Copy Text Script
              </button>
              <button
                className="admin-btn-ghost"
                onClick={() =>
                  void updateLead(
                    { status: "contacted" },
                    "Lead marked contacted (text sent)."
                  )
                }
                disabled={isUpdating}
              >
                Mark Text Sent
              </button>
            </>
          ) : null}
        </div>
      </details>

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Notes</h3>
        <textarea
          className="admin-input min-h-[100px]"
          placeholder="Add note..."
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
        />
        <button className="admin-btn-primary text-xs" onClick={() => void addNote()} disabled={isUpdating}>
          Add Note
        </button>
        {savedNotes.length > 0 ? (
          <ul className="text-xs list-disc pl-5 space-y-1" style={{ color: "var(--admin-muted)" }}>
            {savedNotes.map((note, idx) => (
              <li key={`${note}-${idx}`}>{note}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 60,
            background: "#14532d",
            color: "#dcfce7",
            border: "1px solid #166534",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            maxWidth: 320,
          }}
        >
          {toastMessage}
        </div>
      ) : null}
      {error ? (
        <p className="text-xs" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </aside>
  );
}
