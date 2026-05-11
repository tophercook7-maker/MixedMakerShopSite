export function ScoutWebsiteFocusBanner() {
  return (
    <section
      className="admin-card mb-4 border-l-4"
      style={{ borderLeftColor: "var(--admin-gold)", background: "rgba(0,0,0,.2)" }}
    >
      <h2 className="text-sm font-bold mb-2" style={{ color: "var(--admin-fg)" }}>
        Live website review
      </h2>
      <p className="text-sm mb-3" style={{ color: "var(--admin-muted)" }}>
        Scout <strong className="text-[var(--admin-fg)]">never</strong> takes website pictures. It reads the link and
        returns useful text: <strong className="text-[var(--admin-fg)]">business info</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">page copy</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">contact info</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">services</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">CTAs</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">SEO basics</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">issues</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">recommendations</strong>,{" "}
        <strong className="text-[var(--admin-fg)]">outreach angles</strong>, and{" "}
        <strong className="text-[var(--admin-fg)]">opportunities</strong> (via live page / link review — no screenshots).
      </p>
      <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
        Prioritize businesses with <strong className="text-[var(--admin-fg)]">no website</strong> or a weak site (no
        HTTPS, thin trust signals, bad mobile, missing CTA, or free-email contacts).
      </p>
      <ul className="text-xs space-y-1 columns-1 sm:columns-2 gap-4" style={{ color: "var(--admin-muted)" }}>
        <li>• Direct website link + live page text signals</li>
        <li>• City, state, niche, source</li>
        <li>• Social presence &amp; active business signals</li>
        <li>• Domain email vs Gmail/Yahoo</li>
      </ul>
    </section>
  );
}
