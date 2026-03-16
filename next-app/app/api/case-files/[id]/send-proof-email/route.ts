import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

type SendBody = {
  annotated_screenshot_url?: string | null;
  detected_issue_summary?: string | null;
};

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing case id." }, { status: 400 });
  }

  const incoming = (await request.json().catch(() => ({}))) as SendBody;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  const accessToken = session?.access_token;
  if (!userId || !accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: caseRows, error: caseError } = await supabase
    .from("case_files")
    .select(`
      id,
      workspace_id,
      opportunity_id,
      email,
      status,
      screenshot_url,
      homepage_screenshot_url,
      annotated_screenshot_url,
      audit_issues,
      notes,
      opportunity:opportunities(
        business_name,
        category,
        website,
        opportunity_score
      )
    `)
    .eq("id", id)
    .limit(1);
  if (caseError) {
    return NextResponse.json({ error: caseError.message }, { status: 500 });
  }
  const caseRow = (caseRows || [])[0] as
    | {
        id: string;
        workspace_id?: string | null;
        opportunity_id?: string | null;
        email?: string | null;
        status?: string | null;
        screenshot_url?: string | null;
        homepage_screenshot_url?: string | null;
        annotated_screenshot_url?: string | null;
        audit_issues?: string[] | null;
        notes?: string | null;
        opportunity?: {
          business_name?: string | null;
          category?: string | null;
          website?: string | null;
          opportunity_score?: number | null;
        } | null;
      }
    | undefined;
  if (!caseRow) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const to = String(caseRow.email || "").trim();
  if (!to) {
    return NextResponse.json({ error: "Lead is missing email address." }, { status: 400 });
  }

  const businessName = String(caseRow.opportunity?.business_name || "there").trim();
  const issueSummary =
    String(incoming.detected_issue_summary || "").trim() ||
    (Array.isArray(caseRow.audit_issues) && caseRow.audit_issues.length
      ? String(caseRow.audit_issues[0] || "").trim()
      : "a potential conversion issue");
  const screenshotUrl =
    String(incoming.annotated_screenshot_url || "").trim() ||
    String(caseRow.annotated_screenshot_url || "").trim() ||
    String(caseRow.screenshot_url || "").trim() ||
    String(caseRow.homepage_screenshot_url || "").trim();

  const subject = "Quick question about your website";
  const body = [
    `Hi ${businessName},`,
    "",
    "I was reviewing your site and noticed something that might be affecting conversions.",
    issueSummary ? `Issue spotted: ${issueSummary}` : "",
    "",
    "I grabbed a quick screenshot showing it.",
    screenshotUrl ? `Screenshot: ${screenshotUrl}` : "",
    "",
    "Would you like me to send it over?",
    "",
    "- Topher",
  ]
    .filter(Boolean)
    .join("\n");

  const baseUrl = scoutBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: "SCOUT_BRAIN_API_BASE_URL is not configured." }, { status: 500 });
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  if (String(caseRow.workspace_id || "").trim()) {
    headers["X-Workspace-Id"] = String(caseRow.workspace_id || "").trim();
  }

  const providerRes = await fetch(`${baseUrl}/outreach/test`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      to,
      subject,
      body,
    }),
    cache: "no-store",
  });
  const providerBody = (await providerRes.json().catch(() => ({}))) as {
    provider_message_id?: string;
    message_id?: string;
    error?: string;
    detail?: string;
  };
  if (!providerRes.ok) {
    return NextResponse.json(
      { error: providerBody.detail || providerBody.error || "Proof email failed to send." },
      { status: providerRes.status }
    );
  }

  const providerMessageId =
    String(providerBody.provider_message_id || providerBody.message_id || "").trim() || null;
  const nowIso = new Date().toISOString();
  const threadKey = `case:${id}`;
  const { data: existingThreads } = await supabase
    .from("email_threads")
    .select("id")
    .eq("owner_id", userId)
    .eq("provider_thread_id", threadKey)
    .limit(1);
  let threadId = String(existingThreads?.[0]?.id || "").trim();
  if (!threadId) {
    const { data: createdThread, error: threadError } = await supabase
      .from("email_threads")
      .insert({
        workspace_id: caseRow.workspace_id || null,
        lead_id: null,
        contact_email: to,
        subject,
        provider_thread_id: threadKey,
        status: "active",
        last_message_at: nowIso,
        owner_id: userId,
      })
      .select("id")
      .limit(1);
    if (threadError) {
      return NextResponse.json({ error: threadError.message }, { status: 500 });
    }
    threadId = String(createdThread?.[0]?.id || "").trim();
  } else {
    await supabase
      .from("email_threads")
      .update({
        status: "active",
        subject,
        contact_email: to,
        last_message_at: nowIso,
      })
      .eq("id", threadId);
  }

  const { error: messageError } = await supabase.from("email_messages").insert({
    thread_id: threadId || null,
    lead_id: null,
    direction: "outbound",
    provider_message_id: providerMessageId,
    subject,
    body,
    delivery_status: "sent",
    sent_at: nowIso,
    owner_id: userId,
  });
  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  await supabase
    .from("case_files")
    .update({
      status: "contacted",
      notes: [String(caseRow.notes || "").trim(), `Proof email sent ${nowIso}`]
        .filter(Boolean)
        .join("\n"),
    })
    .eq("id", id);

  return NextResponse.json({
    ok: true,
    message: "Proof email sent.",
    provider_message_id: providerMessageId,
    thread_id: threadId || null,
  });
}

