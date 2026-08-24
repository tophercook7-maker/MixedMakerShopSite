import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SendQueueList, { type QueueLead } from "./SendQueueList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function previewUrl(l: Record<string, unknown>): string {
  for (const f of [l.recommended_next_action, l.notes]) {
    const m = String(f || "").match(/https?:\/\/mms-previews\.pages\.dev\/[^\s)]+/);
    if (m) return m[0];
  }
  return "";
}

export default async function SendQueuePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin");
  const ownerId = String(user.id || "");

  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id,business_name,email,city,lead_tags,recommended_next_action,notes")
    .eq("owner_id", ownerId)
    .eq("source", "atlas-outbound-preview")
    .order("business_name")
    .limit(500);

  const leads: QueueLead[] = (data || [])
    .map((l) => {
      const tags = Array.isArray((l as { lead_tags?: unknown[] }).lead_tags)
        ? (l as { lead_tags: unknown[] }).lead_tags.map((t) => String(t))
        : [];
      const state: QueueLead["state"] = tags.includes("sent-by-queue")
        ? "sent"
        : tags.includes("approved-to-send")
          ? "approved"
          : "pending";
      return {
        id: String((l as { id: string }).id),
        business_name: String((l as { business_name?: string }).business_name || "—"),
        email: String((l as { email?: string }).email || ""),
        city: ((l as { city?: string | null }).city ?? null) as string | null,
        preview: previewUrl(l as Record<string, unknown>),
        state,
      };
    })
    .filter((l) => l.email && l.preview);

  // Pending first, then approved, then sent — action items on top.
  const rank = { pending: 0, approved: 1, sent: 2 } as const;
  leads.sort((a, b) => rank[a.state] - rank[b.state] || a.business_name.localeCompare(b.business_name));

  return <SendQueueList initial={leads} />;
}
