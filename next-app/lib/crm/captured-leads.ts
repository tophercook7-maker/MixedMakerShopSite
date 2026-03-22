import type { LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";

export type CapturedLeadListItem = {
  id: string;
  business_name: string;
  summary: string;
  badge: "Extension" | "Facebook" | "Opportunity";
  conversion_score: number | null;
  created_at: string | null;
};

const CAPTURED_LIMIT = 6;

function tagSet(row: LeadRowForWorkflow): Set<string> {
  const raw = row.lead_tags;
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.map((t) => String(t || "").trim()).filter(Boolean));
}

function canonicalSource(row: LeadRowForWorkflow): string {
  return String(row.source || row.lead_source || "")
    .trim()
    .toLowerCase();
}

/** Primary pill for cards: Extension > Facebook > Opportunity (tags / score). */
export function capturedLeadBadge(row: LeadRowForWorkflow): CapturedLeadListItem["badge"] {
  const c = canonicalSource(row);
  if (c === "extension") return "Extension";
  const tags = tagSet(row);
  if (tags.has("facebook_only")) return "Facebook";
  if (c.includes("facebook")) return "Facebook";
  return "Opportunity";
}

export function isCapturedLeadRow(row: LeadRowForWorkflow): boolean {
  const c = canonicalSource(row);
  if (c === "extension") return true;
  const tags = tagSet(row);
  if (tags.has("facebook_only")) return true;
  if (tags.has("no_website_opportunity")) return true;
  if (row.conversion_score != null && !Number.isNaN(Number(row.conversion_score))) {
    return Number(row.conversion_score) >= 80;
  }
  return false;
}

function summaryFromRow(row: LeadRowForWorkflow): string {
  const w = String(row.why_this_lead_is_here || "").trim();
  if (w) return w.length > 140 ? `${w.slice(0, 137)}…` : w;
  const r = String(row.opportunity_reason || "").trim();
  if (r) return r.length > 140 ? `${r.slice(0, 137)}…` : r;
  return "Worth reaching out while they’re still warm.";
}

/**
 * Priority queue: extension / facebook_only / no_website_opportunity / conversion ≥ 80.
 * Sort: conversion_score DESC, created_at DESC. Max `limit` (default 6).
 */
export function computeCapturedLeads(rows: LeadRowForWorkflow[], limit = CAPTURED_LIMIT): CapturedLeadListItem[] {
  const eligible = rows.filter((r) => String(r.id || "").trim() && isCapturedLeadRow(r));
  const scored = eligible.map((row) => ({
    id: String(row.id || "").trim(),
    business_name: String(row.business_name || "").trim() || "Business",
    summary: summaryFromRow(row),
    badge: capturedLeadBadge(row),
    conversion_score: row.conversion_score != null && !Number.isNaN(Number(row.conversion_score)) ? Number(row.conversion_score) : null,
    created_at: String(row.created_at || "").trim() || null,
  }));
  scored.sort((a, b) => {
    const as = a.conversion_score ?? Number.NEGATIVE_INFINITY;
    const bs = b.conversion_score ?? Number.NEGATIVE_INFINITY;
    if (bs !== as) return bs - as;
    const at = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bt - at;
  });
  return scored.slice(0, Math.max(0, limit));
}
