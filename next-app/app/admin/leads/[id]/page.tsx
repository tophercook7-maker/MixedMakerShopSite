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
  activity_summary?: string[] | null;
  website_audit?: {
    mobile_score?: number | null;
    load_time?: number | null;
    issues?: string[] | null;
    checks?: {
      mobile_pagespeed_score?: number | null;
      load_time_seconds?: number | null;
      large_images_over_300kb?: number | null;
      large_images_detected?: boolean | null;
      render_blocking_scripts_detected?: boolean | null;
      missing_meta_description?: boolean | null;
      missing_h1?: boolean | null;
      missing_alt_tags?: boolean | null;
      duplicate_title_detected?: boolean | null;
      missing_call_to_action?: boolean | null;
      cta_present?: boolean | null;
      homepage_phone_visible?: boolean | null;
      homepage_phone_present?: boolean | null;
      missing_viewport_meta?: boolean | null;
      buttons_too_close_detected?: boolean | null;
      layout_not_responsive?: boolean | null;
      small_text_or_crowded_buttons?: boolean | null;
      booking_or_ordering_missing?: boolean | null;
      contact_page_present?: boolean | null;
      contact_click_depth?: number | null;
      broken_links_count?: number | null;
      outdated_layout_signals?: boolean | null;
      excessive_inline_styles?: boolean | null;
      broken_internal_links_count?: number | null;
    } | null;
  } | null;
  website_issues?: Array<{ category?: string | null; issue?: string | null }> | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  desktop_screenshot_url?: string | null;
  mobile_screenshot_url?: string | null;
  contact_page_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  notes?: string | null;
  outcome?: string | null;
};

type OpportunityRow = {
  id: string;
  business_name?: string | null;
  category?: string | null;
  website?: string | null;
  website_status?: string | null;
  opportunity_score?: number | null;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
  close_probability?: "low" | "medium" | "high" | null;
};

function deriveCloseProbability(score: number | null | undefined, category: string | null | undefined, issues: string[]) {
  const s = Number(score ?? 0);
  const cat = String(category || "").toLowerCase();
  const highCat = [
    "dentist",
    "chiropractor",
    "restaurant",
    "cafe",
    "gym",
    "salon",
    "auto repair",
    "plumber",
    "contractor",
  ].some((k) => cat.includes(k));
  const hasCaptureIssue = issues.some((i) => {
    const t = String(i || "").toLowerCase();
    return t.includes("booking") || t.includes("ordering") || t.includes("contact");
  });
  if (s >= 85 || (s >= 70 && highCat && hasCaptureIssue)) return "high";
  if (s >= 60 || highCat) return "medium";
  return "low";
}

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function fmtBool(v: boolean | null | undefined) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

function categorizeWebsiteIssue(rawIssue: string): { category: string; issue: string } {
  const issue = String(rawIssue || "").trim();
  const lower = issue.toLowerCase();
  if (
    lower.includes("pagespeed") ||
    lower.includes("load") ||
    lower.includes("render-blocking") ||
    lower.includes("image optimization")
  ) {
    return { category: "Mobile Performance", issue };
  }
  if (
    lower.includes("call to action") ||
    lower.includes("cta") ||
    lower.includes("contact") ||
    lower.includes("mobile call button")
  ) {
    return { category: "Conversion", issue };
  }
  if (
    lower.includes("viewport") ||
    lower.includes("small text") ||
    lower.includes("buttons too close") ||
    lower.includes("mobile")
  ) {
    return { category: "Mobile UX", issue };
  }
  if (
    lower.includes("meta") ||
    lower.includes("missing h1") ||
    lower.includes("alt tags") ||
    lower.includes("duplicate titles") ||
    lower.includes("seo")
  ) {
    return { category: "SEO", issue };
  }
  if (
    lower.includes("layout") ||
    lower.includes("broken links") ||
    lower.includes("inline styles") ||
    lower.includes("navigation") ||
    lower.includes("ssl")
  ) {
    return { category: "Site Structure", issue };
  }
  return { category: "Website", issue };
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to open lead workspaces.
        </p>
      </section>
    );
  }
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
    .eq("owner_id", ownerId)
    .eq("id", targetId)
    .limit(1);
  const lead = ((leadRows || [])[0] as LeadRow | undefined) || null;

  let caseRow: CaseRow | null = null;

  const linkedOppId = String(lead?.linked_opportunity_id || "").trim();
  if (!caseRow && linkedOppId) {
    const { data: caseByOppRows } = await supabase
      .from("case_files")
      .select(
        "id,opportunity_id,created_at,status,email,contact_page,phone_from_site,activity_summary,website_audit,website_issues,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,desktop_screenshot_url,mobile_screenshot_url,contact_page_screenshot_url,annotated_screenshot_url,notes,outcome"
      )
      .eq("opportunity_id", linkedOppId)
      .order("created_at", { ascending: false })
      .limit(1);
    caseRow = ((caseByOppRows || [])[0] as CaseRow | undefined) || null;
  }

  let oppId = linkedOppId || String(caseRow?.opportunity_id || "").trim();
  let opp: OpportunityRow | null = null;
  if (oppId) {
    const { data: oppRows } = await supabase
      .from("opportunities")
      .select("id,business_name,category,website,website_status,opportunity_score,opportunity_reason,opportunity_signals,close_probability")
      .eq("id", oppId)
      .limit(1);
    opp = ((oppRows || [])[0] as OpportunityRow | undefined) || null;
  }
  if (!opp && lead) {
    const leadWebsite = String(lead.website || "").trim();
    if (leadWebsite) {
      const { data: fallbackOppRows } = await supabase
        .from("opportunities")
        .select("id,business_name,category,website,website_status,opportunity_score,opportunity_reason,opportunity_signals,close_probability")
        .eq("website", leadWebsite)
        .order("opportunity_score", { ascending: false, nullsFirst: false })
        .limit(1);
      opp = ((fallbackOppRows || [])[0] as OpportunityRow | undefined) || null;
      if (opp) {
        oppId = String(opp.id || "").trim() || oppId;
        console.info("[Lead Detail] fallback relationship fetch used", {
          lead_id: targetId,
          fallback: "website",
          resolved_opportunity_id: oppId,
        });
      }
    }
  }
  console.info("[Lead Detail] related data resolved", {
    lead_id: targetId,
    has_lead: Boolean(lead),
    has_case: Boolean(caseRow),
    has_opportunity: Boolean(opp),
    linked_opportunity_id: linkedOppId || null,
    resolved_opportunity_id: oppId || null,
  });

  const desktopScreenshotUrl = String(
    caseRow?.desktop_screenshot_url || caseRow?.homepage_screenshot_url || caseRow?.screenshot_url || ""
  ).trim();
  const mobileScreenshotUrl = String(caseRow?.mobile_screenshot_url || "").trim();
  const contactScreenshotUrl = String(
    caseRow?.contact_page_screenshot_url || caseRow?.annotated_screenshot_url || ""
  ).trim();
  const fallbackScreenshotUrls = (Array.isArray(caseRow?.screenshot_urls) ? caseRow!.screenshot_urls : [])
    .map((v) => String(v || "").trim())
    .filter(Boolean);

  const websiteIssuesFromDb = Array.isArray(caseRow?.website_issues)
    ? caseRow!.website_issues
        .map((entry) => ({
          category: String(entry?.category || "").trim() || "Website",
          issue: String(entry?.issue || "").trim(),
        }))
        .filter((entry) => entry.issue)
    : [];
  const opportunityReasonItems = String(opp?.opportunity_reason || "")
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
  const issueListRaw = [
    ...opportunityReasonItems,
    ...(Array.isArray(opp?.opportunity_signals) ? opp!.opportunity_signals : []),
    ...websiteIssuesFromDb.map((entry) => entry.issue),
    ...(Array.isArray(caseRow?.audit_issues) ? caseRow!.audit_issues : []),
    ...(Array.isArray(caseRow?.strongest_problems) ? caseRow!.strongest_problems : []),
    String(caseRow?.outcome || "").trim(),
    String(caseRow?.notes || "").trim(),
    String(lead?.notes || "").trim(),
  ];
  const issueList = Array.from(
    new Set(issueListRaw.map((v) => String(v || "").trim()).filter(Boolean))
  ).slice(0, 8);
  const structuredIssues =
    websiteIssuesFromDb.length > 0
      ? websiteIssuesFromDb
      : issueList.map((issue) => categorizeWebsiteIssue(issue));
  const topIssues = structuredIssues.slice(0, 3);
  const activitySummary = Array.isArray(caseRow?.activity_summary)
    ? caseRow!.activity_summary.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 6)
    : [];
  const websiteAudit = caseRow?.website_audit && typeof caseRow.website_audit === "object"
    ? caseRow.website_audit
    : null;
  const websiteAuditIssues = Array.isArray(websiteAudit?.issues)
    ? websiteAudit!.issues.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 3)
    : [];
  const auditChecks = (websiteAudit?.checks && typeof websiteAudit.checks === "object")
    ? websiteAudit.checks
    : null;

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
  const displayWebsiteStatus = String(opp?.website_status || "").trim() || "unknown";
  const closeProbability =
    String(opp?.close_probability || "").toLowerCase() ||
    deriveCloseProbability(opp?.opportunity_score ?? lead?.opportunity_score, opp?.category || lead?.industry, issueList);
  const displayCreatedAt = lead?.created_at || caseRow?.created_at || null;
  const caseHref = caseRow?.id ? `/admin/cases/${encodeURIComponent(caseRow.id)}` : null;
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
              Opportunity reason: {String(opp?.opportunity_reason || topIssues[0]?.issue || "No immediate website breakage detected").trim()}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Website: {displayWebsite ? (
                <a href={displayWebsite} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                  {displayWebsite}
                </a>
              ) : "—"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Website status: {displayWebsiteStatus}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Close probability: {closeProbability}
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
            {!desktopScreenshotUrl && !mobileScreenshotUrl && !contactScreenshotUrl && fallbackScreenshotUrls.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No screenshots available.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  {desktopScreenshotUrl ? (
                    <a
                      href={desktopScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border rounded-md overflow-hidden"
                      style={{ borderColor: "var(--admin-border)" }}
                    >
                      <img src={desktopScreenshotUrl} alt="Desktop homepage screenshot" className="w-full h-auto block" />
                      <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Desktop</div>
                    </a>
                  ) : null}
                  {mobileScreenshotUrl ? (
                    <a
                      href={mobileScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border rounded-md overflow-hidden"
                      style={{ borderColor: "var(--admin-border)" }}
                    >
                      <img src={mobileScreenshotUrl} alt="Mobile homepage screenshot" className="w-full h-auto block" />
                      <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Mobile</div>
                    </a>
                  ) : null}
                  {contactScreenshotUrl ? (
                    <a
                      href={contactScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block border rounded-md overflow-hidden"
                      style={{ borderColor: "var(--admin-border)" }}
                    >
                      <img src={contactScreenshotUrl} alt="Contact page screenshot" className="w-full h-auto block" />
                      <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Contact Page</div>
                    </a>
                  ) : null}
                </div>
                {fallbackScreenshotUrls.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {fallbackScreenshotUrls.slice(0, 2).map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block border rounded-md overflow-hidden"
                        style={{ borderColor: "var(--admin-border)" }}
                      >
                        <img src={url} alt="Additional lead screenshot" className="w-full h-auto block" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website Issues
            </h2>
            {topIssues.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No issue summary available.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  Issues detected:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {topIssues.map((entry, idx) => (
                    <li key={`${entry.category}-${entry.issue}-${idx}`}>
                      <span className="font-medium">{entry.category}:</span> {entry.issue}
                    </li>
                  ))}
                </ul>
                <details className="text-sm">
                  <summary className="cursor-pointer text-[var(--admin-gold)]">Expand issue details</summary>
                  <ul className="list-disc pl-5 pt-2 space-y-1">
                    {structuredIssues.slice(3).map((entry, idx) => (
                      <li key={`${entry.category}-${entry.issue}-${idx}`}>
                        <span className="font-medium">{entry.category}:</span> {entry.issue}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Website Audit
            </h2>
            {!websiteAudit ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No structured website audit captured yet.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Mobile score: </span>
                    {Number.isFinite(Number(websiteAudit.mobile_score))
                      ? Number(websiteAudit.mobile_score)
                      : "—"}
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Load time: </span>
                    {Number.isFinite(Number(websiteAudit.load_time))
                      ? `${Number(websiteAudit.load_time).toFixed(2)}s`
                      : "—"}
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-muted)" }}>Broken internal links: </span>
                    {auditChecks?.broken_links_count ?? auditChecks?.broken_internal_links_count ?? "—"}
                  </div>
                </div>
                <ul className="grid gap-1 md:grid-cols-2 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <li>Large images &gt;300KB: {auditChecks?.large_images_over_300kb ?? "—"}</li>
                  <li>Missing meta description: {fmtBool(auditChecks?.missing_meta_description)}</li>
                  <li>Missing H1: {fmtBool(auditChecks?.missing_h1)}</li>
                  <li>CTA present: {fmtBool(auditChecks?.cta_present)}</li>
                  <li>Homepage phone present: {fmtBool(auditChecks?.homepage_phone_present)}</li>
                  <li>Missing viewport meta: {fmtBool(auditChecks?.missing_viewport_meta)}</li>
                  <li>Small text/crowded buttons: {fmtBool(auditChecks?.small_text_or_crowded_buttons)}</li>
                  <li>Contact page present: {fmtBool(auditChecks?.contact_page_present)}</li>
                  <li>Contact click depth: {auditChecks?.contact_click_depth ?? "—"}</li>
                </ul>
                {websiteAuditIssues.length > 0 ? (
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--admin-muted)" }}>
                      Audit issues:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {websiteAuditIssues.map((issue, idx) => (
                        <li key={`${issue}-${idx}`}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                    No audit issues captured.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
              Activity Summary
            </h2>
            {activitySummary.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                No recent Google Business activity signals captured yet.
              </p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {activitySummary.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
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
          initialCategory={displayCategory}
          initialIssue={topIssues[0]?.issue || "No immediate website breakage detected"}
          initialEmail={displayEmail || null}
          initialPhone={displayPhone || null}
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
