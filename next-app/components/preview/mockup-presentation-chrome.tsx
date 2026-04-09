import Link from "next/link";

function safeName(name: string): string {
  const t = String(name || "").trim();
  return t || "your business";
}

/**
 * Minimal branded frame above client-ready CRM mockup previews.
 */
export function MockupPresentationHeader({ businessName }: { businessName: string }) {
  const bn = safeName(businessName);
  return (
    <header
      className="mockup-pres-header"
      style={{
        borderBottom: "1px solid color-mix(in srgb, var(--foreground, #0f172a) 8%, transparent)",
        background: "color-mix(in srgb, var(--background, #fff) 96%, var(--foreground, #0f172a) 4%)",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "min(100vw - 32px, 1680px)",
          margin: "0 auto",
          padding: "14px max(20px, 3vw)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            letterSpacing: "0.02em",
            fontWeight: 600,
            color: "var(--foreground, #0f172a)",
          }}
        >
          Custom Website Preview for {bn}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.75rem",
            color: "var(--muted-foreground, #64748b)",
          }}
        >
          Built by Topher at MixedMakerShop
        </p>
      </div>
    </header>
  );
}

/** Single primary CTA + optional secondary line — kept sparse on purpose. */
export function MockupPresentationCtaStrip() {
  return (
    <section
      className="mockup-pres-cta"
      style={{
        borderTop: "1px solid color-mix(in srgb, var(--foreground, #0f172a) 8%, transparent)",
        background: "var(--background, #fff)",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "min(100vw - 32px, 1680px)",
          margin: "0 auto",
          padding: "20px max(20px, 3vw) 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)", maxWidth: 420 }}>
          Want this built for your business? Request your own preview — same polished direction, tailored to you.
        </p>
        <Link
          href="/free-mockup"
          className="mockup-pres-cta-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 18px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: "0.8125rem",
            textDecoration: "none",
            background: "var(--foreground, #0f172a)",
            color: "var(--background, #fff)",
            whiteSpace: "nowrap",
          }}
        >
          Get My Free Website Preview
        </Link>
      </div>
    </section>
  );
}
