import Link from "next/link";

export const metadata = {
  title: "MixedMakerShop Studio | Building, Creating, Experimenting",
  description:
    "MixedMakerShop is Topher Cook's creative studio for building projects, experiments, and digital ideas. Need a website? Visit the dedicated web design page.",
};

export default function HomePage() {
  return (
    <>
      {/* 1) Hero */}
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: 860 }}>
            <div className="kicker">
              <span className="dot" /> MixedMakerShop Studio • Build • Create • Experiment
            </div>
            <h1 className="h1">A studio for building practical projects, creative ideas, and useful digital tools</h1>
            <p className="subhead">
              MixedMakerShop is where I design, prototype, and ship ideas across web, products, and local-business
              tools.
            </p>
          </div>
        </div>
      </section>

      {/* 2) What this studio does */}
      <section className="section" id="studio-focus">
        <div className="container">
          <h2 className="section-heading">What I Build</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            A focused mix of client work, internal products, and creative experiments.
          </p>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Web and product builds</h3>
              <p className="how-it-works-copy">Practical digital work designed to solve real user and business needs.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Creative experiments</h3>
              <p className="how-it-works-copy">Fast prototypes, visual directions, and new ideas tested in public.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Systems and process</h3>
              <p className="how-it-works-copy">Tools and workflows that make building faster and cleaner over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3) Projects and ideas */}
      <section className="section" id="sample-work">
        <div className="container">
          <h2 className="section-heading">Projects and Ideas</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            A snapshot of what I am actively creating and refining.
          </p>
          <div className="how-it-works-grid" style={{ marginBottom: 18 }}>
            <div className="card project-card">
              <h3 style={{ margin: "0 0 10px" }}>Website samples and redesigns</h3>
              <p className="small" style={{ margin: "0 0 16px", flex: 1, color: "var(--muted)" }}>
                Recent homepage concepts and polished samples for local business categories.
              </p>
            </div>
            <div className="card project-card">
              <h3 style={{ margin: "0 0 10px" }}>AI-assisted build workflows</h3>
              <p className="small" style={{ margin: "0 0 16px", flex: 1, color: "var(--muted)" }}>
                Internal systems for generating, refining, and shipping faster.
              </p>
            </div>
            <div className="card project-card">
              <h3 style={{ margin: "0 0 10px" }}>Creative concept testing</h3>
              <p className="small" style={{ margin: "0 0 16px", flex: 1, color: "var(--muted)" }}>
                Design and copy experiments that evolve into real production direction.
              </p>
            </div>
          </div>
          <p className="small" style={{ margin: 0 }}>
            Want to see website-specific work? <Link href="/website-samples">Browse website samples</Link>.
          </p>
        </div>
      </section>

      {/* 4) Need a website path */}
      <section className="section" id="need-a-website">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Need a website?</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              Topher Web Design is a dedicated sales experience with focused messaging, examples, pricing, and a clear
              next step.
            </p>
            <div className="btn-row">
              <Link className="btn gold" href="/web-design">
                Go to Topher Web Design
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5) Studio principles */}
      <section className="section" id="why-choose">
        <div className="container">
          <h2 className="section-heading">Studio Principles</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            How projects are approached, built, and shipped.
          </p>
          <div className="trust-points-grid">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Clarity over noise</h3>
              <p className="how-it-works-copy">Simple, usable structure before unnecessary complexity.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Build in the open</h3>
              <p className="how-it-works-copy">Experiment, test, and improve quickly using real feedback.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Ship practical outcomes</h3>
              <p className="how-it-works-copy">Prioritize work that makes the next version genuinely better.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
