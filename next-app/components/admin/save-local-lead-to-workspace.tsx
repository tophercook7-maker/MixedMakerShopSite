"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildLeadPath } from "@/lib/lead-route";

type LocalWorkflowLead = {
  id: string;
  business_name?: string | null;
  email?: string | null;
  phone_from_site?: string | null;
  website?: string | null;
  category?: string | null;
  city?: string | null;
  address?: string | null;
  lead_source?: string | null;
  status?: string | null;
  notes?: string[] | null;
  known_owner_name?: string | null;
  known_context?: string | null;
  lead_bucket?: string | null;
  door_status?: "not_visited" | "planned" | "visited" | "follow_up" | "closed_won" | "closed_lost" | null;
};

const LOCAL_WORKFLOW_LEADS_KEY = "mixedmakershop.local_workflow_leads";

function toCreatePayload(lead: LocalWorkflowLead): Record<string, unknown> {
  const noteValue = Array.isArray(lead.notes) && lead.notes.length > 0 ? String(lead.notes[lead.notes.length - 1] || "").trim() : "";
  return {
    business_name: String(lead.business_name || "").trim() || "Untitled business",
    email: String(lead.email || "").trim() || undefined,
    phone: String(lead.phone_from_site || "").trim() || undefined,
    website: String(lead.website || "").trim() || undefined,
    industry: String(lead.category || "").trim() || undefined,
    category: String(lead.category || "").trim() || undefined,
    city: String(lead.city || "").trim() || undefined,
    address: String(lead.address || "").trim() || undefined,
    lead_source: String(lead.lead_source || "manual").trim() || "manual",
    status: String(lead.status || "new").trim().toLowerCase() || "new",
    notes: noteValue || undefined,
    is_manual: true,
    known_owner_name: String(lead.known_owner_name || "").trim() || undefined,
    known_context: String(lead.known_context || "").trim() || undefined,
    lead_bucket: String(lead.lead_bucket || "").trim() || undefined,
    door_status: lead.door_status || "not_visited",
  };
}

export function SaveLocalLeadToWorkspace({
  localLeadId,
  redirectQuery,
}: {
  localLeadId: string;
  redirectQuery?: string;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedRedirectUrl, setSavedRedirectUrl] = useState<string | null>(null);
  const hasSampleIntent = redirectQuery === "sample=1";

  const localLead = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(LOCAL_WORKFLOW_LEADS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as LocalWorkflowLead[];
      if (!Array.isArray(parsed)) return null;
      return parsed.find((entry) => String(entry.id || "").trim() === String(localLeadId || "").trim()) || null;
    } catch {
      return null;
    }
  }, [localLeadId]);

  async function saveToWorkspace() {
    if (!localLead) {
      setError("Local lead data was not found. Go back to Leads and save from there.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setMessage(null);
    const payload = toCreatePayload(localLead);
    console.info("[Save Local Lead] backend save attempted", { local_lead_id: localLeadId, payload });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        const detail =
          typeof data.error === "string" ? data.error : data.error ? JSON.stringify(data.error) : "unknown backend error";
        console.info("[Save Local Lead] backend save failed", { local_lead_id: localLeadId, status: res.status, error: detail });
        setError(`Could not save to workspace: ${detail}`);
        return;
      }
      const nextId = String(data.id || "").trim();
      const nextBusinessName = String(data.business_name || localLead.business_name || "").trim();
      if (!nextId) {
        setError("Lead saved but no backend id returned.");
        return;
      }
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(LOCAL_WORKFLOW_LEADS_KEY);
          const parsed = raw ? (JSON.parse(raw) as LocalWorkflowLead[]) : [];
          if (Array.isArray(parsed)) {
            const next = parsed.filter((entry) => String(entry.id || "").trim() !== String(localLeadId || "").trim());
            localStorage.setItem(LOCAL_WORKFLOW_LEADS_KEY, JSON.stringify(next));
          }
        } catch {
          // Ignore cleanup issues.
        }
      }
      console.info("[Save Local Lead] local lead promoted to server", {
        old_lead_id: localLeadId,
        new_lead_id: nextId,
        status: res.status,
      });
      const targetPath = buildLeadPath(nextId, nextBusinessName);
      const redirectPath = redirectQuery ? `${targetPath}?${redirectQuery}` : targetPath;
      console.info("[Save Local Lead] redirecting", { target_redirect_url: redirectPath });
      setMessage("Lead saved to workspace — redirecting...");
      setSavedRedirectUrl(redirectPath);
      if (typeof window !== "undefined") {
        window.location.assign(redirectPath);
      } else {
        router.replace(redirectPath);
        router.refresh();
      }
    } catch (e) {
      const detail = e instanceof Error ? e.message : "network error";
      console.info("[Save Local Lead] backend save failed", { local_lead_id: localLeadId, error: detail });
      setError(`Could not save to workspace: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button type="button" className="admin-btn-primary" onClick={() => void saveToWorkspace()} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save to Workspace"}
      </button>
      {savedRedirectUrl ? (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: "#86efac" }}>
            {message || "Lead saved — redirecting..."}
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={savedRedirectUrl} className="admin-btn-primary text-xs">
              {hasSampleIntent ? "Continue to Sample Builder" : "Continue to Lead"}
            </a>
          </div>
        </div>
      ) : message ? (
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
