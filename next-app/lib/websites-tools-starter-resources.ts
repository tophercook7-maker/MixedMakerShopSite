/** Starter kit titles + blurbs for /websites-tools#templates-kits (single source of truth for copy + validation). */
export const STARTER_RESOURCE_TITLES = [
  "Website Starter Checklist",
  "Local Business Website Audit Sheet",
  "3D Print Request Prep Sheet",
  "AI Workflow Starter Pack",
  "Project Idea Capture Sheet",
] as const;

export type StarterResourceTitle = (typeof STARTER_RESOURCE_TITLES)[number];

export const STARTER_RESOURCE_ITEMS: ReadonlyArray<{ title: StarterResourceTitle; body: string }> = [
  {
    title: "Website Starter Checklist",
    body: "A practical list for owners who want to ship a clearer site: pages to plan, photos to gather, trust signals, and what to decide before you write copy.",
  },
  {
    title: "Local Business Website Audit Sheet",
    body: "A structured pass over your current site or placeholder page — messaging, mobile basics, contact paths, and quick fixes that often matter most locally.",
  },
  {
    title: "3D Print Request Prep Sheet",
    body: "Helps you describe size, use case, photos, and constraints so a print quote isn't a guessing game.",
  },
  {
    title: "AI Workflow Starter Pack",
    body: "Guidance notes on where simple AI helpers tend to help without guesswork: drafts with review steps, lead sorting, and reminders — not autopilot.",
  },
  {
    title: "Project Idea Capture Sheet",
    body: "Capture the problem, audience, constraints, and success criteria in one place before you invest time or budget.",
  },
];
