import type { ReactNode } from "react";
import Link from "next/link";

export type LeadContactFirstProps = {
  email: string | null;
  emailSource?: string | null;
  facebookUrl: string | null;
  phone: string | null;
  website: string | null;
  contactPage: string | null;
  /** Optional preview builder link */
  previewLeadId?: string | null;
  /** When false, hide entire section if there is no contact data at all */
  showWhenEmpty?: boolean;
  /** Secondary actions (e.g. manual enrich) */
  headerActions?: ReactNode;
};

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 py-2 border-b last:border-b-0" style={{ borderColor: "var(--admin-border)" }}>
      <span className="text-xs font-medium shrink-0" style={{ color: "var(--admin-muted)" }}>
        {label}
      </span>
      <div className="min-w-0 flex flex-wrap items-center gap-2 justify-end">{children}</div>
    </div>
  );
}

/**
 * Primary outreach block: email → Facebook → phone → website → contact page, with inline actions.
 */
export function LeadContactFirst({
  email,
  emailSource,
  facebookUrl,
  phone,
  website,
  contactPage,
  previewLeadId,
  showWhenEmpty = true,
  headerActions,
}: LeadContactFirstProps) {
  const hasEmail = Boolean(String(email || "").trim());
  const hasFb = Boolean(String(facebookUrl || "").trim());
  const hasPhone = Boolean(String(phone || "").trim());
  const hasWeb = Boolean(String(website || "").trim());
  const hasContact = Boolean(String(contactPage || "").trim());
  const showSource = hasEmail && emailSource && String(emailSource).toLowerCase() !== "unknown";

  if (!showWhenEmpty && !hasEmail && !hasFb && !hasPhone && !hasWeb && !hasContact) {
    return null;
  }

  return (
    <section className="admin-card space-y-3 border-2" style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Contact first
        </h2>
        {headerActions}
      </div>
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.12)" }}>
        <Row label="Email">
          {hasEmail ? (
            <div className="flex flex-col items-end gap-1 min-w-0 text-right">
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <a href={`mailto:${email}`} className="text-sm text-[var(--admin-gold)] hover:underline break-all">
                  {email}
                </a>
                <a href={`mailto:${email}`} className="admin-btn-primary text-xs shrink-0">
                  Email
                </a>
              </div>
              {showSource ? (
                <span className="text-[11px] block w-full" style={{ color: "var(--admin-muted)" }}>
                  Source: {emailSource}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No email found yet
            </span>
          )}
        </Row>
        <Row label="Facebook">
          {hasFb ? (
            <>
              <a href={facebookUrl!} target="_blank" rel="noreferrer" className="text-sm text-[var(--admin-gold)] hover:underline break-all">
                Open page
              </a>
              <a href={facebookUrl!} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs shrink-0">
                Open Facebook
              </a>
            </>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No Facebook link yet
            </span>
          )}
        </Row>
        <Row label="Phone">
          {hasPhone ? (
            <>
              <a href={`tel:${phone}`} className="text-sm text-[var(--admin-gold)] hover:underline">
                {phone}
              </a>
              <a href={`tel:${phone}`} className="admin-btn-ghost text-xs shrink-0">
                Call
              </a>
            </>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No phone yet
            </span>
          )}
        </Row>
        <Row label="Website">
          {hasWeb ? (
            <>
              <a href={website!} target="_blank" rel="noreferrer" className="text-sm text-[var(--admin-gold)] hover:underline break-all">
                {website}
              </a>
              <a href={website!} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs shrink-0">
                Visit site
              </a>
            </>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No website yet
            </span>
          )}
        </Row>
        <Row label="Contact page">
          {hasContact ? (
            <>
              <span className="text-xs" style={{ color: "var(--admin-fg)" }}>
                Form / page
              </span>
              <a href={contactPage!} target="_blank" rel="noreferrer" className="admin-btn-ghost text-xs shrink-0">
                Open contact page
              </a>
            </>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--admin-muted)" }}>
              No contact page yet
            </span>
          )}
        </Row>
      </div>
      {previewLeadId ? (
        <div className="pt-1">
          <Link href={`/preview/${encodeURIComponent(previewLeadId)}`} target="_blank" className="admin-btn-ghost text-xs inline-block">
            Client site draft
          </Link>
        </div>
      ) : null}
    </section>
  );
}