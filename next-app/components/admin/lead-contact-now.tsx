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
  /** Shown as its own row when present and not redundant with the advertising row. */
  googleBusinessUrl: string | null;
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 py-2 border-b last:border-b-0"
      style={{ borderColor: "var(--admin-border)" }}
    >
      <span className="text-xs font-medium shrink-0" style={{ color: "var(--admin-muted)" }}>
        {label}
      </span>
      <div className="min-w-0 flex flex-wrap items-center gap-2 justify-end text-sm">{children}</div>
    </div>
  );
}

function withHttp(url: string): string {
  const u = url.trim();
  return u.startsWith("http") ? u : `https://${u}`;
}

function bestContactLine(method: string, value: string | null): ReactNode {
  const m = (method || "research_later").toLowerCase();
  if (m === "research_later") {
    return <span style={{ color: "var(--admin-fg)" }}>Research later</span>;
  }
  if (m === "email") {
    const v = (value || "").trim();
    if (!v) return <span style={{ color: "var(--admin-muted)" }}>Email on file — add address</span>;
    return (
      <span style={{ color: "var(--admin-fg)" }}>
        Email →{" "}
        <a href={`mailto:${v}`} className="text-[var(--admin-gold)] hover:underline break-all font-medium">
          {v}
        </a>
      </span>
    );
  }
  if (m === "facebook") {
    const v = (value || "").trim();
    if (!v) return <span style={{ color: "var(--admin-muted)" }}>Facebook — add URL</span>;
    const href = withHttp(v);
    return (
      <span style={{ color: "var(--admin-fg)" }}>
        Facebook →{" "}
        <a href={href} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline font-medium">
          Open Facebook page
        </a>
      </span>
    );
  }
  if (m === "phone") {
    const v = (value || "").trim();
    if (!v) return <span style={{ color: "var(--admin-muted)" }}>Phone — add number</span>;
    return (
      <span style={{ color: "var(--admin-fg)" }}>
        Phone →{" "}
        <a href={`tel:${v}`} className="text-[var(--admin-gold)] hover:underline font-medium">
          {v}
        </a>
      </span>
    );
  }
  if (m === "contact_form") {
    const v = (value || "").trim();
    if (!v) return <span style={{ color: "var(--admin-muted)" }}>Contact form — add URL</span>;
    return (
      <span style={{ color: "var(--admin-fg)" }}>
        Contact form →{" "}
        <a
          href={withHttp(v)}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--admin-gold)] hover:underline break-all font-medium"
        >
          Open form
        </a>
      </span>
    );
  }
  if (m === "website") {
    const v = (value || "").trim();
    if (!v) return <span style={{ color: "var(--admin-muted)" }}>Website — add URL</span>;
    return (
      <span style={{ color: "var(--admin-fg)" }}>
        Website →{" "}
        <a href={withHttp(v)} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline break-all font-medium">
          Open site
        </a>
      </span>
    );
  }
  return <span style={{ color: "var(--admin-muted)" }}>Research later</span>;
}

/**
 * Action-first block: single best channel + links in a fixed order for fast outreach.
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
  googleBusinessUrl,
}: LeadContactNowProps) {
  const adv = (advertisingPageUrl || "").trim();
  const advLabel = (advertisingPageLabel || "").trim() || "Public page";
  const gb = (googleBusinessUrl || "").trim();
  const advNorm = adv ? withHttp(adv) : "";
  const gbNorm = gb ? withHttp(gb) : "";
  const showGoogleRow = Boolean(gbNorm && gbNorm !== advNorm);

  const hasAny =
    bestContactMethod ||
    adv ||
    (email || "").trim() ||
    (facebookUrl || "").trim() ||
    (phone || "").trim() ||
    (contactPage || "").trim() ||
    (website || "").trim() ||
    showGoogleRow;

  if (!hasAny) return null;

  return (
    <section className="admin-card space-y-2 border-2" style={{ borderColor: "rgba(34, 197, 94, 0.45)" }}>
      <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
        Contact now
      </h2>
      <p className="text-[11px] leading-snug" style={{ color: "var(--admin-muted)" }}>
        Start with the best contact row, then use the links below.
      </p>
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.12)" }}>
        <Row label="Best contact method">{bestContactLine(bestContactMethod, bestContactValue)}</Row>
        {adv ? (
          <Row label="Advertising page">
            <a
              href={advNorm}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--admin-gold)] hover:underline break-all font-medium"
            >
              {advLabel}
            </a>
          </Row>
        ) : null}
        <Row label="Email">
          {(email || "").trim() ? (
            <a href={`mailto:${email}`} className="text-[var(--admin-gold)] hover:underline break-all font-medium">
              {email}
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              —
            </span>
          )}
        </Row>
        <Row label="Facebook">
          {(facebookUrl || "").trim() ? (
            <a
              href={withHttp(facebookUrl!)}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--admin-gold)] hover:underline break-all font-medium"
            >
              Open Facebook page
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              —
            </span>
          )}
        </Row>
        <Row label="Phone">
          {(phone || "").trim() ? (
            <a href={`tel:${phone}`} className="text-[var(--admin-gold)] hover:underline font-medium">
              {phone}
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              —
            </span>
          )}
        </Row>
        <Row label="Contact page">
          {(contactPage || "").trim() ? (
            <a
              href={withHttp(contactPage!)}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--admin-gold)] hover:underline break-all font-medium"
            >
              Open contact page
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              —
            </span>
          )}
        </Row>
        <Row label="Website">
          {(website || "").trim() ? (
            <a
              href={withHttp(website!)}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--admin-gold)] hover:underline break-all font-medium"
            >
              Open website
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              —
            </span>
          )}
        </Row>
        {showGoogleRow ? (
          <Row label="Google listing">
            <a href={gbNorm} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline break-all font-medium">
              Open Google listing
            </a>
          </Row>
        ) : null}
      </div>
    </section>
  );
}
