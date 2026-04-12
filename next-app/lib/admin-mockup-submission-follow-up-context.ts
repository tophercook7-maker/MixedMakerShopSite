import { getPreviewSnapshotFromMockupData } from "@/lib/free-mockup-preview-snapshot";
import type { MockupFollowUpDraftInput } from "@/lib/mockup-follow-up-draft";

/**
 * Minimal mockup_submissions row shape needed to build the same follow-up input as the admin detail page.
 */
export type MockupSubmissionFollowUpRow = {
  email: string;
  mockup_data: Record<string, unknown> | null;
  desired_outcomes?: unknown;
  top_services_to_feature?: string | null;
  what_makes_you_different?: string | null;
};

/**
 * Single source of truth for follow-up draft inputs from a saved submission (admin page + Gmail draft API).
 */
export function buildMockupFollowUpDraftInputFromSubmissionRow(
  row: MockupSubmissionFollowUpRow,
): { input: MockupFollowUpDraftInput; recipientEmail: string } {
  const md = (row.mockup_data || {}) as Record<string, unknown>;
  const previewSnap = getPreviewSnapshotFromMockupData(md);
  const snap =
    md && typeof md === "object" && "snapshot" in md && md.snapshot && typeof md.snapshot === "object"
      ? (md.snapshot as Record<string, unknown>)
      : null;

  const contactName = typeof md.contact_name === "string" ? md.contact_name : "";
  const outcomes = row.desired_outcomes ?? snap?.desired_outcomes;
  const diff =
    row.what_makes_you_different ??
    (typeof snap?.what_makes_you_different === "string" ? snap.what_makes_you_different : "");

  const desiredOutcomeIds = Array.isArray(outcomes)
    ? outcomes.map((x) => String(x || "").trim()).filter(Boolean)
    : [];

  const input: MockupFollowUpDraftInput = {
    contactName,
    businessName: String(snap?.business_name || ""),
    city: String(snap?.city || ""),
    phone: String(snap?.phone || ""),
    differentiator: String(diff || ""),
    desiredOutcomeIds,
    previewSnapshot: previewSnap,
  };

  return { input, recipientEmail: String(row.email || "").trim().toLowerCase() };
}
