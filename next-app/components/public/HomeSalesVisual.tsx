/** Hero visual — layered mock cards + glow (homepage sales). */
export function HomeSalesVisual() {
  return (
    <div className="home-sales-visual" aria-hidden="true">
      <div className="home-sales-visual-glow" />
      <div className="home-sales-stack">
        <div className="home-sales-browser home-sales-browser--back" />
        <div className="home-sales-browser home-sales-browser--mid" />
        <div className="home-sales-browser home-sales-browser--front">
          <div className="home-sales-browser-chrome">
            <span />
            <span />
            <span />
          </div>
          <div className="home-sales-browser-body">
            <div className="home-sales-browser-line home-sales-browser-line--long" />
            <div className="home-sales-browser-line" />
            <div className="home-sales-browser-blocks">
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
      <div className="home-sales-badges">
        <span className="home-sales-badge">
          <span className="home-sales-badge-dot" />
          Calls up
        </span>
        <span className="home-sales-badge home-sales-badge--gold">Local SEO</span>
      </div>
    </div>
  );
}
