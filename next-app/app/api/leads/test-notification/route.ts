import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendTestLeadNotificationEmail } from "@/lib/crm/send-lead-notification-email";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await sendTestLeadNotificationEmail();
  if (!result.ok) {
    console.error("[lead notification test] email failed", result.error);
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
