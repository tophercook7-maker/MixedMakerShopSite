export type ResourceCategory =
  | "website-planning"
  | "local-presence"
  | "3d-printing"
  | "ai-workflows"
  | "project-planning";

export type ResourceRegistryEntry = {
  slug: string;
  title: string;
  shortDescription: string;
  whoItHelps: string;
  /** Target URL when the PDF is published (served from /public). */
  filePath: string;
  category: ResourceCategory;
  /** Stable id for analytics (snake_case). */
  analyticsId: string;
  /** When true, TrackedDownloadLink serves a real file; when false, request-only until files ship. */
  downloadPublished: boolean;
  /** Short bullets for “What’s inside” on the detail page. */
  contentsBullets: readonly string[];
};

export const RESOURCE_ENTRIES = [
  {
    slug: "website-starter-checklist",
    title: "Website Starter Checklist",
    shortDescription:
      "A practical prep list before you write copy or pick a theme — pages to plan, photos to gather, trust signals, and decisions worth locking early.",
    whoItHelps: "Owners launching or rebooting a small-business site who want fewer surprises and clearer next steps.",
    filePath: "/downloads/website-starter-checklist.pdf",
    category: "website-planning",
    analyticsId: "website_starter_checklist",
    downloadPublished: false,
    contentsBullets: [
      "Core pages and angles to decide before design starts",
      "Photo and proof assets that speed up build week",
      "Trust and contact patterns visitors actually use",
      "What to have ready so messaging stays consistent",
    ],
  },
  {
    slug: "local-business-website-audit-sheet",
    title: "Local Business Website Audit Sheet",
    shortDescription:
      "A structured pass over your current site or placeholder — messaging clarity, mobile basics, contact paths, and quick fixes that matter for local search.",
    whoItHelps: "Shops and trades already online but unsure what’s hurting calls, directions, or quote requests.",
    filePath: "/downloads/local-business-website-audit-sheet.pdf",
    category: "local-presence",
    analyticsId: "local_business_website_audit_sheet",
    downloadPublished: false,
    contentsBullets: [
      "First-glance clarity and offer framing",
      "Mobile usability and tap-to-contact checks",
      "Local credibility signals reviewers notice fast",
      "Simple prioritization: fix now vs. schedule later",
    ],
  },
  {
    slug: "3d-print-request-prep-sheet",
    title: "3D Print Request Prep Sheet",
    shortDescription:
      "Capture dimensions, use case, tolerances, and references so a quote isn’t a guessing game — built around real print desk workflows.",
    whoItHelps: "Makers and businesses ordering custom prints who want fewer round trips and clearer quotes.",
    filePath: "/downloads/3d-print-request-prep-sheet.pdf",
    category: "3d-printing",
    analyticsId: "print_request_prep_sheet",
    downloadPublished: false,
    contentsBullets: [
      "Use case and environment constraints",
      "Size targets and fit expectations",
      "Reference photos and must-have features",
      "Quantity, timeline, and finish preferences",
    ],
  },
  {
    slug: "ai-workflow-starter-pack",
    title: "AI Workflow Starter Pack",
    shortDescription:
      "Plain-language notes on where lightweight AI helpers tend to pay off — drafts with review, triage, reminders — without pretending software replaces judgment.",
    whoItHelps: "Small teams curious about AI but allergic to hype and fragile automation.",
    filePath: "/downloads/ai-workflow-starter-pack.pdf",
    category: "ai-workflows",
    analyticsId: "ai_workflow_starter_pack",
    downloadPublished: false,
    contentsBullets: [
      "Patterns that keep humans in the loop",
      "Where drafts beat autopilot for customer-facing work",
      "Simple triage ideas for leads and inboxes",
      "Guardrails that prevent embarrassing sends",
    ],
  },
  {
    slug: "project-idea-capture-sheet",
    title: "Project Idea Capture Sheet",
    shortDescription:
      "One page for problem, audience, constraints, and success criteria — so scope conversations start grounded instead of fuzzy.",
    whoItHelps: "Anyone about to invest time or budget in a website, tool, or build who needs alignment before vendors quotes.",
    filePath: "/downloads/project-idea-capture-sheet.pdf",
    category: "project-planning",
    analyticsId: "project_idea_capture_sheet",
    downloadPublished: false,
    contentsBullets: [
      "Problem statement and who it’s for",
      "Must-haves vs. nice-to-haves",
      "Timeline, budget band, and risks",
      "Definition of “done” stakeholders can agree on",
    ],
  },
] as const satisfies readonly ResourceRegistryEntry[];

const bySlug = new Map<string, ResourceRegistryEntry>(RESOURCE_ENTRIES.map((r) => [r.slug, r]));

export function getResourceBySlug(slug: string): ResourceRegistryEntry | undefined {
  return bySlug.get(slug);
}

export function listResourceSlugs(): string[] {
  return RESOURCE_ENTRIES.map((r) => r.slug);
}

export function categoryLabel(cat: ResourceCategory): string {
  switch (cat) {
    case "website-planning":
      return "Website planning";
    case "local-presence":
      return "Local presence";
    case "3d-printing":
      return "3D printing";
    case "ai-workflows":
      return "AI workflows";
    case "project-planning":
      return "Project planning";
  }
}
