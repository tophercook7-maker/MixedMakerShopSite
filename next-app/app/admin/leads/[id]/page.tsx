import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadWorkspaceActions } from "@/components/admin/lead-workspace-actions";

type LeadRow = {
  id: string;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  linked_opportunity_id?: string | null;
  opportunity_score?: number | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

type CaseRow = {
  id: string;
  opportunity_id?: string | null;
  created_at?: string | null;
  status?: string | null;
  email?: string | null;
  contact_page?: string | null;
  phone_from_site?: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  notes?: string | null;
  outcome?: string | null;
};

type OpportunityRow = {
  id: string;
  business_name?: string | null;
  category?: string | null;
  website?: string | null;
  opportunity_score?: number | null;
  opportunity_reason?: string | null;
};

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generate?: string; compose?: string }>;
}) {
  const { id } = await params;
  const { generate, compose } = await searchParams;
  const supabase = await createClient();
  const targetId = String(id || "").trim();
  if (!targetId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Lead id is missing.
        </p>
      </section>
    );
  }

  const { data: leadRows } = await supabase
    .from("leads")
    .select(
      "id,business_name,email,phone,website,industry,linked_opportunity_id,opportunity_score,status,notes,created_at"
    )
    .eq("id", targetId)
    .limit(1);
  const lead = ((leadRows || [])[0] as LeadRow | undefined) || null;

  const { data: directCaseRows } = await supabase
    .from("case_files")
    .select(
      "id,opportunity_id,created_at,status,email,contact_page,phone_from_site,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,annotated_screenshot_url,notes,outcome"
    )
    .eq("id", targetId)
    .limit(1);
  let caseRow = ((directCaseRows || [])[0] as CaseRow | undefined) || null;

  const linkedOppId = String(lead?.linked_opportunity_id || caseRow?.opportunity_id || "").trim();
  if (!caseRow && linkedOppId) {
    const { data: caseByOppRows } = await supabase
      .from("case_files")
      .select(
        "id,opportunity_id,created_at,status,email,contact_page,phone_from_site,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,annotated_screenshot_url,notes,outcome"
      )
      .eq("opportunity_id", linkedOppId)
      .order("created_at", { ascending: false })
      .limit(1);
    caseRow = ((caseByOppRows || [])[0] as CaseRow | undefined) || null;
  }

  const oppId = linkedOppId || String(caseRow?.opportunity_id || "").trim();
  let opp: OpportunityRow | null = null;
  if (oppId) {
    const { data: oppRows } = await supabase
      .from("opportunities")
      .select("id,business_name,category,website,opportunity_score,opportunity_reason")
      .eq("id", oppId)
      .limit(1);
    opp = ((oppRows || [])[0] as OpportunityRow | undefined) || null;
  }

  const screenshotUrls = [
    caseRow?.annotated_screenshot_url,
    caseRow?.screenshot_url,
    caseRow?.homepage_screenshot_url,
    ...(Array.isArray(caseRow?.screenshot_urls) ? caseRow!.screenshot_urls : []),
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean);

  const issueListRaw = [
    String(opp?.opportunity_reason || "").trim(),
    ...(Array.isArray(caseRow?.audit_issues) ? caseRow!.audit_issues : []),
    ...(Array.isArray(caseRow?.strongest_problems) ? caseRow!.strongest_problems : []),
    String(caseRow?.outcome || "").trim(),
    String(caseRow?.notes || "").trim(),
    String(lead?.notes || "").trim(),
  ];
  const issueList = Array.from(
    new Set(issueListRaw.map((v) => String(v || "").trim()).filter(Boolean))
  ).slice(0, 8);

  const leadEmail = String(lead?.email || caseRow?.email || "").trim().toLowerCase();
  const leadIdForTimeline = String(lead?.id || "").trim();
  const { data: threadRows } = leadEmail
    ? await supabase
        .from("email_threads")
        .select("id,contact_email,subject,status,last_message_at")
        .eq("contact_email", leadEmail)
        .order("last_message_at", { ascending: false })
        .limit(20)
    : { data: [] as Array<Record<string, unknown>> };
  const threadIds = (threadRows || [])
    .map((r) => String(r.id || "").trim())
    .filter(Boolean);
  const { data: messageRows } = threadIds.length
    ? await supabase
        .from("email_messages")
        .select("id,thread_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })
        .limit(1500)
    : leadIdForTimeline
      ? await supabase
          .from("email_messages")
          .select("id,thread_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
          .eq("lead_id", leadIdForTimeline)
          .order("created_at", { ascending: true })
          .limit(1500)
    : { data: [] as Array<Record<string, unknown>> };

  const hasAnyData = Boolean(lead || caseRow || opp);
  if (!hasAnyData) {
    return (
      <div className="space-y-4">
        <section className="admin-card">
          <h1 className="text-2xl font-bold">Lead workspace</h1>
          <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
            We could not find that lead id yet, but your workflow is still available.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/admin/leads" className="admin-btn-primary">
              Back to Leads
            </Link>
            <Link href="/admin/dashboard" className="admin-btn-ghost">
              Open Dashboard
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const displayBusinessName =
    String(opp?.business_name || "").trim() ||
    String(lead?.business_name || "").trim() ||
    "Unknown business";
  const displayCategory =
    String(opp?.category || "").trim() ||
    String(lead?.industry || "").trim() ||
    "—";
  const displayScore = Number(
    opp?.opportunity_score ??
      lead?.opportunity_score ??
      0
  );
  const displayWebsite =
    String(opp?.website || "").trim() ||
    String(lead?.website || "").trim();
  const displayEmail = String(lead?.email || caseRow?.email || "").trim();
  const displayPhone = String(caseRow?.phone_from_site || lead?.phone || "").trim();
  const displayContactPage = String(caseRow?.contact_page || "").trim();
  const displayStatus = String(lead?.status || caseRow?.status || "new");
  const displayCreatedAt = lead?.created_at || caseRow?.created_at || null;
  const caseHref = caseRow?.id ? `/admin/cases?case_id=${encodeURIComponent(caseRow.id)}` : null;
  const preferredContact = displayEmail
    ? "Email"
    : displayPhone
      ? "Phone"
      : displayContactPage
        ? "Contact Page"
        : "Website";

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
              {displayBusinessName}
            </h1>
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {displayCategory} · Score {displayScore || "—"} · Status {displayStatus.replace(/_/g, " ")}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Created {fmtDate(displayCreatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/leads" className="admin-btn-ghost">
              Back to Leads
            </Link>
            <Link href={caseHref || "/admin/cases"} className="admin-btn-ghost">
              Open Case
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website Preview
            </h2>
            <div className="text-sm mb-3 flex flex-wrap items-center gap-2" style={{ color: "var(--admin-muted)" }}>
              {displayWebsite ? (
                <a href={displayWebsite} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                  {displayWebsite}
                </a>
              ) : (
                <span>No website captured</span>
              )}
              <span className="admin-badge admin-badge-progress">{preferredContact}</span>
            </div>
            {screenshotUrls.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No screenshots available.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {screenshotUrls.slice(0, 4).map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border rounded-md overflow-hidden"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <img src={url} alt="Lead website screenshot" className="w-full h-auto block" />
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Detected Issues
            </h2>
            {issueList.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No issue summary available.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">{issueList[0]}</p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-[var(--admin-gold)]">Expand issue details</summary>
                  <ul className="list-disc pl-5 pt-2 space-y-1">
                    {issueList.slice(1).map((issue, idx) => (
                      <li key={`${issue}-${idx}`}>{issue}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Contact Methods
            </h2>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Email: </span>
                {displayEmail ? (
                  <a href={`mailto:${displayEmail}`} className="text-[var(--admin-gold)] hover:underline">
                    {displayEmail}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Phone: </span>
                {displayPhone ? (
                  <a href={`tel:${displayPhone}`} className="text-[var(--admin-gold)] hover:underline">
                    {displayPhone}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span style={{ color: "var(--admin-muted)" }}>Contact Page: </span>
                {displayContactPage ? (
                  <a href={displayContactPage} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Timeline
            </h2>
            {(messageRows || []).length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No conversation messages recorded yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {(messageRows || []).map((item) => (
                  <li key={String(item.id || "")} className="text-sm border rounded-md p-2" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--admin-muted)" }}>
                      <span>{String(item.direction || "message")}</span>
                      <span>{String(item.delivery_status || "—")}</span>
                      <span>{fmtDate(String(item.received_at || item.sent_at || item.created_at || ""))}</span>
                    </div>
                    <div className="font-medium mt-1">{String(item.subject || "(no subject)")}</div>
                    <div className="text-xs mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-muted)" }}>
                      {String(item.body || "").slice(0, 500) || "(empty body)"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <LeadWorkspaceActions
          leadId={String(lead?.id || targetId)}
          linkedOpportunityId={oppId || null}
          initialBusinessName={displayBusinessName}
          initialIssue={issueList[0] || "Website pain signal detected"}
          initialEmail={displayEmail || null}
          website={displayWebsite || null}
          contactPage={displayContactPage || null}
          caseHref={caseHref}
          initialNotes={[String(lead?.notes || "").trim(), String(caseRow?.notes || "").trim()].filter(Boolean)}
          autoGenerate={generate === "1"}
          autoCompose={compose === "1"}
        />
      </div>
    </div>
  );
}
