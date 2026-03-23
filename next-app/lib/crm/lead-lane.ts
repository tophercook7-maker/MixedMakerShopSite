/**
 * CRM folder helpers — re-export from `lead-buckets.ts` for existing imports.
 * List UI uses folder strip labels in `FOLDER_LABELS` / `CRM_LANE_LABELS`.
 */
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import {
  LEAD_FOLDER_BUCKETS,
  FOLDER_LABELS,
  computePrimaryLeadFolder,
  computeLeadFolderBundle,
  computeContactReadiness as computeContactReadinessInner,
  computeSimplifiedNextStep as computeSimplifiedNextStepInner,
  leadHasContactPath as leadHasContactPathInner,
  type LeadFolderBucket,
  type LeadFolderInput,
  type ContactReadiness,
  type SimplifiedNextStep,
} from "@/lib/crm/lead-buckets";

export const CRM_LEAD_LANES = LEAD_FOLDER_BUCKETS;
export type CrmLeadLane = LeadFolderBucket;
export const CRM_LANE_LABELS = FOLDER_LABELS;

export type LeadLaneInput = LeadFolderInput;
export type { ContactReadiness, SimplifiedNextStep };

export function leadHasContactPath(input: LeadLaneInput): boolean {
  return leadHasContactPathInner(input);
}

export function computeContactReadiness(input: LeadLaneInput): ContactReadiness {
  return computeContactReadinessInner(input);
}

export function computeSimplifiedNextStep(lane: CrmLeadLane, input: LeadLaneInput): SimplifiedNextStep {
  return computeSimplifiedNextStepInner(lane, input);
}

export function computePrimaryLeadLane(input: LeadLaneInput): CrmLeadLane {
  return computePrimaryLeadFolder(input);
}

export function computeLeadLaneBundle(input: LeadLaneInput) {
  return computeLeadFolderBundle(input);
}

/** Compact contact signal chips for list cards (order: email, Facebook, phone, website). */
export function formatContactSignalsLine(input: LeadLaneInput): string {
  const parts: string[] = [];
  const email = String(input.email ?? "").trim();
  const fb = String(input.facebook_url ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const website = String(input.website ?? "").trim();
  parts.push(email ? "Has email" : "No email");
  parts.push(fb ? "Has Facebook" : "No Facebook");
  parts.push(phone ? "Has phone" : "No phone");
  parts.push(leadHasStandaloneWebsite(website) ? "Has website" : "No website");
  if (!leadHasContactPathInner(input)) return "No contact info yet · " + parts.join(" · ");
  return parts.join(" · ");
}
