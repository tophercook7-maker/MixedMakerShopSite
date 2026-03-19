import type { ReactNode } from "react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";

function Badge({ label, tone }: { label: string; tone: "ok" | "warn" | "muted" | "bad" }) {
  const bg =
    tone === "ok"
      ? "rgba(34,197,94,0.18)"
      : tone === "warn"
        ? "rgba(251,191,36,0.2)"
        : tone === "bad"
          ? "rgba(248,113,113,0.2)"
          : "rgba(148,163,184,0.15)";
  const fg =
    tone === "ok" ? "#86efac" : tone === "warn" ? "#fcd34d" : tone === "bad" ? "#fca5a5" : "var(--admin-muted)";
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: bg, color: fg }}>
      {label}
    </span>
  );
}

export function OutreachBadges({ lead }: { lead: WorkflowLead }) {
  const chips: ReactNode[] = [];
  if (lead.email_sent) chips.push(<Badge key="email" label="Email sent" tone="ok" />);
  if (lead.facebook_sent) chips.push(<Badge key="fb" label="Facebook sent" tone="ok" />);
  if (lead.text_sent) chips.push(<Badge key="txt" label="Text sent" tone="ok" />);
  if (lead.preview_sent) chips.push(<Badge key="prev" label="Preview sent" tone="ok" />);
  if (lead.status === "replied" || Boolean(String(lead.last_reply_preview || "").trim())) {
    chips.push(<Badge key="rep" label="Replied" tone="warn" />);
  }
  const fu = lead.next_follow_up_at ? new Date(lead.next_follow_up_at).getTime() : NaN;
  const endToday = new Date();
  endToday.setHours(23, 59, 59, 999);
  if (Number.isFinite(fu) && fu <= endToday.getTime() && lead.follow_up_status === "pending" && lead.status !== "replied") {
    chips.push(<Badge key="due" label="Follow-up due" tone="warn" />);
  }
  if (lead.last_outreach_status === "failed") {
    chips.push(<Badge key="fail" label="Send failed" tone="bad" />);
  }
  if (!chips.length) return null;
  return <div className="flex flex-wrap gap-1 mt-1">{chips}</div>;
}
