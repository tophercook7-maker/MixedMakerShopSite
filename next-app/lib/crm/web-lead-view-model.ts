/**
 * Normalized view model for web CRM UI — single mapping from raw `leads` rows.
 */
import { canonicalizeLeadStatus } from "@/lib/crm-lead-schema";
import { leadHasContactPath } from "@/lib/crm/lead-lane";
import { resolveServiceMode, type WebServiceMode } from "@/lib/crm/web-service-mode";
import { normalizeSourcePlatform, sourcePlatformLabel, type WebSourcePlatform } from "@/lib/crm/web-source-normalize";
import { resolveWebCrmLane, type WebCrmLane } from "@/lib/crm/web-lead-lane";
import { resolveWebNextAction, type WebNextAction } from "@/lib/crm/web-next-action";

export type WebLeadBadgeId =
  | "no_website"
  | "email"
  | "phone"
  | "facebook"
  | "contact_form"
  | "replied"
  | "mockup"
  | "hot"
  | "parked"
  | "google"
  | "manual";

export type WebLeadViewModel = {
  id: string;
  businessName: string;
  city: string;
  state: string;
  category: string;
  website: string;
  websiteStatus: string;
  email: string;
  phone: string;
  contactPage: string;
  facebookUrl: string;
  sourcePlatform: WebSourcePlatform;
  sourcePlatformLabel: string;
  sourceQuery: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceRaw: string;
  leadSource: string;
  captureRunId: string;
  captureNotes: string;
  score: number | null;
  lane: WebCrmLane;
  nextAction: WebNextAction;
  nextActionReason: string;
  bestContactMethod: string;
  bestContactValue: string;
  hasWebsite: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasFacebook: boolean;
  hasContactPage: boolean;
  followUpDueAt: string | null;
  repliedAt: string | null;
  lastTouchedAt: string | null;
  lastContactedAt: string | null;
  lastReplyAt: string | null;
  unreadReplyCount: number;
  sampleStatus: string;
  dealStage: string | null;
  dealStatus: string | null;
  dealValue: number | null;
  mockupDealStatus: string | null;
  previewUrl: string | null;
  previewSent: boolean;
  badges: WebLeadBadgeId[];
  serviceMode: WebServiceMode;
  status: string;
  notes: string;
  createdAt: string | null;
  closedAt: string | null;
  crmLaneWebStored: string | null;
  /** ISO timestamps from row */
  linkedOpportunityId: string | null;
  leadTags: string[];
};

function trim(s: unknown): string {
  return String(s ?? "").trim();
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function websiteStatusFromRow(row: Record<string, unknown>): string {
  const has = row.has_website === true;
  const w = trim(row.website);
  if (!w) return "None";
  if (!has) return "Social / unclear";
  return "Live";
}

function deriveSampleStatus(row: Record<string, unknown>): string {
  const m = trim(row.mockup_deal_status).toLowerCase();
  if (!m || m === "new") {
    if (trim(row.preview_url)) return "queued";
    return "none";
  }
  const map: Record<string, string> = {
    mockup_sent: "sent",
    replied: "viewed",
    interested: "discussed",
    closed_won: "discussed",
    closed_lost: "discussed",
  };
  return map[m] || m;
}

function buildBadges(
  vm: Omit<WebLeadViewModel, "badges" | "nextAction" | "nextActionReason">,
  isHot: boolean
): WebLeadBadgeId[] {
  const out: WebLeadBadgeId[] = [];
  if (!vm.hasWebsite) out.push("no_website");
  if (vm.hasEmail) out.push("email");
  if (vm.hasPhone) out.push("phone");
  if (vm.hasFacebook) out.push("facebook");
  if (vm.hasContactPage) out.push("contact_form");
  const st = canonicalizeLeadStatus(vm.status);
  if (st === "replied" || vm.unreadReplyCount > 0) out.push("replied");
  if (vm.mockupDealStatus && vm.mockupDealStatus !== "new") out.push("mockup");
  if (isHot) out.push("hot");
  if (vm.lane === "parked") out.push("parked");
  const sp = vm.sourcePlatform;
  if (sp === "google_maps" || sp === "google_search") out.push("google");
  if (sp === "manual" || sp === "quick_add") out.push("manual");
  return out;
}

export function toWebLeadViewModel(row: Record<string, unknown>): WebLeadViewModel {
  const id = trim(row.id);
  const platform = normalizeSourcePlatform(trim(row.source_platform as string), {
    source: row.source as string,
    lead_source: row.lead_source as string,
  });
  const serviceMode = resolveServiceMode({
    lead_source: row.lead_source as string,
    source: row.source as string,
    category: row.category as string,
    lead_tags: row.lead_tags as string[],
    service_type: row.service_type as string,
  });

  const email = trim(row.email);
  const phone = trim(row.phone);
  const facebookUrl = trim(row.facebook_url);
  const contactPage = trim(row.contact_page);
  const website = trim(row.website);

  const laneInput = {
    status: row.status as string,
    email: row.email as string,
    phone: row.phone as string,
    website: row.website as string,
    facebook_url: row.facebook_url as string,
    contact_page: row.contact_page as string,
    best_contact_method: row.best_contact_method as string,
    conversion_score: row.conversion_score as number,
    opportunity_score: row.opportunity_score as number,
    why_this_lead_is_here: row.why_this_lead_is_here as string,
    is_hot_lead: row.is_hot_lead as boolean,
    has_website: row.has_website as boolean,
    lead_tags: row.lead_tags as string[],
    opportunity_reason: row.opportunity_reason as string,
    unread_reply_count: row.unread_reply_count as number,
    mockup_deal_status: row.mockup_deal_status as string,
    preview_sent: row.preview_sent as boolean,
    preview_url: row.preview_url as string,
    deal_status: row.deal_status as string,
    deal_stage: row.deal_stage as string,
    follow_up_status: row.follow_up_status as string,
    next_follow_up_at: row.next_follow_up_at as string,
    crm_lane_web: row.crm_lane_web as string,
  };

  const lane = resolveWebCrmLane(laneInput);

  const score = numOrNull(row.conversion_score) ?? numOrNull(row.opportunity_score);

  const hasWebsite = Boolean(website) && row.has_website !== false;
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);
  const hasFacebook = Boolean(facebookUrl);
  const hasContactPage = Boolean(contactPage);

  const lastTouchMs = [
    row.last_reply_at,
    row.last_contacted_at,
    row.last_outreach_sent_at,
    row.created_at,
  ]
    .map((x) => new Date(trim(x)).getTime())
    .filter((t) => Number.isFinite(t));
  const lastTouchedAt =
    lastTouchMs.length > 0
      ? new Date(Math.max(...lastTouchMs)).toISOString()
      : trim(row.created_at) || null;

  const isHot = row.is_hot_lead === true;

  const base: Omit<WebLeadViewModel, "badges" | "nextAction" | "nextActionReason"> = {
    id,
    businessName: trim(row.business_name) || "Unknown business",
    city: trim(row.city),
    state: trim(row.state),
    category: trim(row.category),
    website,
    websiteStatus: websiteStatusFromRow(row),
    email,
    phone,
    contactPage,
    facebookUrl,
    sourcePlatform: platform,
    sourcePlatformLabel: sourcePlatformLabel(platform),
    sourceQuery: trim(row.source_query),
    sourceLabel: trim(row.source_label),
    sourceUrl: trim(row.source_url),
    sourceRaw: trim(row.source),
    leadSource: trim(row.lead_source),
    captureRunId: trim(row.capture_run_id),
    captureNotes: trim(row.capture_notes),
    score,
    lane,
    bestContactMethod: trim(row.best_contact_method),
    bestContactValue: trim(row.best_contact_value),
    hasWebsite,
    hasEmail,
    hasPhone,
    hasFacebook,
    hasContactPage,
    followUpDueAt: trim(row.next_follow_up_at) || null,
    repliedAt: trim(row.replied_at) || trim(row.last_reply_at) || null,
    lastTouchedAt,
    lastContactedAt: trim(row.last_contacted_at) || null,
    lastReplyAt: trim(row.last_reply_at) || null,
    unreadReplyCount: Math.max(0, Number(row.unread_reply_count || 0)),
    sampleStatus: deriveSampleStatus(row),
    dealStage: trim(row.deal_stage) || null,
    dealStatus: trim(row.deal_status) || null,
    dealValue: numOrNull(row.deal_value),
    mockupDealStatus: trim(row.mockup_deal_status) || null,
    previewUrl: trim(row.preview_url) || null,
    previewSent: row.preview_sent === true,
    status: trim(row.status) || "new",
    notes: trim(row.notes),
    createdAt: trim(row.created_at) || null,
    closedAt: trim(row.closed_at) || null,
    crmLaneWebStored: trim(row.crm_lane_web) || null,
    linkedOpportunityId: trim(row.linked_opportunity_id) || null,
    leadTags: Array.isArray(row.lead_tags) ? row.lead_tags.map((t) => String(t)) : [],
    serviceMode,
  };

  const nextAction = resolveWebNextAction(
    {
      hasEmail,
      hasPhone,
      hasFacebook,
      hasContactPage,
      hasWebsite,
      bestContactMethod: trim(row.best_contact_method),
      website,
      previewUrl: trim(row.preview_url) || null,
      unreadReplyCount: Math.max(0, Number(row.unread_reply_count || 0)),
      followUpDueAt: trim(row.next_follow_up_at) || null,
    },
    lane
  );

  const vm: WebLeadViewModel = {
    ...base,
    nextAction,
    nextActionReason: nextAction.reason,
    badges: buildBadges(base, isHot),
  };

  return vm;
}

/** Search / filter helper — lowercased haystack. */
export function webLeadSearchHaystack(vm: WebLeadViewModel): string {
  return [
    vm.businessName,
    vm.category,
    vm.city,
    vm.notes,
    vm.sourceQuery,
    vm.sourceLabel,
    vm.sourceUrl,
    vm.email,
    vm.phone,
  ]
    .join("\n")
    .toLowerCase();
}

export function bestContactPathSummary(vm: WebLeadViewModel): string {
  const bcm = trim(vm.bestContactMethod).toLowerCase();
  if (bcm === "email" && vm.hasEmail) return "Email";
  if (bcm === "phone" && vm.hasPhone) return "Phone";
  if (bcm === "facebook" && vm.hasFacebook) return "Facebook";
  if (bcm === "contact_form" && vm.hasContactPage) return "Contact form";
  if (bcm === "website" && vm.hasWebsite) return "Website";
  if (vm.hasEmail) return "Email";
  if (vm.hasFacebook) return "Facebook";
  if (vm.hasPhone) return "Phone";
  if (vm.hasContactPage) return "Contact form";
  const pathIn = {
    email: vm.email,
    phone: vm.phone,
    website: vm.website,
    facebook_url: vm.facebookUrl,
    contact_page: vm.contactPage,
    best_contact_method: vm.bestContactMethod,
    conversion_score: vm.score ?? undefined,
    opportunity_score: vm.score ?? undefined,
    why_this_lead_is_here: undefined,
    is_hot_lead: undefined,
    has_website: vm.hasWebsite,
    lead_tags: undefined,
    opportunity_reason: undefined,
  };
  if (leadHasContactPath(pathIn)) return "Mixed";
  return "—";
}
