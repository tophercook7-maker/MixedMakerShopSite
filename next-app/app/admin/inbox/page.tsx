import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError, type LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";
import {
  computeInboxQueue,
  type InboxLeadInput,
  type InboxMockupInput,
} from "@/lib/crm/inbox-queue";
import { InboxWorkspace } from "@/components/admin/crm/inbox-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function mockupLeadIdFromData(data: Record<string, unknown> | null | undefined): string | null {
  const id = String(data?.lead_id || "").trim();
  return id || null;
}

export default async function AdminInboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();

  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view your inbox.
        </p>
      </section>
    );
  }

  let rows: InboxLeadInput[] = [];
  const selectVariants = [
    "id,business_name,status,email,phone,facebook_url,website,city,category,conversion_score,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview,last_reply_at,is_hot_lead,unread_reply_count,lead_tags,service_type,lead_source,source,first_outreach_sent_at,email_sent,facebook_sent,text_sent,print_pipeline_status,print_request_type,has_website,best_contact_method,suggested_response",
    "id,business_name,status,email,phone,facebook_url,website,city,category,conversion_score,opportunity_score,created_at,next_follow_up_at,follow_up_status,last_reply_preview,last_reply_at,is_hot_lead,unread_reply_count,lead_tags,service_type,lead_source,has_website,best_contact_method,suggested_response",
    "id,business_name,status,email,phone,created_at,next_follow_up_at,last_reply_preview,last_reply_at,unread_reply_count,lead_tags",
    "id,business_name,status,created_at,next_follow_up_at,last_reply_preview,last_reply_at,unread_reply_count",
  ];

  for (const sel of selectVariants) {
    const { data, error } = await supabase
      .from("leads")
      .select(sel)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(800);
    if (!error) {
      rows = (data || []) as unknown as InboxLeadInput[];
      break;
    }
    if (!isMissingColumnError(String(error.message))) {
      console.error("[Inbox] leads query", error);
    }
  }

  void (rows as LeadRowForWorkflow[]);

  const { data: mockupRows, error: mockupErr } = await supabase
    .from("mockup_submissions")
    .select("id,email,created_at,lead_status,status,status_updated_at,updated_at,mockup_data,funnel_source")
    .order("created_at", { ascending: false })
    .limit(300);

  if (mockupErr) {
    console.error("[Inbox] mockup_submissions query", mockupErr);
  }

  const mockups = (mockupRows || []) as InboxMockupInput[];
  const items = computeInboxQueue(rows, mockups);

  const mockupHrefByLeadId: Record<string, string> = {};
  for (const m of mockups) {
    const leadId = mockupLeadIdFromData(m.mockup_data);
    if (leadId) {
      mockupHrefByLeadId[leadId] = `/admin/mockup-submissions/${encodeURIComponent(m.id)}`;
    }
  }

  return <InboxWorkspace items={items} mockupHrefByLeadId={mockupHrefByLeadId} />;
}
