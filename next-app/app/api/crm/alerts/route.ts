import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayIso(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ownerId = String(user.id || "").trim();
  const supabase = await createClient();
  const start = startOfTodayIso();
  const end = endOfTodayIso();

  type Alert = {
    id: string;
    kind: "reply" | "follow_up_due" | "send_failed" | "inbound_email";
    title: string;
    detail?: string;
    lead_id?: string;
    business_name?: string;
    href?: string;
  };

  const alerts: Alert[] = [];

  const selectVariants = [
    "id,business_name,status,last_reply_preview,next_follow_up_at,last_outreach_status,email_sent",
    "id,business_name,status,next_follow_up_at,last_outreach_status",
  ];

  let rows: Record<string, unknown>[] = [];
  for (const sel of selectVariants) {
    const { data, error } = await supabase.from("leads").select(sel).eq("owner_id", ownerId).limit(200);
    if (!error && data) {
      rows = data as unknown as Record<string, unknown>[];
      break;
    }
  }

  const now = Date.now();
  for (const row of rows) {
    const id = String(row.id || "").trim();
    const name = String(row.business_name || "Lead").trim();
    const status = String(row.status || "").toLowerCase();
    const lastOutreach = String(row.last_outreach_status || "").toLowerCase();
    const preview = String(row.last_reply_preview || "").trim();
    const nextFu = row.next_follow_up_at ? new Date(String(row.next_follow_up_at)).getTime() : NaN;

    if (lastOutreach === "failed") {
      alerts.push({
        id: `fail-${id}`,
        kind: "send_failed",
        title: "Send failed",
        detail: `${name} — last email send failed. Retry or check Scout / Resend.`,
        lead_id: id,
        business_name: name,
        href: `/admin/leads/${id}`,
      });
    }

    if (status === "replied" || preview) {
      alerts.push({
        id: `reply-${id}`,
        kind: "reply",
        title: "Lead replied",
        detail: preview ? preview.slice(0, 120) : `${name} is marked as replied.`,
        lead_id: id,
        business_name: name,
        href: `/admin/leads/${id}`,
      });
    }

    if (Number.isFinite(nextFu) && nextFu <= new Date(end).getTime() && nextFu >= new Date(start).getTime() - 7 * 86400000) {
      if (nextFu <= now + 86400000 && status !== "replied" && status !== "won" && status !== "lost") {
        alerts.push({
          id: `fu-${id}`,
          kind: "follow_up_due",
          title: "Follow-up due",
          detail: `${name} — follow-up window: ${new Date(nextFu).toLocaleString()}`,
          lead_id: id,
          business_name: name,
          href: `/admin/leads/${id}`,
        });
      }
    }
  }

  const dedup = new Map<string, Alert>();
  for (const a of alerts) {
    if (!dedup.has(a.id)) dedup.set(a.id, a);
  }

  return NextResponse.json({
    items: Array.from(dedup.values()).slice(0, 50),
    scaffold: {
      inbound_email: "Connect your inbox to surface new replies here automatically.",
    },
  });
}
