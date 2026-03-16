import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type BookingPayload = {
  name?: string;
  business_name?: string;
  email?: string;
  phone?: string;
  preferred_time?: string;
  notes?: string;
};

async function sendBookingConfirmationEmail(toEmail: string, name: string, whenIso: string) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(process.env.BOOKING_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "").trim();
  if (!apiKey || !fromEmail) return { sent: false, reason: "missing_resend_config" };

  const whenText = new Date(whenIso).toLocaleString();
  const subject = "Website review booked";
  const text = [
    `Hi ${name || "there"},`,
    "",
    "Your 15-minute website review is booked.",
    `Time: ${whenText}`,
    "",
    "If you need to reschedule, just reply to this email.",
    "",
    "- MixedMakerShop",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      text,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    return { sent: false, reason: body || "resend_failed" };
  }
  return { sent: true };
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const supabase = createServiceClient(url, key);

  const body = (await request.json().catch(() => ({}))) as BookingPayload;
  const name = String(body.name || "").trim();
  const businessName = String(body.business_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const preferredTime = String(body.preferred_time || "").trim();
  const notes = String(body.notes || "").trim();

  if (!name || !email || !preferredTime) {
    return NextResponse.json({ error: "name, email, and preferred_time are required." }, { status: 400 });
  }

  const start = new Date(preferredTime);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "preferred_time must be a valid datetime." }, { status: 400 });
  }
  const end = new Date(start.getTime() + 15 * 60 * 1000);

  const { data: leadRows } = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id,business_name,email")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  const matchedLead = (leadRows || [])[0] as
    | { id: string; owner_id?: string | null; workspace_id?: string | null; business_name?: string | null }
    | undefined;

  let ownerId = String(matchedLead?.owner_id || "").trim();
  if (!ownerId) {
    const { data: ownerProfile } = await supabase.from("profiles").select("id").limit(1).single();
    ownerId = String(ownerProfile?.id || "").trim();
  }
  if (!ownerId) {
    return NextResponse.json({ error: "No owner profile found for booking." }, { status: 500 });
  }

  const titleName = businessName || matchedLead?.business_name || name;
  const meetingTitle = `Website review: ${titleName}`;
  const eventNotes = notes || `Public booking request from ${name}${phone ? ` (${phone})` : ""}`;

  const { data: eventRow, error: eventError } = await supabase
    .from("calendar_events")
    .insert({
      owner_id: ownerId,
      workspace_id: matchedLead?.workspace_id || null,
      lead_id: matchedLead?.id || null,
      title: meetingTitle,
      event_type: "meeting",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes: eventNotes,
    })
    .select("id,start_time,end_time,lead_id")
    .single();
  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 });

  const emailResult = await sendBookingConfirmationEmail(email, name, start.toISOString());

  return NextResponse.json(
    {
      ok: true,
      event: eventRow,
      lead_attached: Boolean(matchedLead?.id),
      confirmation_email_sent: Boolean(emailResult.sent),
      confirmation_email_reason: emailResult.sent ? null : emailResult.reason,
    },
    { status: 201 }
  );
}
