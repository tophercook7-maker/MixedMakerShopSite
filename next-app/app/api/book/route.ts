import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isHardBlockEventType } from "@/lib/calendar-events";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";

type BookingPayload = {
  name?: string;
  business_name?: string;
  email?: string;
  phone?: string;
  preferred_time?: string;
  notes?: string;
};

function chooseWorkspaceId(candidate: string | null | undefined): string {
  return String(candidate || process.env.SCOUT_BRAIN_WORKSPACE_ID || "").trim();
}

async function findNextOpening(
  supabase: any,
  ownerId: string,
  fromDate: Date,
  daysAhead = 14
) {
  const openHour = Number(process.env.BOOKING_OPEN_HOUR || 9);
  const closeHour = Number(process.env.BOOKING_CLOSE_HOUR || 17);
  const slotMinutes = Number(process.env.BOOKING_SLOT_MINUTES || 30);
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
    const day = new Date(fromDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const dayIso = day.toISOString().slice(0, 10);
    const dayStart = new Date(`${dayIso}T00:00:00.000Z`);
    const dayEnd = new Date(`${dayIso}T23:59:59.999Z`);
    const { data: rows } = await supabase
      .from("calendar_events")
      .select("id,event_type,start_time,end_time")
      .eq("owner_id", ownerId)
      .lt("start_time", dayEnd.toISOString())
      .or(`end_time.is.null,end_time.gt.${dayStart.toISOString()}`);
    const hardBlocks = ((rows || []) as Array<Record<string, unknown>>)
      .filter((row) => isHardBlockEventType(String(row.event_type || "")))
      .map((row) => ({
        start: new Date(String(row.start_time || "")),
        end: new Date(String(row.end_time || row.start_time || "")),
      }))
      .filter((b) => !Number.isNaN(b.start.getTime()) && !Number.isNaN(b.end.getTime()) && b.end > b.start);
    for (let hour = openHour; hour < closeHour; hour += 1) {
      for (let min = 0; min < 60; min += slotMinutes) {
        const slotStart = new Date(
          `${dayIso}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00.000Z`
        );
        if (slotStart.getTime() < fromDate.getTime()) continue;
        const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);
        if (
          slotEnd.getUTCHours() > closeHour ||
          (slotEnd.getUTCHours() === closeHour && slotEnd.getUTCMinutes() > 0)
        ) {
          continue;
        }
        const conflict = hardBlocks.some((block) => slotStart < block.end && slotEnd > block.start);
        if (!conflict) return { start_time: slotStart.toISOString(), end_time: slotEnd.toISOString() };
      }
    }
  }
  return null;
}

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

  const { data: ownerProfile } = await supabase.from("profiles").select("id").limit(1).single();
  const ownerId = String(ownerProfile?.id || "").trim();
  if (!ownerId) {
    return NextResponse.json({ error: "No owner profile found for booking." }, { status: 500 });
  }

  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const whenLabel = start.toLocaleString();
  const bookingNotesForLead = [
    "Public website review booking",
    `Slot (UTC): ${startIso}`,
    `Slot (local display): ${whenLabel}`,
    phone ? `Phone: ${phone}` : null,
    notes ? `Booker notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { data: overlapRows, error: overlapError } = await supabase
    .from("calendar_events")
    .select("id,event_type,title,start_time,end_time")
    .eq("owner_id", ownerId)
    .lt("start_time", endIso)
    .or(`end_time.is.null,end_time.gt.${startIso}`)
    .limit(50);
  if (overlapError) {
    return NextResponse.json({ error: overlapError.message }, { status: 500 });
  }
  const hardConflict = (overlapRows || []).some((row) => isHardBlockEventType(String(row.event_type || "")));
  if (hardConflict) {
    const nextOpening = await findNextOpening(supabase, ownerId, new Date(start.getTime() + 5 * 60 * 1000));
    return NextResponse.json(
      {
        error: "That time is not available. Here is the next available opening.",
        next_available_opening: nextOpening,
      },
      { status: 409 }
    );
  }

  const crm = await insertCanonicalInboundLead(supabase, ownerId, {
    business_name: businessName || name,
    contact_name: name,
    email,
    phone: phone || null,
    notes: bookingNotesForLead,
    why_this_lead_is_here:
      "Booked a 15-minute website review via the public booking page (mixedmakershop.com/book).",
    source: "public_booking",
    lead_source: "public_booking",
    status: "new",
    has_website: false,
  });

  let resolvedLeadId: string | null = null;
  let crmDuplicateSkipped: boolean | undefined;
  if (crm.ok) {
    resolvedLeadId = crm.lead_id;
    crmDuplicateSkipped = crm.duplicate_skipped;
  } else {
    console.error("[book] canonical inbound lead failed (calendar will still be attempted)", crm.error);
  }

  let leadWorkspaceId: string | null | undefined;
  let leadBusinessName: string | null | undefined;
  if (resolvedLeadId) {
    const { data: leadRow } = await supabase
      .from("leads")
      .select("workspace_id,business_name")
      .eq("id", resolvedLeadId)
      .eq("owner_id", ownerId)
      .maybeSingle();
    leadWorkspaceId = leadRow?.workspace_id ?? null;
    leadBusinessName = leadRow?.business_name ?? null;
  }

  const titleName = businessName || String(leadBusinessName || "").trim() || name;
  const meetingTitle = `Website review: ${titleName}`;
  const eventNotes = notes || `Public booking request from ${name}${phone ? ` (${phone})` : ""}`;

  const workspaceId = chooseWorkspaceId(leadWorkspaceId);
  if (!workspaceId) {
    return NextResponse.json(
      { error: "Workspace not configured for calendar booking. Set SCOUT_BRAIN_WORKSPACE_ID or create a lead with workspace." },
      { status: 500 }
    );
  }

  const { data: eventRow, error: eventError } = await supabase
    .from("calendar_events")
    .insert({
      owner_id: ownerId,
      workspace_id: workspaceId,
      lead_id: resolvedLeadId,
      title: meetingTitle,
      event_type: "appointment",
      is_blocking: true,
      source: "public_booking",
      start_time: startIso,
      end_time: endIso,
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
      lead_id: resolvedLeadId,
      lead_attached: Boolean(resolvedLeadId),
      lead_duplicate_skipped: crmDuplicateSkipped,
      confirmation_email_sent: Boolean(emailResult.sent),
      confirmation_email_reason: emailResult.sent ? null : emailResult.reason,
    },
    { status: 201 }
  );
}
