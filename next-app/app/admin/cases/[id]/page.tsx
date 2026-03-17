import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";

type CaseFileRow = {
  id: string;
  opportunity_id?: string | null;
  created_at?: string | null;
  status?: string | null;
  email?: string | null;
  contact_page?: string | null;
  phone_from_site?: string | null;
  desktop_screenshot_url?: string | null;
  mobile_screenshot_url?: string | null;
  contact_page_screenshot_url?: string | null;
  internal_screenshot_url?: string | null;
  screenshot_url?: string | null;
  homepage_screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
};

type OpportunityRow = {
  id: string;
  business_name?: string | null;
  category?: string | null;
  website?: string | null;
  opportunity_score?: number | null;
  lead_bucket?: string | null;
  opportunity_reason?: string | null;
};

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default async function AdminCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const caseId = String(id || "").trim();
  if (!caseId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Case id is missing.
        </p>
      </section>
    );
  }

  const { data: caseRows } = await supabase
    .from("case_files")
    .select(
      "id,opportunity_id,created_at,status,email,contact_page,phone_from_site,desktop_screenshot_url,mobile_screenshot_url,contact_page_screenshot_url,internal_screenshot_url,screenshot_url,homepage_screenshot_url,screenshot_urls,audit_issues,strongest_problems"
    )
    .eq("id", caseId)
    .limit(1);
  const caseRow = ((caseRows || [])[0] as CaseFileRow | undefined) || null;
  if (!caseRow) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Case not found.
        </p>
      </section>
    );
  }

  let opportunity: OpportunityRow | null = null;
  const oppId = String(caseRow.opportunity_id || "").trim();
  if (oppId) {
    const { data: oppRows } = await supabase
      .from("opportunities")
      .select("id,business_name,category,website,opportunity_score,lead_bucket,opportunity_reason")
      .eq("id", oppId)
      .limit(1);
    opportunity = ((oppRows || [])[0] as OpportunityRow | undefined) || null;
  }

  const desktopScreenshot = String(
    caseRow.desktop_screenshot_url || caseRow.homepage_screenshot_url || caseRow.screenshot_url || ""
  ).trim();
  const mobileScreenshot = String(caseRow.mobile_screenshot_url || "").trim();
  const contactScreenshot = String(caseRow.contact_page_screenshot_url || caseRow.internal_screenshot_url || "").trim();
  const extras = (Array.isArray(caseRow.screenshot_urls) ? caseRow.screenshot_urls : [])
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  const hasScreenshots = Boolean(desktopScreenshot || mobileScreenshot || contactScreenshot || extras.length > 0);

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
              {String(opportunity?.business_name || "Case Detail")}
            </h1>
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {String(opportunity?.category || "—")} · Score {Number(opportunity?.opportunity_score ?? 0) || "—"} · Case{" "}
              {String(caseRow.status || "new").replace(/_/g, " ")}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Lead bucket: <LeadBucketBadge bucket={opportunity?.lead_bucket || null} score={Number(opportunity?.opportunity_score ?? 0)} />
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Opportunity reason: {String(opportunity?.opportunity_reason || "Contact info is hard to find").trim()}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Created {fmtDate(caseRow.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/cases" className="admin-btn-ghost">
              Back to Cases
            </Link>
            {oppId ? (
              <Link href="/admin/leads?source=scout-brain&sort=score_desc" className="admin-btn-ghost">
                Open Leads
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Website Preview
        </h2>
        {!hasScreenshots ? (
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            No screenshots available for this case yet.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              {desktopScreenshot ? (
                <a
                  href={desktopScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="block border rounded-md overflow-hidden"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <img src={desktopScreenshot} alt="Desktop homepage screenshot" className="w-full h-auto block" />
                  <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Desktop</div>
                </a>
              ) : null}
              {mobileScreenshot ? (
                <a
                  href={mobileScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="block border rounded-md overflow-hidden"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <img src={mobileScreenshot} alt="Mobile homepage screenshot" className="w-full h-auto block" />
                  <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Mobile</div>
                </a>
              ) : null}
              {contactScreenshot ? (
                <a
                  href={contactScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="block border rounded-md overflow-hidden"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <img src={contactScreenshot} alt="Contact page screenshot" className="w-full h-auto block" />
                  <div className="px-2 py-1 text-xs" style={{ color: "var(--admin-muted)" }}>Contact Page</div>
                </a>
              ) : null}
            </div>
            {extras.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {extras.slice(0, 2).map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border rounded-md overflow-hidden"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <img src={url} alt="Additional case screenshot" className="w-full h-auto block" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
