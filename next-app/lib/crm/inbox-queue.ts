import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";
import { computeWorkTodayLeads, type WorkTodayLeadRow } from "@/lib/crm/work-today-leads";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";
import { getLeadStaleState } from "@/lib/lead-stale";
import { parseMockupLeadStatus } from "@/lib/lead-status";
import { buildLeadPath } from "@/lib/lead-route";

export type InboxCategory = "reply" | "new" | "follow_up" | "mockup";

export type InboxContact = {
  email: string | null;
  phone: string | null;
  facebookUrl: string | null;
};

export type InboxItem = {
  key: string;
  kind: "lead" | "mockup";
  id: string;
  title: string;
  subtitle: string | null;
  category: InboxCategory;
  reason: string;
  priorityScore: number;
  preview: string | null;
  contact: InboxContact;
  openHref: string;
  answerHref: string;
  mockupHref: string | null;
  createdAt: string | null;
  status: string | null;
  businessCategory?: string | null;
  suggestedResponse?: string | null;
  bestContactMethod?: string | null;
  website?: string | null;
  hasWebsite?: boolean | null;
  leadTags?: string[] | null;
};

export type InboxLeadInput = WorkTodayLeadRow & {
  email?: string | null;
  phone?: string | null;
  facebook_url?: string | null;
  lead_source?: string | null;
  service_type?: string | null;
  last_reply_preview?: string | null;
  last_reply_at?: string | null;
  first_outreach_sent_at?: string | null;
  email_sent?: boolean | null;
  facebook_sent?: boolean | null;
  text_sent?: boolean | null;
  category?: string | null;
  website?: string | null;
  has_website?: boolean | null;
  best_contact_method?: string | null;
  suggested_response?: string | null;
};

export type InboxMockupInput = {
  id: string;
  email: string;
  created_at: string;
  lead_status?: string | null;
  status?: string | null;
  status_updated_at?: string | null;
  updated_at?: string | null;
  mockup_data?: Record<string, unknown> | null;
  funnel_source?: string | null;
};

function terminalStatus(status: ReturnType<typeof normalizeWorkflowLeadStatus>): boolean {
  return status === "won" || status === "archived" || status === "no_response" || status === "not_interested";
}

function followUpIsDue(row: { next_follow_up_at?: string | null }, nowMs: number): boolean {
  const raw = String(row.next_follow_up_at || "").trim();
  if (!raw) return false;
  const t = new Date(raw).getTime();
  if (Number.isNaN(t)) return false;
  return t <= nowMs;
}

function unreadCount(row: { unread_reply_count?: number | null }): number {
  const n = row.unread_reply_count;
  if (n == null || Number.isNaN(Number(n))) return 0;
  return Math.max(0, Number(n));
}

function isMockupLead(row: InboxLeadInput): boolean {
  const st = String(row.service_type || "").toLowerCase();
  const src = `${row.lead_source || ""} ${(row.lead_tags || []).join(" ")}`.toLowerCase();
  return st === "web_design" || src.includes("mockup") || src.includes("free-mockup");
}

function normalizeContact(row: InboxLeadInput): InboxContact {
  const email = String(row.email || "").trim() || null;
  const phone = String(row.phone || "").trim() || null;
  const fb = String(row.facebook_url || "").trim();
  const facebookUrl = fb ? (fb.startsWith("http") ? fb : `https://${fb}`) : null;
  return { email, phone, facebookUrl };
}

function categorizeLead(row: InboxLeadInput, now: Date): InboxCategory {
  const status = normalizeWorkflowLeadStatus(row.status);
  const nowMs = now.getTime();
  if (status === "replied" || unreadCount(row) > 0 || String(row.last_reply_preview || "").trim()) {
    return "reply";
  }
  if (followUpIsDue(row, nowMs) && status !== "new") return "follow_up";
  if (status === "new" && isMockupLead(row)) return "mockup";
  if (status === "new") return "new";
  if (followUpIsDue(row, nowMs)) return "follow_up";
  return "new";
}

function leadReason(row: InboxLeadInput, now: Date): string {
  const status = normalizeWorkflowLeadStatus(row.status);
  const nowMs = now.getTime();
  if (status === "replied") return "They replied — answer now";
  if (unreadCount(row) > 0) return "Unread reply";
  if (followUpIsDue(row, nowMs)) return "Follow-up due";
  if (status === "new" && isMockupLead(row)) return "New free mockup request";
  if (status === "new") return "New lead — reach out";
  return "Ready for outreach";
}

function leadPriority(row: InboxLeadInput, now: Date): number {
  const status = normalizeWorkflowLeadStatus(row.status);
  const nowMs = now.getTime();
  let score = 0;
  if (status === "replied") score += 200;
  if (unreadCount(row) > 0) score += 150;
  if (followUpIsDue(row, nowMs)) score += 100;
  if (status === "new" && isMockupLead(row)) score += 90;
  if (status === "new") score += 70;
  if (row.conversion_score != null && Number(row.conversion_score) >= 85) score += 30;
  return score;
}

function isLeadInboxEligible(row: InboxLeadInput, now: Date): boolean {
  if (isThreeDPrintLead(row)) return false;
  const status = normalizeWorkflowLeadStatus(row.status);
  if (terminalStatus(status)) return false;
  const nowMs = now.getTime();
  const unread = unreadCount(row) > 0;
  const fu = followUpIsDue(row, nowMs);
  const isNew = status === "new";
  const isReplied = status === "replied";
  const hasReplyPreview = Boolean(String(row.last_reply_preview || "").trim());
  return isReplied || fu || isNew || unread || hasReplyPreview;
}

function mockupBusinessName(data: Record<string, unknown> | null | undefined): string {
  const mockRow = data?.mock_row;
  if (mockRow && typeof mockRow === "object" && !Array.isArray(mockRow)) {
    const name = String((mockRow as Record<string, unknown>).business_name || "").trim();
    if (name) return name;
  }
  const snapshot = data?.snapshot;
  if (snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)) {
    const name = String((snapshot as Record<string, unknown>).business_name || "").trim();
    if (name) return name;
  }
  return "";
}

function mockupLeadId(data: Record<string, unknown> | null | undefined): string | null {
  const id = String(data?.lead_id || "").trim();
  return id || null;
}

export function buildInboxItemFromLead(row: InboxLeadInput, now: Date = new Date()): InboxItem {
  const id = String(row.id || "").trim();
  const name = String(row.business_name || "").trim() || "Business";
  const category = categorizeLead(row, now);
  const contact = normalizeContact(row);
  const openHref = buildLeadPath(id, name);
  const answerHref =
    category === "reply"
      ? `${openHref}?generate=1`
      : `${openHref}?focus=outreach`;

  return {
    key: `lead:${id}`,
    kind: "lead",
    id,
    title: name,
    subtitle: contact.email || contact.phone || null,
    category,
    reason: leadReason(row, now),
    priorityScore: leadPriority(row, now),
    preview: String(row.last_reply_preview || "").trim() || null,
    contact,
    openHref,
    answerHref,
    mockupHref: isMockupLead(row) ? null : null,
    createdAt: row.created_at || null,
    status: row.status || null,
    businessCategory: String(row.category || "").trim() || null,
    suggestedResponse: String(row.suggested_response || "").trim() || null,
    bestContactMethod: String(row.best_contact_method || "").trim() || null,
    website: String(row.website || "").trim() || null,
    hasWebsite: row.has_website == null ? null : Boolean(row.has_website),
    leadTags: Array.isArray(row.lead_tags) ? row.lead_tags : null,
  };
}

export function buildInboxItemFromMockup(row: InboxMockupInput, now: Date = new Date()): InboxItem | null {
  const pipeline = parseMockupLeadStatus(row.lead_status ?? row.status);
  if (pipeline === "closed_won" || pipeline === "closed_lost" || pipeline === "archived") return null;

  const data = row.mockup_data || null;
  const linkedLeadId = mockupLeadId(data);
  if (linkedLeadId) return null;

  const stale = getLeadStaleState({
    pipeline,
    createdAt: row.created_at,
    statusUpdatedAt: row.status_updated_at,
    updatedAt: row.updated_at,
    now,
  });

  const needsWork =
    pipeline === "new" ||
    pipeline === "draft_created" ||
    pipeline === "follow_up_needed" ||
    stale.isStale;
  if (!needsWork) return null;

  const businessName = mockupBusinessName(data) || row.email;
  let category: InboxCategory = "mockup";
  if (pipeline === "follow_up_needed") category = "follow_up";

  let priorityScore = 60;
  if (pipeline === "new") priorityScore += 40;
  if (stale.isStale) priorityScore += stale.urgencyScore;

  const mockupHref = `/admin/mockup-submissions/${encodeURIComponent(row.id)}`;

  return {
    key: `mockup:${row.id}`,
    kind: "mockup",
    id: row.id,
    title: businessName,
    subtitle: row.email,
    category,
    reason: stale.isStale ? stale.reason : pipeline === "new" ? "New mockup submission" : "Mockup needs follow-up",
    priorityScore,
    preview: null,
    contact: { email: row.email, phone: null, facebookUrl: null },
    openHref: mockupHref,
    answerHref: mockupHref,
    mockupHref,
    createdAt: row.created_at,
    status: pipeline,
  };
}

export function computeInboxQueue(
  leads: InboxLeadInput[],
  mockups: InboxMockupInput[] = [],
  now: Date = new Date(),
  maxItems = 50
): InboxItem[] {
  const cap = Math.min(100, Math.max(1, maxItems));

  const leadItems = leads
    .filter((r) => isLeadInboxEligible(r, now))
    .map((r) => buildInboxItemFromLead(r, now));

  const mockupItems = mockups
    .map((m) => buildInboxItemFromMockup(m, now))
    .filter((x): x is InboxItem => x != null);

  const merged = [...leadItems, ...mockupItems];

  merged.sort((a, b) => {
    const pd = b.priorityScore - a.priorityScore;
    if (pd !== 0) return pd;
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });

  const seenLeadKeys = new Set<string>();
  const deduped: InboxItem[] = [];
  for (const item of merged) {
    if (item.kind === "lead") {
      if (seenLeadKeys.has(item.id)) continue;
      seenLeadKeys.add(item.id);
    }
    deduped.push(item);
  }

  return deduped.slice(0, cap);
}

export function filterInboxByCategory(items: InboxItem[], category: InboxCategory | "all"): InboxItem[] {
  if (category === "all") return items;
  return items.filter((i) => i.category === category);
}

export function inboxCategoryCounts(items: InboxItem[]): Record<InboxCategory | "all", number> {
  return {
    all: items.length,
    reply: items.filter((i) => i.category === "reply").length,
    new: items.filter((i) => i.category === "new").length,
    follow_up: items.filter((i) => i.category === "follow_up").length,
    mockup: items.filter((i) => i.category === "mockup").length,
  };
}

/** Quick queue for "work today" strip — reuses existing scorer. */
export function inboxWorkTodaySubset(leads: InboxLeadInput[], now: Date = new Date(), max = 10) {
  const webLeads = leads.filter((r) => !isThreeDPrintLead(r));
  return computeWorkTodayLeads(webLeads, now, max);
}
