import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LeadDetailCaseRow = {
  id: string;
  opportunity_id: string | null;
  created_at: string | null;
  status: string | null;
  email: string | null;
  contact_page: string | null;
  phone_from_site: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  notes?: string | null;
  outcome?: string | null;
  opportunity?: {
    id?: string;
    business_name?: string;
    category?: string;
    website?: string;
    opportunity_score?: number;
    opportunity_reason?: string | null;
  } | null;
};

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: joinedRows } = await supabase
    .from("case_files")
    .select(`
      *,
      opportunity:opportunities(
        id,
        business_name,
        category,
        website,
        opportunity_score,
        opportunity_reason
      )
    `)
    .eq("id", id)
    .limit(1);

  const row = (joinedRows || [])[0] as LeadDetailCaseRow | undefined;
  if (!row) notFound();

  const oppId = String(row.opportunity_id || "").trim();
  let opp = row.opportunity || null;
  if ((!opp || !String(opp.business_name || "").trim()) && oppId) {
    const { data: oppRows } = await supabase
      .from("opportunities")
      .select("id,business_name,category,website,opportunity_score,opportunity_reason")
      .eq("id", oppId)
      .limit(1);
    opp = ((oppRows || [])[0] as LeadDetailCaseRow["opportunity"]) || opp;
  }

  const screenshotUrls = [
    row.annotated_screenshot_url,
    row.screenshot_url,
    row.homepage_screenshot_url,
    ...(Array.isArray(row.screenshot_urls) ? row.screenshot_urls : []),
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean);

  const issueListRaw = [
    String(opp?.opportunity_reason || "").trim(),
    ...(Array.isArray(row.audit_issues) ? row.audit_issues : []),
    ...(Array.isArray(row.strongest_problems) ? row.strongest_problems : []),
  ];
  const issueList = Array.from(
    new Set(issueListRaw.map((v) => String(v || "").trim()).filter(Boolean))
  ).slice(0, 8);

  const leadEmail = String(row.email || "").trim().toLowerCase();
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
    : { data: [] as Array<Record<string, unknown>> };

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
              {String(opp?.business_name || "Unknown business")}
            </h1>
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {String(opp?.category || "—")} · Score {Number(opp?.opportunity_score ?? 0) || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/leads" className="admin-btn-ghost">
              Back to Leads
            </Link>
            <Link href="/admin/cases" className="admin-btn-ghost">
              Open Case
            </Link>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Website</h2>
        <div className="text-sm mb-3" style={{ color: "var(--admin-muted)" }}>
          {opp?.website ? (
            <a href={String(opp.website)} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
              {String(opp.website)}
            </a>
          ) : (
            "No website captured"
          )}
        </div>
        {screenshotUrls.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>No screenshots available.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {screenshotUrls.slice(0, 4).map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="block border rounded-md overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
                <img src={url} alt="Lead website screenshot" className="w-full h-auto block" />
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Detected Issues</h2>
        {issueList.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>No issue summary available.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {issueList.map((issue, idx) => (
              <li key={`${issue}-${idx}`}>{issue}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Contact Methods</h2>
        <div className="grid gap-2 md:grid-cols-3 text-sm">
          <div>
            <span style={{ color: "var(--admin-muted)" }}>Email: </span>
            {row.email ? <a href={`mailto:${row.email}`} className="text-[var(--admin-gold)] hover:underline">{row.email}</a> : "—"}
          </div>
          <div>
            <span style={{ color: "var(--admin-muted)" }}>Phone: </span>
            {row.phone_from_site ? <a href={`tel:${row.phone_from_site}`} className="text-[var(--admin-gold)] hover:underline">{row.phone_from_site}</a> : "—"}
          </div>
          <div>
            <span style={{ color: "var(--admin-muted)" }}>Contact Page: </span>
            {row.contact_page ? <a href={row.contact_page} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">Open</a> : "—"}
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Outreach Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/outreach?generate=1&opportunity_id=${encodeURIComponent(oppId)}`} className="admin-btn-ghost">Generate Email</Link>
          <Link href={`/admin/outreach?opportunity_id=${encodeURIComponent(oppId)}`} className="admin-btn-primary">Send Email</Link>
          <Link href="/admin/cases" className="admin-btn-ghost">Open Case</Link>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>Conversation Timeline</h2>
        {(messageRows || []).length === 0 ? (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>No conversation messages recorded yet.</p>
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
        <div className="mt-3 text-xs" style={{ color: "var(--admin-muted)" }}>
          Status: {String(row.status || "new")} · Created: {fmtDate(row.created_at)}
        </div>
      </section>
    </div>
  );
}
