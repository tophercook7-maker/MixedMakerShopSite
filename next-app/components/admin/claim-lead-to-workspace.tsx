"use client";

import { useState } from "react";
import { buildLeadPath } from "@/lib/lead-route";

export function ClaimLeadToWorkspace({
  leadId,
  redirectQuery,
}: {
  leadId: string;
  redirectQuery?: string;
}) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedRedirectUrl, setClaimedRedirectUrl] = useState<string | null>(null);

  const hasSampleIntent = redirectQuery === "sample=1";

  async function claimLead() {
    setIsClaiming(true);
    setError(null);
    setClaimedRedirectUrl(null);
    console.info("[Claim Lead] claim started", { lead_id: leadId, redirect_query: redirectQuery || null });
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        const detail = typeof data.error === "string" ? data.error : "Unknown error";
        console.info("[Claim Lead] claim failed", { lead_id: leadId, status: res.status, error: detail });
        setError(`Could not claim lead: ${detail}`);
        return;
      }
      const nextId = String(data.id || leadId).trim();
      const nextBusinessName = String(data.business_name || "").trim();
      const targetPath = buildLeadPath(nextId, nextBusinessName);
      const redirectPath = redirectQuery ? `${targetPath}?${redirectQuery}` : targetPath;
      console.info("[Claim Lead] claim success, redirecting", {
        lead_id: leadId,
        claimed_id: nextId,
        target_redirect_url: redirectPath,
      });
      setClaimedRedirectUrl(redirectPath);
      if (typeof window !== "undefined") {
        window.location.assign(redirectPath);
      }
    } catch (e) {
      const detail = e instanceof Error ? e.message : "network error";
      console.info("[Claim Lead] claim failed", { lead_id: leadId, error: detail });
      setError(`Could not claim lead: ${detail}`);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button type="button" className="admin-btn-primary" onClick={() => void claimLead()} disabled={isClaiming}>
        {isClaiming ? "Claiming..." : "Claim to Workspace"}
      </button>
      {claimedRedirectUrl ? (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: "#86efac" }}>
            Lead claimed — redirecting...
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={claimedRedirectUrl} className="admin-btn-primary text-xs">
              {hasSampleIntent ? "Continue to Sample Builder" : "Continue to Lead"}
            </a>
          </div>
        </div>
      ) : null}
      {error ? (
        <p className="text-xs" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
