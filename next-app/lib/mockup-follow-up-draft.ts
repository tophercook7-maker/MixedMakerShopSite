import type { FreeMockupPreviewSnapshot } from "@/lib/free-mockup-preview-snapshot";

/** Serializable inputs for deterministic follow-up drafts (admin / CRM). */
export type MockupFollowUpDraftInput = {
  contactName: string;
  businessName: string;
  city: string;
  phone?: string;
  differentiator?: string;
  desiredOutcomeIds?: string[];
  previewSnapshot: FreeMockupPreviewSnapshot | null;
};

export type MockupFollowUpDraft = {
  subject?: string;
  emailBody: string;
  smsBody?: string;
  /** Short internal angle label for CRM */
  angle: string;
};

function greetingName(contactName: string): string {
  const t = contactName.trim();
  if (!t) return "there";
  const first = t.split(/\s+/)[0];
  return first || "there";
}

function businessRef(businessName: string): string {
  const bn = businessName.trim();
  return bn || "your site";
}

/** Internal angle label (rules per business kind / fallback). */
export function followUpAngleLabel(snapshot: FreeMockupPreviewSnapshot | null): string {
  if (!snapshot) return "stronger online presence";
  const k = String(snapshot.businessKind || "").toLowerCase();
  if (k === "local-service") return "local trust + estimate requests";
  if (k === "creative") return "portfolio credibility + cleaner presentation";
  if (k === "digital") return "product clarity + guided UX";
  if (k === "web-agency") return "web presence + more inquiries";
  return "stronger online presence";
}

function leadLeanSentence(snapshot: FreeMockupPreviewSnapshot | null): string {
  if (!snapshot) {
    return "clearer structure and messaging so visitors understand what you offer and what to do next.";
  }
  const k = String(snapshot.businessKind || "").toLowerCase();
  if (k === "local-service") {
    return "local trust, a clear estimate path, and service sections that answer the questions people ask before they call.";
  }
  if (k === "creative") {
    return "presenting your work cleanly, building credibility quickly, and making the next step feel natural.";
  }
  if (k === "digital") {
    return "clarity first—what it is, who it’s for, and what to do next—without a maze of jargon.";
  }
  if (k === "web-agency") {
    return "a stronger first impression, clearer proof of how you work, and a smoother path to inquiries.";
  }
  return "clearer messaging and a calmer layout so visitors understand what you offer and feel comfortable reaching out.";
}

function goalFromOutcomes(ids: string[] | undefined): string {
  if (!ids?.length) return "feel confident reaching out";
  const set = new Set(ids.map((x) => String(x || "").trim()).filter(Boolean));
  if (set.has("get_more_calls")) return "request an estimate or call without friction";
  if (set.has("get_more_leads")) return "send an inquiry without guesswork";
  if (set.has("explain_services_clearly")) return "understand your services quickly";
  if (set.has("make_contact_easier")) return "reach you without runaround";
  if (set.has("look_more_professional")) return "see you as established and trustworthy";
  if (set.has("replace_outdated_site")) return "see what you offer as current and credible";
  if (set.has("show_up_better_online")) return "see you as credible where they look you up";
  return "feel confident reaching out";
}

export function followUpSmartQuestion(snapshot: FreeMockupPreviewSnapshot | null): string {
  const k = snapshot ? String(snapshot.businessKind || "").toLowerCase() : "";
  if (k === "local-service") {
    return "Which services do you most want people calling you for first?";
  }
  if (k === "creative") {
    return "What do you most want visitors to do first — explore your work or contact you?";
  }
  if (k === "digital") {
    return "What’s the main thing you want people to understand right away when they land on the site?";
  }
  if (k === "web-agency") {
    return "What do you most want the site to help you do better right now — look more trustworthy, explain your offer, or bring in more leads?";
  }
  return "What’s the biggest job you want the site to do for you first?";
}

function optionalContextLine(snapshot: FreeMockupPreviewSnapshot | null, differentiator: string): string {
  const d = differentiator.trim();
  if (snapshot?.headline?.trim()) {
    return `One direction that already lines up with your details: “${snapshot.headline.trim()}”.`;
  }
  if (d) {
    return `You also called out: ${d.length > 200 ? `${d.slice(0, 200)}…` : d}`;
  }
  if (snapshot?.services?.length) {
    const titles = snapshot.services
      .map((s) => s.title.trim())
      .filter((t) => t && !/^your main services$/i.test(t))
      .slice(0, 2);
    if (titles.length) {
      return `I’d keep ${titles.join(" + ")} prominent up front so the homepage feels specific to you.`;
    }
  }
  if (snapshot?.subheadline?.trim()) {
    const s = snapshot.subheadline.trim();
    return `Supporting line from your preview: ${s.length > 220 ? `${s.slice(0, 220)}…` : s}`;
  }
  return "";
}

function buildSubject(businessName: string, variantIndex: number): string {
  const bn = businessName.trim();
  const i = Math.abs(variantIndex) % 3;
  if (bn) {
    const opts = [`A direction for ${bn}`, `Quick idea for your website (${bn})`, `Mockup direction for ${bn}`];
    return opts[i]!;
  }
  const opts = ["Quick idea for your website", "A clean direction for your site", "A direction for your site"];
  return opts[i]!;
}

function buildSms(params: {
  snapshot: FreeMockupPreviewSnapshot | null;
  br: string;
  question: string;
  phone: string;
}): string | undefined {
  const phone = params.phone.trim();
  if (!phone) return undefined;
  const { snapshot, br, question } = params;
  const k = snapshot ? String(snapshot.businessKind || "").toLowerCase() : "";
  if (k === "local-service" || !snapshot) {
    return `Hey — Topher here. I reviewed your mockup request and have a solid direction in mind for ${br}. Quick Q: should the homepage lean more toward estimates, calls, or both?`;
  }
  const shortQ = question.length > 120 ? `${question.slice(0, 117)}…` : question;
  return `Hey — Topher here. I reviewed your mockup request for ${br}. Quick Q: ${shortQ}`;
}

/**
 * Deterministic follow-up draft from saved lead fields + optional preview snapshot.
 * Call on demand in admin; no separate DB column required.
 */
export function buildMockupFollowUpDraft(
  input: MockupFollowUpDraftInput,
  opts?: { variantIndex?: number },
): MockupFollowUpDraft {
  const variantIndex = Number.isFinite(opts?.variantIndex) ? Number(opts?.variantIndex) : 0;
  const {
    contactName,
    businessName,
    city,
    phone = "",
    differentiator = "",
    desiredOutcomeIds = [],
    previewSnapshot,
  } = input;

  const gn = greetingName(contactName);
  const br = businessRef(businessName);
  const angle = followUpAngleLabel(previewSnapshot);
  const lean = leadLeanSentence(previewSnapshot);
  const goal = goalFromOutcomes(desiredOutcomeIds);
  const question = followUpSmartQuestion(previewSnapshot);
  const optional = optionalContextLine(previewSnapshot, differentiator);
  const cityNote = city.trim() ? ` I’ve got you around ${city.trim()} in mind for the local details.` : "";
  const funnelNote =
    previewSnapshot?.isFreshCutFunnel || previewSnapshot?.exampleSource === "freshcut"
      ? "\n\nThey came in via the Fresh Cut example funnel — same layout family, tailored to their business."
      : "";

  const flip = Math.abs(variantIndex) % 2 === 1;
  const openWithSnapshot = flip
    ? `Thanks for the details — I’m already seeing a strong homepage direction for ${br}.${cityNote}`
    : `I took a look at your request and I’ve already got a strong direction in mind for ${br}.${cityNote}`;
  const openFallback = flip
    ? `Thanks for sending this through — I’ve got a solid direction in mind for ${br}.${cityNote}`
    : `I took a look at your request and I’ve got a good direction in mind for ${br}.${cityNote}`;

  const emailBody = previewSnapshot
    ? `Hey ${gn} —

${openWithSnapshot}

Based on what you shared, I’d lean into ${lean} The structure would aim to help people ${goal}.${funnelNote}${optional ? `\n\n${optional}` : ""}

Before I put more into it, one quick question:

${question}

– Topher`
    : `Hey ${gn} —

${openFallback}

Based on what you shared, the homepage should mainly help people ${goal}.

Before I build it out further, one quick question:

${question}

– Topher`;

  return {
    subject: buildSubject(businessName, variantIndex),
    emailBody: emailBody.replace(/\n{3,}/g, "\n\n").trim(),
    smsBody: buildSms({ snapshot: previewSnapshot, br, question, phone }),
    angle,
  };
}

/** Alias for callers that think in “lead” terms instead of “mockup”. */
export const generateLeadFollowUpDraft = buildMockupFollowUpDraft;
