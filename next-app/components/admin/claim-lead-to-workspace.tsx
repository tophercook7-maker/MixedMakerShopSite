"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildLeadPath } from "@/lib/lead-route";

export function ClaimLeadToWorkspace({
  leadId,
  redirectQuery,
}: {
  leadId: string;
  redirectQuery?: string;
}) {
  const router = useRouter();
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function claimLead() {
    setIsClaiming(true);
    setError(null);
    setMessage(null);
    console.info("[Claim Lead] attempting claim", { lead_id: leadId });
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
      console.info("[Claim Lead] claim succeeded", { lead_id: leadId, claimed_id: nextId });
      setMessage("Lead claimed to your workspace.");
      const targetPath = buildLeadPath(nextId, nextBusinessName);
      const redirectPath = redirectQuery ? `${targetPath}?${redirectQuery}` : targetPath;
      router.replace(redirectPath);
      router.refresh();
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
      {message ? (
        <p className="text-xs" style={{ color: "#86efac" }}>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
