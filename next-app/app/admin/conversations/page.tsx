import { createClient } from "@/lib/supabase/server";
import {
  ConversationsWorkspace,
  type CrmConversationLead,
  type CrmMessage,
} from "@/components/admin/crm/conversations-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminConversationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view conversations.
        </p>
      </section>
    );
  }

  const { data: messagesRaw, error: msgErr } = await supabase
    .from("email_messages")
    .select("id,lead_id,direction,subject,body,created_at,sent_at,received_at")
    .eq("owner_id", ownerId)
    .not("lead_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(650);

  if (msgErr) {
    console.error("[Conversations] messages load failed", msgErr);
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Could not load messages.
        </p>
      </section>
    );
  }

  const messages = (messagesRaw || []) as CrmMessage[];
  const leadIds = Array.from(
    new Set(messages.map((m) => String(m.lead_id || "").trim()).filter(Boolean))
  );

  let leadRows: Record<string, unknown>[] = [];
  if (leadIds.length) {
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id,business_name,status,conversion_score,website,has_website,next_follow_up_at,last_reply_preview,unread_reply_count,recommended_next_action,sequence_active,automation_paused"
      )
      .eq("owner_id", ownerId)
      .in("id", leadIds);
    if (error) {
      console.error("[Conversations] leads load failed", error);
    } else {
      leadRows = (data || []) as Record<string, unknown>[];
    }
  }

  let reviews: { lead_id: string; website_grade: string | null; website_status: string | null }[] = [];
  if (leadIds.length) {
    const { data } = await supabase
      .from("website_reviews")
      .select("lead_id,website_grade,website_status")
      .eq("owner_id", ownerId)
      .in("lead_id", leadIds);
    reviews = (data || []) as typeof reviews;
  }
  const reviewByLead = new Map(reviews.map((r) => [r.lead_id, r]));

  const latestTs = new Map<string, number>();
  for (const m of messages) {
    const lid = String(m.lead_id || "").trim();
    if (!lid) continue;
    const t = new Date(m.created_at).getTime();
    const prev = latestTs.get(lid) || 0;
    if (t > prev) latestTs.set(lid, t);
  }

  const leads: CrmConversationLead[] = leadRows
    .map((row) => {
      const id = String(row.id || "").trim();
      const rev = reviewByLead.get(id);
      return {
        id,
        business_name: String(row.business_name || "Lead").trim() || "Lead",
        status: String(row.status || "new"),
        conversion_score: row.conversion_score == null ? null : Number(row.conversion_score),
        website: String(row.website || "").trim() || null,
        has_website: row.has_website == null ? null : Boolean(row.has_website),
        next_follow_up_at: String(row.next_follow_up_at || "").trim() || null,
        last_reply_preview: String(row.last_reply_preview || "").trim() || null,
        unread_reply_count:
          row.unread_reply_count == null ? null : Math.max(0, Number(row.unread_reply_count)),
        recommended_next_action: String(row.recommended_next_action || "").trim() || null,
        sequence_active: row.sequence_active == null ? null : Boolean(row.sequence_active),
        automation_paused: row.automation_paused == null ? null : Boolean(row.automation_paused),
        website_grade: rev?.website_grade ? String(rev.website_grade) : null,
        website_status: rev?.website_status ? String(rev.website_status) : null,
      };
    })
    .sort((a, b) => (latestTs.get(b.id) || 0) - (latestTs.get(a.id) || 0));

  return (
    <div className="space-y-4">
      <section className="admin-card">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--admin-fg)" }}>
          Conversations
        </h1>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Your email and reply history in one place. New replies are easy to spot.
        </p>
      </section>
      <ConversationsWorkspace leads={leads} messages={messages} />
    </div>
  );
}
