import Link from "next/link";

const PLACEHOLDER_PROJECTS = [
  { name: "Small business site", tag: "Web" },
  { name: "Restaurant redesign", tag: "Web" },
  { name: "Landing page", tag: "Web" },
];

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      <p className="mt-2 text-muted-foreground">Recent website projects.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_PROJECTS.map((p) => (
          <div key={p.name} className="rounded-lg border bg-card p-4">
            <span className="text-xs font-medium text-muted-foreground">{p.tag}</span>
            <h2 className="mt-2 font-semibold">{p.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
