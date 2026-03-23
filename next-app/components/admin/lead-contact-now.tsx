import type { ReactNode } from "react";

export type LeadContactNowProps = {
  bestContactMethod: string;
  bestContactValue: string | null;
  advertisingPageUrl: string | null;
  advertisingPageLabel: string | null;
  email: string | null;
  facebookUrl: string | null;
  phone: string | null;
  contactPage: string | null;
  website: string | null;
};

function withHttp(url: string): string {
  const u = url.trim();
  return u.startsWith("http") ? u : `https://${u}`;
}

/** Link copy for advertising row from Brain label. */
function advertisingActionLabel(label: string): string {
  const L = (label || "").toLowerCase();
  if (L.includes("facebook")) return "Open Facebook page";
  if (L.includes("google")) return "Open Google listing";
  if (L.includes("contact")) return "Open contact page";
  if (L.includes("website") || L.includes("site")) return "Open website";
  if (L.includes("source")) return "Open source link";
  return label.trim() ? `Open ${label.trim()}` : "Open public page";
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex w-full items-start justify-between gap-4 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--admin-border)" }}>
      <div className="text-xs font-medium shrink-0 pt-0.5 max-w-[38%]" style={{ color: "var(--admin-muted)" }}>
        {label}
      </div>
      <div
        className="text-sm text-right min-w-0 max-w-[min(100%,58%)] sm:max-w-[55%] break-words [overflow-wrap:anywhere]"
        style={{ color: "var(--admin-fg)" }}
      >
        {children}
      </div>
    </div>
  );
}

function bestContactHighlightContent(method: string, value: string | null): ReactNode {
  const m = (method || "research_later").toLowerCase();
  if (m === "research_later") {
    return <span className="font-medium">Research later</span>;
  }
  if (m === "email") {
    const v = (value || "").trim();
    if (!v) return <span className="text-[var(--admin-muted)]">Add an email to reach them</span>;
    return (
      <>
        <span className="text-[var(--admin-muted)] mr-1">Email →</span>
        <a href={`mailto:${v}`} className="text-[var(--admin-gold)] hover:underline font-semibold break-all">
          {v}
        </a>
      </>
    );
  }
  if (m === "facebook") {
    const v = (value || "").trim();
    if (!v) return <span className="text-[var(--admin-muted)]">Add a Facebook URL</span>;
    const href = withHttp(v);
    return (
      <>
        <span className="text-[var(--admin-muted)] mr-1">Facebook →</span>
        <a href={href} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline font-semibold">
          Open Facebook page
        </a>
      </>
    );
  }
  if (m === "phone") {
    const v = (value || "").trim();
    if (!v) return <span className="text-[var(--admin-muted)]">Add a phone number</span>;
    return (
      <>
        <span className="text-[var(--admin-muted)] mr-1">Phone →</span>
        <a href={`tel:${v}`} className="text-[var(--admin-gold)] hover:underline font-semibold whitespace-normal break-all">
          {v}
        </a>
      </>
    );
  }
  if (m === "contact_form") {
    const v = (value || "").trim();
    if (!v) return <span className="text-[var(--admin-muted)]">Add a contact form URL</span>;
    return (
      <>
        <span className="text-[var(--admin-muted)] mr-1">Contact form →</span>
        <a href={withHttp(v)} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline font-semibold break-all">
          Open form
        </a>
      </>
    );
  }
  if (m === "website") {
    const v = (value || "").trim();
    if (!v) return <span className="text-[var(--admin-muted)]">Add a website URL</span>;
    return (
      <>
        <span className="text-[var(--admin-muted)] mr-1">Website →</span>
        <a href={withHttp(v)} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline font-semibold break-all">
          Open site
        </a>
      </>
    );
  }
  return <span className="font-medium">Research later</span>;
}

/**
 * Single action-first contact block for lead detail.
 */
export function LeadContactNow({
  bestContactMethod,
  bestContactValue,
  advertisingPageUrl,
  advertisingPageLabel,
  email,
  facebookUrl,
  phone,
  contactPage,
  website,
}: LeadContactNowProps) {
  const adv = (advertisingPageUrl || "").trim();
  const advLabelRaw = (advertisingPageLabel || "").trim();
  const advNorm = adv ? withHttp(adv) : "";
  const advLinkText = advertisingActionLabel(advLabelRaw || "Public page");

  const hasAnyChannel =
    Boolean((email || "").trim()) ||
    Boolean((facebookUrl || "").trim()) ||
    Boolean((phone || "").trim()) ||
    Boolean((contactPage || "").trim()) ||
    Boolean((website || "").trim()) ||
    Boolean(adv);

  if (!hasAnyChannel && (bestContactMethod || "research_later").toLowerCase() === "research_later") {
    return (
      <section className="admin-card space-y-2 border-2" style={{ borderColor: "rgba(34, 197, 94, 0.45)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Contact now
        </h2>
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          No contact info yet — enrich the lead or add email, phone, or social links.
        </p>
      </section>
    );
  }

  return (
    <section className="admin-card space-y-3 border-2" style={{ borderColor: "rgba(34, 197, 94, 0.45)" }}>
      <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
        Contact now
      </h2>

      <div
        className="rounded-lg border px-3 py-3 sm:px-4"
        style={{
          borderColor: "rgba(212, 175, 55, 0.45)",
          background: "linear-gradient(145deg, rgba(212,175,55,0.12) 0%, rgba(0,0,0,0.2) 100%)",
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-gold)" }}>
          Best contact
        </p>
        <div className="text-sm leading-snug">{bestContactHighlightContent(bestContactMethod, bestContactValue)}</div>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.12)" }}>
        {adv ? (
          <DetailRow label="Advertising page">
            <a href={advNorm} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline font-medium break-all">
              {advLinkText}
            </a>
          </DetailRow>
        ) : null}
        <DetailRow label="Email">
          {(email || "").trim() ? (
            <a href={`mailto:${email}`} className="text-[var(--admin-gold)] hover:underline font-medium break-all">
              {email}
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No email found yet
            </span>
          )}
        </DetailRow>
        <DetailRow label="Facebook">
          {(facebookUrl || "").trim() ? (
            <a
              href={withHttp(facebookUrl!)}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--admin-gold)] hover:underline font-medium break-all"
            >
              Open Facebook page
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No Facebook link saved yet
            </span>
          )}
        </DetailRow>
        <DetailRow label="Phone">
          {(phone || "").trim() ? (
            <a href={`tel:${phone}`} className="text-[var(--admin-gold)] hover:underline font-medium break-all">
              {phone}
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No phone found yet
            </span>
          )}
        </DetailRow>
        <DetailRow label="Contact page">
          {(contactPage || "").trim() ? (
            <a
              href={withHttp(contactPage!)}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--admin-gold)] hover:underline font-medium break-all"
            >
              Open contact page
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No contact page found yet
            </span>
          )}
        </DetailRow>
        <DetailRow label="Website">
          {(website || "").trim() ? (
            <a
              href={withHttp(website!)}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--admin-gold)] hover:underline font-medium break-all"
            >
              Open website
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No website found yet
            </span>
          )}
        </DetailRow>
      </div>
    </section>
  );
}
