import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeInboxQueue,
  type InboxLeadInput,
  type InboxMockupInput,
} from "@/lib/crm/inbox-queue";
import { isMissingColumnError } from "@/lib/crm/workflow-lead-mapper";

export async function getInboxActionCount(supabase: SupabaseClient, ownerId: string): Promise<number> {
  const scopedOwnerId = ownerId.trim();
  if (!scopedOwnerId) return 0;

  const selectVariants = [
    "id,business_name,status,email,phone,facebook_url,created_at,next_follow_up_at,last_reply_preview,last_reply_at,conversion_score,opportunity_score,unread_reply_count,lead_tags,service_type,lead_source,source,print_pipeline_status,print_request_type",
    "id,business_name,status,email,phone,created_at,next_follow_up_at,last_reply_preview,last_reply_at,conversion_score,opportunity_score,unread_reply_count,lead_tags",
    "id,business_name,status,created_at,next_follow_up_at,last_reply_preview,last_reply_at,unread_reply_count",
  ];

  let rows: InboxLeadInput[] = [];
  for (const sel of selectVariants) {
    const { data, error } = await supabase
      .from("leads")
      .select(sel)
      .eq("owner_id", scopedOwnerId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error) {
      rows = (data || []) as unknown as InboxLeadInput[];
      break;
    }
    if (!isMissingColumnError(String(error.message))) break;
  }

  let mockups: InboxMockupInput[] = [];
  const { data: mockupRows } = await supabase
    .from("mockup_submissions")
    .select("id,email,created_at,lead_status,status,status_updated_at,updated_at,mockup_data")
    .order("created_at", { ascending: false })
    .limit(200);
  mockups = (mockupRows || []) as unknown as InboxMockupInput[];

  return computeInboxQueue(rows, mockups).length;
}
