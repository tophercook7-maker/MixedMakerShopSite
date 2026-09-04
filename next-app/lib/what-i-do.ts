/**
 * The single source of truth for "everything Topher does" — mirrors the
 * Everything_I_Do_Services PDF. Used by the homepage, /start-here, the contact
 * form topic picker, nav, and footer so every surface tells the same story.
 */

export type WhatIDoCategory = {
  /** Stable slug — also the `?topic=` value on /contact. */
  slug: string;
  /** Short nav / card label. */
  label: string;
  /** Card headline. */
  title: string;
  /** One-line "who this is for" framing. */
  lead: string;
  /** The PDF bullets, verbatim where possible. */
  items: readonly string[];
  /** Price anchor shown on the card — honest, not a lowball. */
  price: string;
  /** Where the card links. */
  href: string;
  cta: string;
  /** Lucide icon name (resolved in the component). */
  icon: "Globe" | "Sparkles" | "BookOpen" | "Wrench" | "Box" | "TreePine" | "FlaskConical";
};

export const WHAT_I_DO: readonly WhatIDoCategory[] = [
  {
    slug: "websites",
    label: "Websites & Apps",
    title: "Websites, Apps & Software",
    lead: "A site that brings in calls, or a tool built around one real job.",
    items: [
      "Website design and development",
      "Business websites and landing pages",
      "Web apps and custom software",
      "AI-powered websites and tools",
      "Website improvements, redesigns and troubleshooting",
    ],
    price: "Landing pages from $100 · sites from $400",
    href: "/web-design",
    cta: "See web design & pricing",
    icon: "Globe",
  },
  {
    slug: "ai-automation",
    label: "AI & Automation",
    title: "AI & Automation",
    lead: "Practical AI that removes repetitive work — built to be owned, not rented.",
    items: [
      "AI systems and AI agents",
      "AI automations and workflows",
      "Custom AI tools",
      "Local AI and computer-based AI projects",
      "Voice AI and voice-cloning projects",
      "Connecting AI with other software and devices",
    ],
    price: "AI bots from $200 with a site build · projects quoted",
    href: "/ai-business-tools",
    cta: "See AI & automation",
    icon: "Sparkles",
  },
  {
    slug: "books-audio-creative",
    label: "Books & Creative",
    title: "Books, Audio & Creative Projects",
    lead: "From manuscript to published book, audiobook, trailer, or logo.",
    items: [
      "Books and ebooks",
      "Audiobooks",
      "Book trailers and promotional videos",
      "Logos and graphics",
      "Digital content and creative projects",
    ],
    price: "Flyers & graphics from $50 · book trailers from $79",
    href: "/lab#books",
    cta: "See books & creative work",
    icon: "BookOpen",
  },
  {
    slug: "computers",
    label: "Computer Help",
    title: "Computers & Technology",
    lead: "In-home help around Hot Springs — the same work I've done since 2000.",
    items: [
      "In-home computer repair",
      "Computer setup and troubleshooting",
      "Computer tutoring and technology help",
      "Hardware upgrades and projects",
      "Helping people understand and use their technology",
    ],
    price: "Tune-ups from $99 · house calls quoted up front",
    href: "/in-home-computer-repair",
    cta: "Get computer help",
    icon: "Wrench",
  },
  {
    slug: "3d-printing",
    label: "3D Printing",
    title: "3D Printing",
    lead: "Three printers ready for parts, replacements, decorations, and custom pieces.",
    items: [
      "Prints from existing design libraries and printable models",
      "Replacement parts and useful household pieces",
      "Decorations, gifts, and small-batch runs",
      "Custom solutions when the part doesn't exist yet",
    ],
    price: "Quoted per print — send a file or a photo",
    href: "/3d-printing",
    cta: "Request a print",
    icon: "Box",
  },
  {
    slug: "family-history",
    label: "Family History",
    title: "Genealogy & Family History",
    lead: "Find out where your family came from — organized, researched, and printed.",
    items: [
      "Family-tree research with Family Tree Maker",
      "Organizing the family information you already have",
      "Researching the history behind the names and relationships",
      "Printable trees, charts, and family-history books",
    ],
    price: "Starts at $100 · priced by how deep you go · payment plans OK",
    href: "/family-history",
    cta: "Start a family tree",
    icon: "TreePine",
  },
  {
    slug: "ideas",
    label: "Ideas & Inventions",
    title: "Ideas, Experiments & Inventions",
    lead: "Have an unusual idea? Let's figure out how to build a version you can actually try.",
    items: [
      "Prototypes and experiments",
      "Figuring out how to build unusual ideas",
      "Technology experiments",
      "AI + hardware concepts",
      "Automation ideas",
      "Turning an idea into something you can actually try",
    ],
    price: "Free first conversation · prototypes quoted",
    href: "/contact?topic=ideas",
    cta: "Tell me the idea",
    icon: "FlaskConical",
  },
] as const;

/** Options for the contact-form topic picker (same order as the cards). */
export const CONTACT_TOPICS: readonly { value: string; label: string }[] = [
  ...WHAT_I_DO.map((c) => ({ value: c.slug, label: c.title })),
  { value: "other", label: "Something else" },
];

export function contactHrefForTopic(slug: string): string {
  return `/contact?topic=${encodeURIComponent(slug)}`;
}
