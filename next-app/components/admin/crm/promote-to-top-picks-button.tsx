"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { MANUAL_PICK_SOURCE, mergeTopPickTags } from "@/lib/crm/manual-pick-leads";

export function PromoteToTopPicksButton({
  leadId,
  initialTags,
  isTopPick,
  className,
}: {
  leadId: string;
  initialTags: string[] | null | undefined;
  isTopPick: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!leadId) return null;
  if (isTopPick) {
    return (
      <span className={`text-xs font-medium text-emerald-300/90 ${className || ""}`} aria-label="Already in Top Picks">
        ★ Top Picks
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      className={className || "admin-btn-ghost text-xs px-3 py-2 rounded-lg border border-emerald-500/35"}
      onClick={() => {
        void (async () => {
          setBusy(true);
          const lead_tags = mergeTopPickTags(initialTags);
          const r = await patchLeadApi(leadId, {
            source: MANUAL_PICK_SOURCE,
            lead_source: MANUAL_PICK_SOURCE,
            source_label: "Promoted to Top Picks",
            lead_tags,
          });
          setBusy(false);
          if (!r.ok) {
            window.alert(r.error);
            return;
          }
          router.refresh();
        })();
      }}
    >
      {busy ? "Saving…" : "Add to Top Picks"}
    </button>
  );
}
