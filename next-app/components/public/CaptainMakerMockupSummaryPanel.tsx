"use client";

import { Anchor, X } from "lucide-react";
import type { CaptainMakerProjectSummaryStorage } from "@/lib/captain-maker-project-summary";
import { cn } from "@/lib/utils";
import { mmsBtnPrimary, mmsBtnSecondaryOnGlass, mmsH3OnGlass, mmsOnGlassPrimary, mmsOnGlassSecondary } from "@/lib/mms-umbrella-ui";

type CaptainMakerMockupSummaryPanelProps = {
  summary: CaptainMakerProjectSummaryStorage;
  showPreview: boolean;
  onUseSummary: () => void;
  onClearSummary: () => void;
};

function SummaryField({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-white/85">{value}</p>
    </div>
  );
}

export function CaptainMakerMockupSummaryPanel({
  summary,
  showPreview,
  onUseSummary,
  onClearSummary,
}: CaptainMakerMockupSummaryPanelProps) {
  return (
    <div className="space-y-4">
      <div className="public-glass-box public-glass-box--pad border border-orange-300/25 shadow-[0_0_32px_rgba(251,146,60,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-300/30 bg-orange-400/10 text-orange-200">
              <Anchor className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className={cn("text-base font-semibold", mmsOnGlassPrimary)}>Captain Maker brought your project notes over.</p>
              <p className={cn("mt-1 text-sm leading-relaxed", mmsOnGlassSecondary)}>
                Use the summary to fill the form — you can still edit everything before you submit.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
            <button type="button" className={cn(mmsBtnPrimary, "w-full justify-center")} onClick={onUseSummary}>
              Use Captain Maker Summary
            </button>
            <button type="button" className={cn(mmsBtnSecondaryOnGlass, "w-full justify-center gap-2")} onClick={onClearSummary}>
              <X className="h-4 w-4" aria-hidden />
              Clear Summary
            </button>
          </div>
        </div>
      </div>

      {showPreview ? (
        <div className="public-glass-box--soft public-glass-box--pad animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h3 className={mmsH3OnGlass}>Captain Maker Summary</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SummaryField label="Recommended path" value={summary.recommendationTitle} />
            <SummaryField label="Business / project name" value={summary.businessName} />
            <SummaryField label="Main goal" value={summary.goal} />
            <SummaryField label="Timeline" value={summary.timeline} />
            <SummaryField label="Budget comfort" value={summary.budgetComfort} />
            <SummaryField label="Project type" value={summary.projectType} />
          </div>
          {summary.generatedSummary ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Summary</p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
                {summary.generatedSummary}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
