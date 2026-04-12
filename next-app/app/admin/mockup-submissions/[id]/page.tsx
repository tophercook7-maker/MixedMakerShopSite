import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { MockupLeadStatusBadge } from "@/components/admin/mockup-lead-status-badge";
import { MockupPipelineQuickActions } from "@/components/admin/mockup-pipeline-quick-actions";
import { MockupSubmissionGeneratePanel } from "@/components/admin/mockup-submission-generate-panel";
import { MockupSubmissionStatusSelect } from "@/components/admin/mockup-submission-status-select";
import type { AdminStoredGeneratedMockup } from "@/lib/admin-mockup-quick-generate";
import { FUNNEL_DESIGN_DIRECTION_OPTIONS } from "@/lib/funnel-design-directions";
import { FUNNEL_DESIRED_OUTCOME_LABELS, type FunnelDesiredOutcomeId } from "@/lib/funnel-desired-outcomes";
import { getPreviewSnapshotFromMockupData } from "@/lib/free-mockup-preview-snapshot";
import { buildMockupFollowUpDraftInputFromSubmissionRow } from "@/lib/admin-mockup-submission-follow-up-context";
import {
  MOCKUP_LEAD_STATUS_HINTS,
  parseMockupLeadStatus,
} from "@/lib/lead-status";
import { createClient } from "@/lib/supabase/server";
import { MockupFollowUpDraftPanel } from "@/components/admin/mockup-follow-up-draft-panel";
import { MockupStaleLeadBanner } from "@/components/admin/mockup-stale-lead-banner";
import { getLeadStaleState, MOCKUP_STALE_SUGGESTED_NUDGE } from "@/lib/lead-stale";

type Row = {
  id: string;
  email: string;
  mockup_data: Record<string, unknown> | null;
  notes: string | null;
  status: string;
  lead_status?: string | null;
  status_updated_at?: string | null;
  source: string;
  funnel_source: string | null;
  created_at: string;
  updated_at: string;
  selected_template_key?: string | null;
  desired_outcomes?: unknown;
  top_services_to_feature?: string | null;
  what_makes_you_different?: string | null;
  special_offer_or_guarantee?: string | null;
  anything_to_avoid?: string | null;
  anything_else_i_should_know?: string | null;
  admin_generated_mockup?: unknown;
};

function parseAdminGenerated(raw: unknown): AdminStoredGeneratedMockup | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Partial<AdminStoredGeneratedMockup>;
  if (!o.sampleDraft || typeof o.sampleDraft !== "object" || !o.structured || typeof o.structured !== "object") {
    return null;
  }
  return o as AdminStoredGeneratedMockup;
}

function labelForDirection(key: string): string {
  const f = FUNNEL_DESIGN_DIRECTION_OPTIONS.find((o) => o.id === key);
  return f ? `${f.label} (${key})` : key || "—";
}

function formatOutcomes(raw: unknown): string {
  if (!Array.isArray(raw) || !raw.length) return "—";
  return raw
    .map((x) => {
      const id = String(x || "").trim();
      return FUNNEL_DESIRED_OUTCOME_LABELS[id as FunnelDesiredOutcomeId] || id;
    })
    .join(", ");
}

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-6" id={id}>
      <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const v = value?.trim();
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
        {label}
      </p>
      <p className="text-sm whitespace-pre-wrap mt-1" style={{ color: "var(--admin-fg)" }}>
        {v || "—"}
      </p>
    </div>
  );
}

export default async function AdminMockupSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submissionId = String(id || "").trim();
  if (!submissionId) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view this submission.
        </p>
      </section>
    );
  }

  const { data: row, error } = await supabase.from("mockup_submissions").select("*").eq("id", submissionId).maybeSingle();

  if (error) {
    console.error("[admin mockup-submissions] detail failed", error.message);
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "#f87171" }}>
          Could not load submission.
        </p>
      </section>
    );
  }

  if (!row) notFound();

  const r = row as unknown as Row;
  const md = (r.mockup_data || {}) as Record<string, unknown>;
  const previewSnap = getPreviewSnapshotFromMockupData(md);
  const snap =
    md && typeof md === "object" && "snapshot" in md && md.snapshot && typeof md.snapshot === "object"
      ? (md.snapshot as Record<string, unknown>)
      : null;
  const contactName = typeof md.contact_name === "string" ? md.contact_name : "";
  const previewUrl = typeof md.preview_url === "string" ? md.preview_url : "";

  const dir =
    r.selected_template_key ||
    (typeof snap?.selected_template_key === "string" ? snap.selected_template_key : "") ||
    "";
  const outcomes = r.desired_outcomes ?? snap?.desired_outcomes;
  const topSvc = r.top_services_to_feature ?? (typeof snap?.top_services_to_feature === "string" ? snap.top_services_to_feature : "");
  const diff =
    r.what_makes_you_different ??
    (typeof snap?.what_makes_you_different === "string" ? snap.what_makes_you_different : "");
  const offer =
    r.special_offer_or_guarantee ??
    (typeof snap?.special_offer_or_guarantee === "string" ? snap.special_offer_or_guarantee : "");
  const avoid = r.anything_to_avoid ?? (typeof snap?.anything_to_avoid === "string" ? snap.anything_to_avoid : "");
  const extra =
    r.anything_else_i_should_know ??
    (typeof snap?.anything_else_i_should_know === "string" ? snap.anything_else_i_should_know : "");

  const json = JSON.stringify(r.mockup_data ?? {}, null, 2);
  const adminGenerated = parseAdminGenerated(r.admin_generated_mockup);

  const { input: followUpInput, recipientEmail } = buildMockupFollowUpDraftInputFromSubmissionRow(r);
  const followUpInputJson = JSON.stringify(followUpInput);
  const pipeline = parseMockupLeadStatus(r.lead_status ?? r.status);
  const stale = getLeadStaleState({
    pipeline,
    createdAt: r.created_at,
    statusUpdatedAt: r.status_updated_at,
    updatedAt: r.updated_at,
  });

  return (
    <section className="admin-card">
      <MockupSubmissionGeneratePanel submissionId={r.id} initial={adminGenerated} />
      <MockupStaleLeadBanner
        isStale={stale.isStale}
        reason={stale.reason}
        severity={stale.severity}
        suggestedMessage={MOCKUP_STALE_SUGGESTED_NUDGE}
      />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/mockup-submissions"
            className="text-xs hover:text-[var(--admin-gold)]"
            style={{ color: "var(--admin-muted)" }}
          >
            ← All mockup submissions
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              {r.email}
            </h1>
            <MockupLeadStatusBadge status={pipeline} />
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            <span className="mr-3">Created {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</span>
            <span>Updated {r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}</span>
          </p>
          {r.status_updated_at ? (
            <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
              Pipeline updated {new Date(r.status_updated_at).toLocaleString()}
            </p>
          ) : null}
          <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
            {MOCKUP_LEAD_STATUS_HINTS[pipeline]}
          </p>
          <p className="text-xs mt-2 max-w-xl leading-relaxed" style={{ color: "var(--admin-muted)" }}>
            Status helps track where this lead is in your workflow. Change it anytime — you stay in control.
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
            Source: {r.source}
            {r.funnel_source ? (
              <>
                {" "}
                · funnel: <span className="font-semibold text-[var(--admin-gold)]">{r.funnel_source}</span>
              </>
            ) : null}
          </p>
          {previewUrl ? (
            <p className="text-sm mt-2">
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                Open public preview
              </a>
            </p>
          ) : null}
        </div>
        <MockupSubmissionStatusSelect submissionId={r.id} initialPipelineStatus={pipeline} />
      </div>

      <Section title="Follow-up draft" id="follow-up-draft">
        <MockupFollowUpDraftPanel
          submissionId={r.id}
          recipientEmail={recipientEmail}
          inputJson={followUpInputJson}
        />
        <MockupPipelineQuickActions submissionId={r.id} />
        <div
          className="mt-4 rounded-lg border border-[rgba(201,97,44,0.2)] p-4 text-sm leading-relaxed"
          style={{ color: "var(--admin-muted)", background: "rgba(0,0,0,0.12)" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
            If no response (~2 days)
          </p>
          <p className="whitespace-pre-wrap">
            {`Hey — just wanted to follow up on this.\n\nI’ve got an idea for your site that I think would work really well. Let me know if you still want me to put it together.\n\n– Topher`}
          </p>
          <p className="text-xs mt-3" style={{ color: "var(--admin-muted)" }}>
            After you send, use <strong style={{ color: "var(--admin-fg)" }}>Quick status → Mark contacted</strong> or the pipeline dropdown.
          </p>
        </div>
      </Section>

      <Section title="Business info">
        <div className="grid sm:grid-cols-2 gap-2 rounded-lg border border-[rgba(201,97,44,0.2)] p-4 bg-[rgba(0,0,0,0.2)]">
          <Field label="Contact name" value={contactName} />
          <Field label="Business name" value={String(snap?.business_name || "")} />
          <Field label="Business type / category" value={String(snap?.category || "")} />
          <Field label="City / service area" value={String(snap?.city || "")} />
          <Field label="Email (submission)" value={r.email} />
          <Field label="Phone" value={String(snap?.phone || "")} />
          <Field label="Current website" value={String(snap?.website_url || "")} />
        </div>
      </Section>

      <Section title="Desired outcomes">
        <p className="text-sm whitespace-pre-wrap rounded-lg border border-[rgba(201,97,44,0.2)] p-3 bg-[rgba(0,0,0,0.2)]">
          {formatOutcomes(outcomes)}
        </p>
      </Section>

      <Section title="Positioning">
        <div className="rounded-lg border border-[rgba(201,97,44,0.2)] p-4 bg-[rgba(0,0,0,0.2)] space-y-3">
          <Field label="Top services to feature" value={String(topSvc || snap?.services_text || "")} />
          <Field label="What makes you different" value={String(diff || "")} />
        </div>
      </Section>

      <Section title="Offer / differentiators">
        <div className="rounded-lg border border-[rgba(201,97,44,0.2)] p-4 bg-[rgba(0,0,0,0.2)] space-y-3">
          <Field label="Special offer or guarantee" value={String(offer || "")} />
          <Field label="Anything to avoid" value={String(avoid || "")} />
        </div>
      </Section>

      <Section title="Design direction">
        <p className="text-sm rounded-lg border border-[rgba(201,97,44,0.2)] p-3 bg-[rgba(0,0,0,0.2)]">
          {labelForDirection(String(dir))}
        </p>
      </Section>

      <Section title="Preview snapshot">
        {previewSnap ? (
          <div className="space-y-4 rounded-lg border border-[rgba(201,97,44,0.2)] p-4 bg-[rgba(0,0,0,0.2)]">
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Copy the lead saw in the live preview at submit time{previewSnap.generatedAt ? ` (${previewSnap.generatedAt})` : ""}.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Business kind (inferred)" value={String(previewSnap.businessKind || "")} />
              <Field label="Example / funnel source" value={String(previewSnap.exampleSource || r.funnel_source || "—")} />
              <Field label="Fresh Cut mode" value={previewSnap.isFreshCutFunnel ? "Yes" : "No"} />
              <Field label="Design direction (snapshot)" value={String(previewSnap.designDirection || "—")} />
            </div>
            <Field label="Headline" value={previewSnap.headline} />
            <Field label="Subheadline" value={previewSnap.subheadline} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CTA label" value={previewSnap.ctaLabel} />
              <Field label="CTA support line" value={previewSnap.ctaSupport} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                Services (generated)
              </p>
              <ul className="space-y-2">
                {previewSnap.services.slice(0, 3).map((s, i) => (
                  <li
                    key={`${s.title}-${i}`}
                    className="rounded-md border border-[rgba(201,97,44,0.15)] p-3 text-sm"
                    style={{ color: "var(--admin-fg)" }}
                  >
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--admin-muted)" }}>
                      {s.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
                Trust points
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: "var(--admin-fg)" }}>
                {previewSnap.trustPoints.map((t, i) => (
                  <li key={`${i}-${t}`}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm rounded-lg border border-[rgba(201,97,44,0.2)] p-3 bg-[rgba(0,0,0,0.2)]" style={{ color: "var(--admin-muted)" }}>
            Could not derive a preview snapshot from saved data (incomplete snapshot or legacy shape). Raw JSON is still
            available below.
          </p>
        )}
      </Section>

      <Section title="Notes">
        {r.notes?.trim() ? (
          <p className="text-sm whitespace-pre-wrap rounded-lg border border-[rgba(201,97,44,0.2)] p-3 bg-[rgba(0,0,0,0.2)]">
            {r.notes}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            None
          </p>
        )}
        <div className="mt-3">
          <Field label="Anything else (form)" value={String(extra || "")} />
        </div>
      </Section>

      <Section title="Mockup data (JSON)">
        <pre
          className="text-xs overflow-x-auto max-h-[50vh] overflow-y-auto rounded-lg border border-[rgba(201,97,44,0.2)] p-4 bg-[rgba(0,0,0,0.35)]"
          style={{ color: "var(--admin-muted)" }}
        >
          {json}
        </pre>
      </Section>
    </section>
  );
}
