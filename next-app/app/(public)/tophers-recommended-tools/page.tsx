type ToolItem = {
  name: string;
  description: string;
  whyItMatters: string;
  href: string;
};

const websiteEssentials: ToolItem[] = [
  {
    name: "Domain Provider",
    description: "A reliable place to register and manage your business domain name.",
    whyItMatters: "Your domain is the foundation of your website and email credibility.",
    href: "#domain-provider-link",
  },
  {
    name: "Hosting",
    description: "Fast, stable hosting that keeps your site online and responsive.",
    whyItMatters: "Slow or unstable hosting causes lost trust and fewer contact requests.",
    href: "#hosting-link",
  },
  {
    name: "Website Platform",
    description: "The core platform used to design, build, and update your website.",
    whyItMatters: "The right platform makes future updates easier and keeps things secure.",
    href: "#website-platform-link",
  },
];

const businessTools: ToolItem[] = [
  {
    name: "Email",
    description: "A professional inbox setup for client communication and follow-up.",
    whyItMatters: "A business email helps you look trustworthy and respond quickly.",
    href: "#email-tool-link",
  },
  {
    name: "Invoicing",
    description: "Simple invoicing software for quotes, payments, and records.",
    whyItMatters: "Clear billing systems reduce confusion and improve cash flow.",
    href: "#invoicing-tool-link",
  },
  {
    name: "Client Communication",
    description: "A lightweight tool for sharing updates, files, and project notes.",
    whyItMatters: "Consistent communication keeps projects moving and expectations clear.",
    href: "#client-communication-link",
  },
];

const mySetup: ToolItem[] = [
  {
    name: "Build Stack",
    description: "The exact core stack I use to build and launch modern client sites.",
    whyItMatters: "Using a proven stack means your site is easier to maintain over time.",
    href: "#build-stack-link",
  },
  {
    name: "Performance + SEO Checks",
    description: "Audit tools I use to verify speed, mobile usability, and on-page quality.",
    whyItMatters: "A site that loads quickly and reads clearly gets better engagement.",
    href: "#performance-seo-link",
  },
  {
    name: "Forms + Lead Capture",
    description: "Tools for contact forms and lead notifications so inquiries are not missed.",
    whyItMatters: "Good lead capture turns website traffic into real customer conversations.",
    href: "#forms-lead-capture-link",
  },
];

function ToolSection({ title, subtitle, items }: { title: string; subtitle: string; items: ToolItem[] }) {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-heading" style={{ marginBottom: 8 }}>
          {title}
        </h2>
        <p className="small" style={{ margin: "0 0 16px", maxWidth: 760 }}>
          {subtitle}
        </p>
        <div className="grid-2">
          {items.map((item) => (
            <article key={item.name} className="card">
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{item.name}</h3>
              <p className="small" style={{ margin: "0 0 10px" }}>
                {item.description}
              </p>
              <p className="small" style={{ margin: "0 0 14px" }}>
                <strong>Why it matters:</strong> {item.whyItMatters}
              </p>
              <a href={item.href} className="btn ghost">
                View Tool
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export const metadata = {
  title: "Topher's Recommended Tools",
  description: "Helpful tools I use to build clean, trustworthy websites for small businesses.",
};

export default function TophersRecommendedToolsPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="panel" style={{ padding: "36px 28px" }}>
            <p className="small" style={{ margin: "0 0 8px", letterSpacing: ".12em", opacity: 0.8 }}>
              TOPHER&apos;S WEB DESIGN
            </p>
            <h1 className="h1" style={{ marginBottom: 10 }}>
              Tools I Use to Build Websites That Actually Work
            </h1>
            <p className="subhead" style={{ maxWidth: 760 }}>
              A practical list of tools I trust for domains, hosting, communication, and day-to-day client work.
            </p>
          </div>
        </div>
      </section>

      <ToolSection
        title="Website Essentials"
        subtitle="Core website tools that affect speed, reliability, and long-term maintainability."
        items={websiteEssentials}
      />

      <ToolSection
        title="Business Tools"
        subtitle="Simple business systems that make communication and billing smoother."
        items={businessTools}
      />

      <ToolSection
        title="My Setup"
        subtitle="This is the same stack and workflow I use when building client websites."
        items={mySetup}
      />

      <footer className="section" style={{ paddingTop: 18 }}>
        <div className="container">
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Topher&apos;s Web Design</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
