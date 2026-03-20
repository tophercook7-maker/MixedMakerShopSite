"use client";

import { useEffect, useMemo, useState } from "react";
import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { buildDefaultLeadSample, leadSampleToDraft, normalizeLeadSampleRecord, type LeadSampleRecord } from "@/lib/lead-samples";
import { inferImageCategoryFromLeadSample } from "@/lib/sample-fallback-images";

const LOCAL_KEY = "crm.lead_samples";

function readLocalSamples(): LeadSampleRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeadSampleRecord[];
    return Array.isArray(parsed) ? parsed.map((item) => normalizeLeadSampleRecord(item)) : [];
  } catch {
    return [];
  }
}

export function LeadSamplePreviewClient({ sampleId }: { sampleId: string }) {
  const [sample, setSample] = useState<LeadSampleRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!sampleId) {
        setMessage("Sample id is missing.");
        return;
      }
      const local = readLocalSamples().find((item) => item.id === sampleId) || null;
      if (local && !cancelled) {
        setSample(local);
      }
      try {
        const res = await fetch(`/api/lead-samples/${encodeURIComponent(sampleId)}`, {
          method: "GET",
          cache: "no-store",
        });
        const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok) {
          if (!local && !cancelled) {
            setMessage(String(body.error || "Sample could not be loaded."));
          }
          return;
        }
        if (!cancelled) {
          setSample(normalizeLeadSampleRecord({ ...body, source: "server", isLocalOnly: false }));
          setMessage(null);
        }
      } catch {
        if (!local && !cancelled) setMessage("Sample could not be loaded.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [sampleId]);

  const draft = useMemo(() => {
    if (sample) return leadSampleToDraft(sample);
    return leadSampleToDraft(buildDefaultLeadSample({ leadId: "preview", businessName: "Sample", businessType: "service business" }));
  }, [sample]);

  return (
    <div>
      {message ? (
        <div style={{ maxWidth: 980, margin: "16px auto", padding: 12, borderRadius: 10, border: "1px solid rgba(252,165,165,.45)", color: "#fecaca", background: "rgba(127,29,29,.2)" }}>
          {message}
        </div>
      ) : null}
      <SampleDraftClient
        initialDraft={draft}
        initialMode="presentation"
        embedOptions={{
          imageCategoryKey: sample ? inferImageCategoryFromLeadSample(sample) : "default-service-business",
        }}
      />
    </div>
  );
}
