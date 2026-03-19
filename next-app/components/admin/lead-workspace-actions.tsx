"use client";

import { useEffect, useState } from "react";
import {
  applyRandomImagesToSample,
  autofillLeadSample,
  buildDefaultLeadSample,
  normalizeLeadSampleRecord,
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
  initialEmail: string | null;
  initialPhone: string | null;
  website: string | null;
  contactPage: string | null;
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
};

type TemplateResponse = {
  short_email?: string;
  longer_email?: string;
  follow_up_note?: string;
};

const LOCAL_SAMPLES_KEY = "crm.lead_samples";

const DEFAULT_SMS_TEMPLATE =
  "Hi, this is Topher with Topher's Web Design. I noticed a website opportunity that could help customers reach your business more easily. Want me to send you a quick example?";

function fallbackDraft(name: string, issue: string) {
  return {
    subject: "quick question about your website",
    body: [
      `Hi ${name || ""},`,
      "",
      `I was looking at your website and noticed: ${issue || "something that might be affecting conversions"}.`,
      "",
      "I grabbed a quick screenshot showing it.",
      "",
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
    ? { label: "Standard site ($300-$500)", midpoint: 400 }
    : { label: "Basic website ($150-$300)", midpoint: 225 };
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
  initialEmail,
  initialPhone,
  website,
  contactPage,
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
}: LeadWorkspaceActionsProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
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

  function applyAutofill(base: LeadSampleRecord, trigger: "open_builder" | "first_generate"): LeadSampleRecord {
    const result = autofillLeadSample(base, {
      businessName: initialBusinessName,
      category: initialCategory,
      city: initialCity,
      issue: initialIssue,
      quickFixSummary,
      notes: savedNotes,
      website,
    });
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
        const normalized = normalizeLeadSampleRecord({
          ...first,
          source: "server",
          isLocalOnly: false,
        });
        setSample(normalized);
        setSampleStorageSource("server");
        buildPreviewUrl(normalized);
        generateShareCopy(normalized);
      }
    } catch {
      // local fallback already loaded when available
    } finally {
      setIsSampleLoading(false);
    }
  }

  useEffect(() => {
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

      const fallback = fallbackDraft(initialBusinessName, initialIssue);
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

      setSubject(nextSubject);
      setBody(nextBody);
      setMessage("Outreach draft generated.");
      console.info("[Action Debug] Generate Email request succeeded", { leadId });
    } catch (e) {
      const fallback = fallbackDraft(initialBusinessName, initialIssue);
      setSubject(fallback.subject);
      setBody(
        quickFixSummary
          ? `${fallback.body}\n\nI put together a quick improvement idea: ${quickFixSummary}`
          : fallback.body
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
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      console.info("[Action Debug] Send Email response", { leadId, status: res.status, body: data });
      if (!res.ok) throw new Error(data.error || "Could not send outreach email.");
      setMessage("Outreach email sent.");
      console.info("[Action Debug] Send Email request succeeded", { leadId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send outreach email.");
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
      if (!res.ok) throw new Error(data.error || "Could not send preview email.");
      if (data.preview_url) setPreviewUrl(data.preview_url);
      setMessage(data.message || "Preview sent and follow-ups scheduled");
      console.info("[Action Debug] Send Preview Email request succeeded", { leadId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send preview email.");
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
    const ok = await updateLead({ status: "contacted" }, "Lead marked contacted.");
    if (!ok) return;
    try {
      await createLeadLinkedEvent("followup", `Follow up: ${initialBusinessName || "Lead"}`, 1);
      setMessage("Lead marked contacted and follow-up scheduled.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create follow-up event.");
    }
  }

  async function markRepliedWithReminder() {
    const ok = await updateLead({ status: "replied", is_hot_lead: true }, "Lead marked replied.");
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
      await updateLead(
        {
          deal_status: "won",
          deal_value: Number.isFinite(parsed) && parsed > 0 ? parsed : pricing.midpoint,
          closed_at: nowIso,
          status: "closed_won",
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
      return;
    }
    if (nextStatus === "lost") {
      await updateLead(
        { deal_status: "lost", closed_at: nowIso, status: "closed_lost", sequence_active: false },
        "Deal marked lost."
      );
      return;
    }
    await updateLead(
      { deal_status: nextStatus, status: "contacted" },
      nextStatus === "interested" ? "Deal marked interested." : "Proposal marked sent."
    );
  }

  async function updateDoorStatus(nextDoorStatus: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost") {
    const statusPatch: Record<string, unknown> =
      nextDoorStatus === "closed_won"
        ? { status: "closed_won" }
        : nextDoorStatus === "closed_lost"
          ? { status: "closed_lost" }
          : nextDoorStatus === "follow_up"
            ? { status: "follow_up_due" }
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

  function smsTemplate() {
    return DEFAULT_SMS_TEMPLATE.replace(
      "a website opportunity",
      `a website opportunity for ${initialBusinessName || "your business"}`
    );
  }

  function smsHref() {
    const phone = String(initialPhone || "").replace(/[^\d+]/g, "");
    const body = encodeURIComponent(smsTemplate());
    return `sms:${encodeURIComponent(phone)}?&body=${body}`;
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
      await navigator.clipboard.writeText(smsTemplate());
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

  function buildPreviewUrl(overrideSample?: LeadSampleRecord | null) {
    if (typeof window === "undefined") return "";
    const activeSample = overrideSample || sample;
    const additionalImages =
      activeSample?.additional_image_urls?.length
        ? activeSample.additional_image_urls
        : activeSample?.image_urls || [];
    const params = new URLSearchParams();
    params.set("business", activeSample?.business_name || initialBusinessName || "Business");
    params.set("category", activeSample?.business_type || initialCategory || "service");
    if (activeSample?.hero_headline) params.set("headline", activeSample.hero_headline);
    if (activeSample?.hero_subheadline) params.set("subheadline", activeSample.hero_subheadline);
    if (activeSample?.cta_text) params.set("cta", activeSample.cta_text);
    if (activeSample?.primary_image_url) params.set("hero_image", activeSample.primary_image_url);
    if (activeSample?.services?.length) params.set("services", activeSample.services.join("\n"));
    if (additionalImages.length) params.set("image_urls", additionalImages.join(","));
    if (activeSample?.gallery_image_urls?.length) params.set("gallery_images", activeSample.gallery_image_urls.join(","));
    if (additionalImages[0]) params.set("service_image_1", additionalImages[0]);
    if (additionalImages[1]) params.set("service_image_2", additionalImages[1]);
    if (additionalImages[2]) params.set("service_image_3", additionalImages[2]);
    if (activeSample?.accent_mode) {
      const styleMap: Record<string, string> = {
        "clean-modern": "clean_modern",
        "bold-premium": "bold_premium",
        "friendly-local": "friendly_local",
        "minimal-elegant": "minimal_elegant",
      };
      const mapped = styleMap[String(activeSample.accent_mode)] || String(activeSample.accent_mode || "");
      if (mapped) params.set("style_preset", mapped);
    }
    if (initialEmail) params.set("email", initialEmail);
    if (initialPhone) params.set("phone", initialPhone);
    if (website) params.set("website", website);
    const generated = `${window.location.origin}/preview/${encodeURIComponent(leadId)}?${params.toString()}`;
    setPreviewUrl(generated);
    return generated;
  }

  async function copyPreviewUrl() {
    const url = previewUrl || buildPreviewUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Preview URL copied.");
      setError(null);
    } catch {
      setError("Could not copy preview URL.");
    }
  }

  async function persistSample(nextSample: LeadSampleRecord): Promise<LeadSampleRecord> {
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
      const serverSaved = normalizeLeadSampleRecord({ ...data, source: "server", isLocalOnly: false });
      upsertLocalSample(serverSaved);
      setSampleStorageSource("server");
      return serverSaved;
    } catch (e) {
      const localSaved = normalizeLeadSampleRecord({ ...payload, source: "local", isLocalOnly: true });
      upsertLocalSample(localSaved);
      setSampleStorageSource("local");
      setError(
        `Saved locally. Backend save failed: ${e instanceof Error ? e.message : "unknown error"}`
      );
      return localSaved;
    }
  }

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
    setMessage(saved.isLocalOnly ? "Sample saved locally." : "Sample saved to backend.");
    setSampleBuilderOpen(true);
  }

  async function updateSampleField<K extends keyof LeadSampleRecord>(field: K, value: LeadSampleRecord[K]) {
    const base = sample || buildDefaultLeadSample({ leadId, businessName: initialBusinessName, businessType: initialCategory, note: initialIssue });
    const next = normalizeLeadSampleRecord({
      ...base,
      [field]: value,
      lead_id: leadId,
      business_name: base.business_name || initialBusinessName || "Business Name",
      business_type: base.business_type || initialCategory || "service business",
      updated_at: new Date().toISOString(),
    });
    setSampleAndRefresh(next);
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

  return (
    <aside className="space-y-3 sticky top-4">
      <div className="admin-card space-y-3">
        <h3 className="text-sm font-semibold">Lead Sample Generator</h3>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Status: <strong>{sample?.status || "none"}</strong>
          {sampleStorageSource ? ` - ${sampleStorageSource === "server" ? "Backend" : "Local only"}` : ""}
        </p>
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
          <div className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Business Name
                <input
                  className="admin-input mt-1 h-9"
                  value={sample?.business_name || initialBusinessName || ""}
                  onChange={(e) => void updateSampleField("business_name", e.target.value)}
                />
              </label>
              <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
                Business Type
                <input
                  className="admin-input mt-1 h-9"
                  value={sample?.business_type || initialCategory || ""}
                  onChange={(e) => void updateSampleField("business_type", e.target.value)}
                />
              </label>
            </div>
            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Headline
              <input
                className="admin-input mt-1 h-9"
                value={sample?.hero_headline || ""}
                onChange={(e) => void updateSampleField("hero_headline", e.target.value)}
              />
            </label>
            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Subheadline
              <textarea
                className="admin-input mt-1 min-h-[70px]"
                value={sample?.hero_subheadline || ""}
                onChange={(e) => void updateSampleField("hero_subheadline", e.target.value)}
              />
            </label>
            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Intro / About
              <textarea
                className="admin-input mt-1 min-h-[70px]"
                value={sample?.intro_text || ""}
                onChange={(e) => void updateSampleField("intro_text", e.target.value)}
              />
            </label>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
                CTA Text
                <input
                  className="admin-input mt-1 h-9"
                  value={sample?.cta_text || ""}
                  onChange={(e) => void updateSampleField("cta_text", e.target.value)}
                />
              </label>
              <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
                Template
                <select
                  className="admin-input mt-1 h-9"
                  value={sample?.template_key || "service-business"}
                  onChange={(e) => void updateSampleField("template_key", e.target.value)}
                >
                  <option value="service-business">Service Business</option>
                  <option value="coffee">Coffee Shop</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="church">Church</option>
                  <option value="lawn">Lawn Care</option>
                  <option value="plumbing">Plumbing</option>
                </select>
              </label>
            </div>
            <label className="text-xs block" style={{ color: "var(--admin-muted)" }}>
              Services (one per line)
              <textarea
                className="admin-input mt-1 min-h-[90px]"
                value={sample?.services.join("\n") || ""}
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
            <div className="space-y-2 rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--admin-fg)" }}>Images</p>
              <div className="flex flex-wrap gap-2">
                <label className="admin-btn-ghost text-xs cursor-pointer">
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
                  Use Suggested Stock Images
                </button>
                <button className="admin-btn-ghost text-xs" onClick={() => regenerateSampleImages()}>
                  Regenerate Stock Images
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  className="admin-input h-9"
                  value={pastedImageUrl}
                  onChange={(e) => setPastedImageUrl(e.target.value)}
                  placeholder="Paste image URL (Facebook, website, etc.)"
                />
                <button className="admin-btn-ghost text-xs" onClick={() => void addImageFromUrl()} disabled={isAddingImageUrl}>
                  {isAddingImageUrl ? "Adding..." : "Add Image From URL"}
                </button>
              </div>
              {sample?.images?.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {sample.images.map((image) => {
                    const isHero = image.role === "hero";
                    const galleryIndex = sample.images.filter((entry) => entry.role === "gallery").findIndex((entry) => entry.id === image.id);
                    return (
                      <div
                        key={image.id}
                        className="rounded border p-1"
                        style={{ borderColor: isHero ? "var(--admin-gold)" : "var(--admin-border)" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.src} alt={image.label || "Sample image"} style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 6 }} />
                        <p className="text-[11px] mt-1" style={{ color: "var(--admin-muted)" }}>
                          {isHero ? "Hero" : "Gallery"} - {image.source}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <button className="admin-btn-ghost text-[11px] px-2 py-1" onClick={() => setImageAsHero(image.id)}>
                            Set As Hero
                          </button>
                          <button className="admin-btn-ghost text-[11px] px-2 py-1" onClick={() => setImageAsGallery(image.id)}>
                            Add To Gallery
                          </button>
                          <button className="admin-btn-ghost text-[11px] px-2 py-1" onClick={() => removeImage(image.id)}>
                            Remove
                          </button>
                        </div>
                        {image.role === "gallery" ? (
                          <input
                            className="admin-input mt-1 h-8 text-[11px]"
                            value={image.src}
                            onChange={(e) => replaceAdditionalImage(galleryIndex, e.target.value)}
                            placeholder="Replace URL (optional)"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Add images by upload, paste URL, or stock suggestions.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn-primary text-xs" onClick={() => void createOrOpenSample()}>
                Save Sample
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void saveSampleStatus("ready")} disabled={!sample}>
                Mark Ready
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void copySampleEmail()} disabled={!sample}>
                Generate Email
              </button>
              <button className="admin-btn-ghost text-xs" onClick={() => void copySampleText()} disabled={!sample}>
                Generate Text
              </button>
            </div>
            {generatedSampleEmail ? (
              <textarea
                className="admin-input min-h-[120px]"
                value={generatedSampleEmail}
                readOnly
                aria-label="Generated sample email copy"
                title="Generated sample email copy"
              />
            ) : null}
            {generatedSampleText ? (
              <textarea
                className="admin-input min-h-[80px]"
                value={generatedSampleText}
                readOnly
                aria-label="Generated sample text copy"
                title="Generated sample text copy"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="admin-card space-y-3">
        <h3 className="text-sm font-semibold">Outreach Panel</h3>
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

      <div className="admin-card space-y-2">
        <h3 className="text-sm font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void markContactedWithFollowUp()}
            disabled={isUpdating}
          >
            Mark Contacted
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateLead({ status: "follow_up_due" }, "Follow-up scheduled.")}
            disabled={isUpdating}
          >
            Schedule Follow Up
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void markRepliedWithReminder()}
            disabled={isUpdating}
          >
            Mark Replied
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void scheduleClientCall()}
            disabled={isUpdating}
          >
            Schedule Call
          </button>
          <button
            className="admin-btn-danger text-xs"
            onClick={() => void updateLead({ status: "do_not_contact" }, "Lead marked do not contact.")}
            disabled={isUpdating}
          >
            Do Not Contact
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("planned")}
            disabled={isUpdating}
          >
            Mark Planned
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("visited")}
            disabled={isUpdating}
          >
            Mark Visited
          </button>
          <button
            className="admin-btn-ghost text-xs"
            onClick={() => void updateDoorStatus("follow_up")}
            disabled={isUpdating}
          >
            Mark Follow Up
          </button>
          <button
            className="admin-btn-primary text-xs"
            onClick={() => void updateDoorStatus("closed_won")}
            disabled={isUpdating}
          >
            Mark Won
          </button>
          <button
            className="admin-btn-danger text-xs"
            onClick={() => void updateDoorStatus("closed_lost")}
            disabled={isUpdating}
          >
            Mark Lost
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("interested")} disabled={isUpdating}>
            Mark Interested
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void updateDealStatus("proposal_sent")} disabled={isUpdating}>
            Proposal Sent
          </button>
          <button className="admin-btn-primary text-xs" onClick={() => void updateDealStatus("won")} disabled={isUpdating}>
            Mark Won
          </button>
          <button className="admin-btn-danger text-xs" onClick={() => void updateDealStatus("lost")} disabled={isUpdating}>
            Mark Lost
          </button>
          <button className="admin-btn-ghost text-xs" onClick={() => void markReferredClient()} disabled={isUpdating}>
            Mark Referred Client
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
              <a href={smsHref()} className="admin-btn-ghost">
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
      </div>

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

      {message ? (
        <p className="text-xs" style={{ color: "#86efac" }}>
          {message}
        </p>
      ) : null}
      {message === "Preview sent and follow-ups scheduled" ? (
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
          }}
        >
          Preview sent and follow-ups scheduled
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
