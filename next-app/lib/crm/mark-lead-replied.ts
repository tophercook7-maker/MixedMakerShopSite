/** Shared payload for marking a lead as replied (manual or UI). */

export const REPLY_PREVIEW_MAX = 200;

export function truncateReplyPreview(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length <= REPLY_PREVIEW_MAX ? t : `${t.slice(0, REPLY_PREVIEW_MAX - 1)}…`;
}

export type BuildMarkLeadRepliedInput = {
  /** ISO timestamp; defaults to now */
  nowIso?: string;
  /** Optional pasted inbound text */
  replyPreview?: string | null;
  /** When true, do not increment `unread_reply_count` */
  alreadyReplied?: boolean;
  /** Current DB unread count (for increment) */
  currentUnread?: number | null;
};

/**
 * Full patch: pause automation, stop sequence, clear scheduled follow-up, surface in replied state.
 */
export function buildMarkLeadRepliedPatch(input: BuildMarkLeadRepliedInput = {}): Record<string, unknown> {
  const now = input.nowIso ?? new Date().toISOString();
  const previewRaw = input.replyPreview != null ? String(input.replyPreview).trim() : "";
  const preview = previewRaw ? truncateReplyPreview(previewRaw) : undefined;

  const prevU = Number(input.currentUnread);
  const baseUnread = Number.isFinite(prevU) ? Math.max(0, prevU) : 0;
  const nextUnread = input.alreadyReplied ? baseUnread : baseUnread + 1;

  const patch: Record<string, unknown> = {
    status: "replied",
    automation_paused: true,
    sequence_active: false,
    replied_at: now,
    last_reply_at: now,
    is_hot_lead: true,
    recommended_next_action: "Reply to Lead",
    next_follow_up_at: null,
    follow_up_status: "completed",
    unread_reply_count: nextUnread,
  };
  if (preview) patch.last_reply_preview = preview;
  return patch;
}

/** When lead is already `replied`, only refresh preview + timestamp. */
export function buildReplySnippetOnlyPatch(preview: string, nowIso?: string): Record<string, unknown> | null {
  const p = truncateReplyPreview(preview);
  if (!p) return null;
  return {
    last_reply_preview: p,
    last_reply_at: nowIso ?? new Date().toISOString(),
  };
}
