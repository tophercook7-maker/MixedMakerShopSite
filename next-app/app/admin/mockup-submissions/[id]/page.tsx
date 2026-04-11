import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { MockupSubmissionGeneratePanel } from "@/components/admin/mockup-submission-generate-panel";
import { MockupSubmissionStatusSelect } from "@/components/admin/mockup-submission-status-select";
import type { AdminStoredGeneratedMockup } from "@/lib/admin-mockup-quick-generate";
import { FUNNEL_DESIGN_DIRECTION_OPTIONS } from "@/lib/funnel-design-directions";
import { FUNNEL_DESIRED_OUTCOME_LABELS, type FunnelDesiredOutcomeId } from "@/lib/funnel-desired-outcomes";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  email: string;
  mockup_data: Record<string, unknown> | null;
  notes: string | null;
  status: string;
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
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
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
  const md = r.mockup_data || {};
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

  return (
    <section className="admin-card">
      <MockupSubmissionGeneratePanel submissionId={r.id} initial={adminGenerated} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/mockup-submissions"
            className="text-xs hover:text-[var(--admin-gold)]"
            style={{ color: "var(--admin-muted)" }}
          >
            ← All mockup submissions
          </Link>
          <h1 className="text-lg font-semibold mt-3" style={{ color: "var(--admin-fg)" }}>
            {r.email}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            <span className="mr-3">Created {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</span>
            <span>Updated {r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}</span>
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
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
        <MockupSubmissionStatusSelect submissionId={r.id} initialStatus={r.status} />
      </div>

      <Section title="Follow-up message templates (copy/paste)">
        <div
          className="rounded-lg border border-[rgba(201,97,44,0.25)] p-4 text-sm leading-relaxed space-y-4"
          style={{ color: "var(--admin-fg)", background: "rgba(0,0,0,0.15)" }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
              First reply
            </p>
            <p className="whitespace-pre-wrap" style={{ color: "var(--admin-muted)" }}>
              {`Hey — I took a look at your request.\n\nI’ve got a good direction in mind for your site. Before I build it out, quick question:\n\n[ask 1 relevant question about their business]`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
              If no response (~2 days)
            </p>
            <p className="whitespace-pre-wrap" style={{ color: "var(--admin-muted)" }}>
              {`Hey — just wanted to follow up on this.\n\nI’ve got an idea for your site that I think would work really well. Let me know if you still want me to put it together.\n\n– Topher`}
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Use <strong style={{ color: "var(--admin-fg)" }}>Status → Contacted</strong> when you’ve reached out.
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
