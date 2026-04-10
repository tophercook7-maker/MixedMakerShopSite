import Link from "next/link";

function safeName(name: string): string {
  const t = String(name || "").trim();
  return t || "your business";
}

/**
 * Minimal branded frame above client-ready CRM mockup previews (live `/preview` route).
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
          padding: "18px max(20px, 3vw) 20px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            letterSpacing: "0.02em",
            fontWeight: 600,
            color: "var(--foreground, #0f172a)",
            lineHeight: 1.35,
          }}
        >
          Custom Website Preview for {bn}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "0.75rem",
            letterSpacing: "0.01em",
            color: "var(--muted-foreground, #64748b)",
            lineHeight: 1.45,
          }}
        >
          Built by Topher at MixedMakerShop
        </p>
      </div>
    </header>
  );
}

/** MixedMakerShop follow-up — business-facing tone; CTA is not inside the client mockup body. */
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
          padding: "22px max(20px, 3vw) 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)", maxWidth: 440, lineHeight: 1.55 }}>
          Like this direction? I can refine it into a full site — reach out when you&apos;re ready.
        </p>
        <Link
          href="/contact"
          className="mockup-pres-cta-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 20px",
            borderRadius: 999,
            fontWeight: 600,
            fontSize: "0.8125rem",
            textDecoration: "none",
            background: "var(--foreground, #0f172a)",
            color: "var(--background, #fff)",
            whiteSpace: "nowrap",
          }}
        >
          Contact Topher
        </Link>
      </div>
    </section>
  );
}
