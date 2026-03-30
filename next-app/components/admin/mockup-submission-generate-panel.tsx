"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import type { AdminStoredGeneratedMockup } from "@/lib/admin-mockup-quick-generate";
import type { SampleDraft } from "@/lib/sample-draft-types";

export function MockupSubmissionGeneratePanel({
  submissionId,
  initial,
}: {
  submissionId: string;
  initial: AdminStoredGeneratedMockup | null;
}) {
  const router = useRouter();
  const [generated, setGenerated] = useState<AdminStoredGeneratedMockup | null>(initial);
  const [draft, setDraft] = useState<SampleDraft | null>(initial?.sampleDraft ?? null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const syncDraftFromFields = useCallback(
    (d: SampleDraft, fields: { whyText: string }) => ({
      ...d,
      whyChooseBullets: fields.whyText
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean),
    }),
    []
  );

  const [whyText, setWhyText] = useState(
    () => initial?.structured.why_choose_us.join("\n") ?? ""
  );

  const runGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setToast(null);
    try {
      const res = await fetch(`/api/admin/mockup-submissions/${encodeURIComponent(submissionId)}/generated-mockup`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        admin_generated?: AdminStoredGeneratedMockup;
        previewUrl?: string | null;
        lead_sample_saved?: boolean;
      };
      if (!res.ok) {
        setError(String(body.error || "Generation failed."));
        return;
      }
      if (body.admin_generated) {
        setGenerated(body.admin_generated);
        setDraft(body.admin_generated.sampleDraft);
        setWhyText(body.admin_generated.structured.why_choose_us.join("\n"));
      }
      if (body.previewUrl) {
        window.open(body.previewUrl, "_blank", "noopener,noreferrer");
        setToast("Opened lead sample preview in a new tab.");
      } else if (body.lead_sample_saved === false) {
        setToast("Draft saved on this submission (no lead_id — use inline preview below).");
      } else {
        setToast("Mockup generated.");
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [submissionId, router]);

  const mergedPreviewDraft =
    draft && generated ? syncDraftFromFields(draft, { whyText }) : null;

  const runSave = useCallback(async () => {
    if (!draft) return;
    const merged = syncDraftFromFields(draft, { whyText });
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const res = await fetch(`/api/admin/mockup-submissions/${encodeURIComponent(submissionId)}/generated-mockup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleDraft: merged }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        admin_generated?: AdminStoredGeneratedMockup;
      };
      if (!res.ok) {
        setError(String(body.error || "Save failed."));
        return;
      }
      if (body.admin_generated) {
        setGenerated(body.admin_generated);
        setDraft(body.admin_generated.sampleDraft);
        setWhyText(body.admin_generated.structured.why_choose_us.join("\n"));
      }
      setToast("Edits saved.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }, [draft, whyText, submissionId, router, syncDraftFromFields]);

  return (
    <div
      className="rounded-lg border p-4 mb-8 space-y-4"
      style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.15)" }}
    >
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Quick mockup generator
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn-primary text-xs"
            disabled={loading}
            onClick={() => void runGenerate()}
          >
            {loading ? "Generating…" : generated ? "Regenerate mockup" : "Generate mockup"}
          </button>
          <button type="button" className="admin-btn-ghost text-xs" disabled={!draft || saving} onClick={() => void runSave()}>
            {saving ? "Saving…" : "Save edits"}
          </button>
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--admin-muted)", lineHeight: 1.5 }}>
        Rules-based homepage draft from this submission. With a linked lead, we also save a{" "}
        <code className="text-[10px]">lead_samples</code> row (preview at{" "}
        <code className="text-[10px]">/samples/[id]</code>) and refresh the CRM mockup + HTML export when possible.
      </p>
      {error ? (
        <p className="text-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      ) : null}
      {toast ? (
      <p className="text-xs" style={{ color: "var(--admin-gold)" }}>
          {toast}
        </p>
      ) : null}

      {generated?.lead_sample_id ? (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Lead sample id:{" "}
          <a
            href={`/samples/${encodeURIComponent(generated.lead_sample_id)}`}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--admin-gold)] hover:underline"
          >
            Open preview
          </a>
        </p>
      ) : null}

      {generated ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold" style={{ color: "var(--admin-fg)" }}>
              Structured output
            </h3>
            <div className="text-[11px] space-y-2 rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
              <p style={{ color: "var(--admin-muted)" }}>
                <strong style={{ color: "var(--admin-fg)" }}>Hero</strong>
                <br />
                {generated.structured.hero.headline}
                <br />
                <span className="opacity-90">{generated.structured.hero.subheadline}</span>
                <br />
                CTA: {generated.structured.hero.cta}
              </p>
              <p style={{ color: "var(--admin-muted)" }}>
                <strong style={{ color: "var(--admin-fg)" }}>Services</strong>
                <br />
                {generated.structured.services.join(", ")}
              </p>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--admin-muted)" }}>
                  Why choose us (one per line)
                </span>
                <textarea
                  className="mt-1 w-full text-xs font-mono rounded p-2 min-h-[100px]"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-fg)",
                  }}
                  value={whyText}
                  onChange={(e) => setWhyText(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--admin-muted)" }}>
                  About
                </span>
                <textarea
                  className="mt-1 w-full text-xs rounded p-2 min-h-[72px]"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-fg)",
                  }}
                  value={draft?.aboutText ?? ""}
                  onChange={(e) => setDraft((d) => (d ? { ...d, aboutText: e.target.value } : d))}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--admin-muted)" }}>
                  Hero headline
                </span>
                <input
                  className="mt-1 w-full text-xs rounded p-2"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-fg)",
                  }}
                  value={draft?.heroHeadline ?? ""}
                  onChange={(e) => setDraft((d) => (d ? { ...d, heroHeadline: e.target.value } : d))}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--admin-muted)" }}>
                  Hero subheadline
                </span>
                <textarea
                  className="mt-1 w-full text-xs rounded p-2 min-h-[56px]"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-fg)",
                  }}
                  value={draft?.heroSub ?? ""}
                  onChange={(e) => setDraft((d) => (d ? { ...d, heroSub: e.target.value } : d))}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--admin-muted)" }}>
                  Bottom CTA title
                </span>
                <input
                  className="mt-1 w-full text-xs rounded p-2"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-fg)",
                  }}
                  value={draft?.finalTitle ?? ""}
                  onChange={(e) => setDraft((d) => (d ? { ...d, finalTitle: e.target.value } : d))}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--admin-muted)" }}>
                  Bottom CTA sub
                </span>
                <textarea
                  className="mt-1 w-full text-xs rounded p-2 min-h-[48px]"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--admin-border)",
                    color: "var(--admin-fg)",
                  }}
                  value={draft?.finalSub ?? ""}
                  onChange={(e) => setDraft((d) => (d ? { ...d, finalSub: e.target.value } : d))}
                />
              </label>
              <p className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
                Direction: {generated.selected_template_key} · template: {generated.template_key} · last run:{" "}
                {new Date(generated.generated_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="min-h-[320px] rounded border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
            {mergedPreviewDraft && generated ? (
              <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                <SampleDraftClient
                  key={`${mergedPreviewDraft.heroHeadline}|${mergedPreviewDraft.aboutText}|${whyText}`}
                  initialDraft={mergedPreviewDraft}
                  initialMode="presentation"
                  embedOptions={{
                    lockPresentation: true,
                    initialStylePreset: generated.stylePreset,
                    initialColorPreset: generated.colorPreset,
                    secondaryHref: "#services",
                    portfolioFooter: true,
                    portfolioFooterMessage: "Admin preview — edit fields on the left, then Save edits.",
                    portfolioCopy: true,
                    imageCategoryKey: generated.imageCategoryKey,
                    wideLayout: true,
                  }}
                />
              </div>
            ) : (
              <p className="text-xs p-4" style={{ color: "var(--admin-muted)" }}>
                Generate to see inline preview.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          No draft yet — click Generate mockup.
        </p>
      )}
    </div>
  );
}
