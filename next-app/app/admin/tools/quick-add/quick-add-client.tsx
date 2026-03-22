"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildLeadPath } from "@/lib/lead-route";

function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mixedmakershop.com";
}

export function QuickAddClient() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    text: string;
    leadId?: string;
    leadPath?: string;
  } | null>(null);

  useEffect(() => {
    const w = searchParams.get("website");
    const n = searchParams.get("name");
    if (w) setWebsite(w);
    if (n) setName(n);
  }, [searchParams]);

  const apiUrl = `${getAppOrigin()}/api/crm/quick-add`;

  const bookmarkletHref = useMemo(() => {
    const code = [
      "javascript:(function(){",
      "var u=location.href,t=document.title||'';",
      `var api='${getAppOrigin()}/api/crm/quick-add';`,
      "fetch(api,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},",
      "body:JSON.stringify({website:u,name:t,source:'bookmarklet'})})",
      ".then(function(r){return r.json().then(function(j){",
      "if(j&&j.ok)alert(j.message||(j.created?'Saved to Leads.':'Saved to Leads (already in your list).'));",
      "else alert('Could not add lead');});})",
      ".catch(function(){alert('Could not add lead');});",
      "})();",
    ].join("");
    return code;
  }, []);

  const bookmarkletOpenHref = useMemo(() => {
    const base = getAppOrigin() + "/admin/tools/quick-add";
    return `javascript:(function(){var u=encodeURIComponent(location.href);var t=encodeURIComponent(document.title||'');window.open('${base}?website='+u+'&name='+t,'_blank');})();`;
  }, []);

  const submit = useCallback(async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/crm/quick-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: website.trim(),
          name: name.trim(),
          source: "manual",
          notes: notes.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        created?: boolean;
        message?: string;
        leadId?: string;
        destination?: string;
        error?: string;
      };
      if (data.ok) {
        const leadId = String(data.leadId || "").trim();
        const leadPath = leadId ? buildLeadPath(leadId, name.trim()) : undefined;
        setResult({
          ok: true,
          text: String(
            data.message ||
              (data.created ? "Saved to Leads." : "Saved to Leads (already in your list).")
          ),
          leadId: leadId || undefined,
          leadPath,
        });
      } else {
        setResult({ ok: false, text: String(data.error || "Something went wrong. Try again.") });
      }
    } catch {
      setResult({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }, [name, website, notes]);

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
          Add businesses to your CRM from any website
        </h1>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--admin-muted)" }}>
          When you find a business you want to follow up with, use the bookmark below. It saves that business to your{" "}
          <strong style={{ color: "var(--admin-fg)" }}>Leads</strong> list (not the Scout discovery queue).
        </p>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--admin-muted)" }}>
          You do not need to open the admin first. Open <Link href="/admin/leads">Leads</Link> anytime to see what you saved.
        </p>
      </div>

      <section className="admin-card space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          1. Add the bookmark
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Drag this link to your bookmarks bar, or right-click and “Bookmark link”.
        </p>
        <a
          href={bookmarkletHref}
          className="inline-block admin-btn-primary text-sm no-underline"
          onClick={(e) => e.preventDefault()}
        >
          Save to MixedMaker CRM
        </a>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          If the button version is blocked by your browser, use this fallback — it opens this page with the site filled in;
          then click Save below.
        </p>
        <a href={bookmarkletOpenHref} className="inline-block admin-btn-ghost text-xs no-underline border border-[var(--admin-border)]">
          Open CRM add page for this site
        </a>
      </section>

      <section className="admin-card space-y-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          2. While browsing, click it
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Stay logged into MixedMaker in this browser so the save can attach to your account.
        </p>
      </section>

      <section className="admin-card space-y-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          3. You’ll see a quick confirmation
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          You’ll see “Saved to Leads” (or that it was already in your list) — then you can keep browsing.
        </p>
      </section>

      <section className="admin-card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Try it here
        </h2>
        <label className="block text-xs" style={{ color: "var(--admin-muted)" }}>
          Business name
          <input
            className="admin-input mt-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Street Coffee"
          />
        </label>
        <label className="block text-xs" style={{ color: "var(--admin-muted)" }}>
          Website
          <input
            className="admin-input mt-1 w-full"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <label className="block text-xs" style={{ color: "var(--admin-muted)" }}>
          Note (optional)
          <textarea className="admin-input mt-1 w-full min-h-[72px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button type="button" className="admin-btn-primary" disabled={busy} onClick={() => void submit()}>
          {busy ? "Saving…" : "Save to Leads"}
        </button>
        {result ? (
          <div className={`text-sm space-y-2 ${result.ok ? "text-green-200" : "text-red-200"}`} role="status">
            <p>{result.text}</p>
            {result.ok && result.leadPath ? (
              <Link href={result.leadPath} className="inline-block admin-btn-ghost text-xs no-underline border border-[var(--admin-border)]">
                Open lead
              </Link>
            ) : null}
          </div>
        ) : null}
        <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          API endpoint (for reference): <code className="break-all">{apiUrl}</code>
        </p>
      </section>
    </div>
  );
}
