export function ScoutWebsiteFocusBanner() {
  return (
    <section
      className="admin-card mb-4 border-l-4"
      style={{ borderLeftColor: "var(--admin-gold)", background: "rgba(0,0,0,.2)" }}
    >
      <h2 className="text-sm font-bold mb-2" style={{ color: "var(--admin-fg)" }}>
        Website-first scouting
      </h2>
      <p className="text-sm mb-3" style={{ color: "var(--admin-muted)" }}>
        Prioritize businesses with <strong className="text-[var(--admin-fg)]">no website</strong> or a weak site: no HTTPS,
        generic branding, missing CTA, bad mobile, or free-email contacts. Strongest matches usually have no real site at
        all.
      </p>
      <ul className="text-xs space-y-1 columns-1 sm:columns-2 gap-4" style={{ color: "var(--admin-muted)" }}>
        <li>• No website vs live / broken</li>
        <li>• City, state, niche, source</li>
        <li>• Social presence & active business signals</li>
        <li>• Domain email vs Gmail/Yahoo</li>
      </ul>
    </section>
  );
}
