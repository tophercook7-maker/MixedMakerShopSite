export const FUNNEL_DESIGN_DIRECTION_IDS = [
  "clean-professional",
  "bold-modern",
  "local-trust",
  "premium-polished",
  "simple-direct",
] as const;

export type FunnelDesignDirectionId = (typeof FUNNEL_DESIGN_DIRECTION_IDS)[number];

export type FunnelDesignDirectionOption = {
  id: FunnelDesignDirectionId;
  label: string;
  description: string;
  bestFor: string;
};

export const FUNNEL_DESIGN_DIRECTION_OPTIONS: FunnelDesignDirectionOption[] = [
  {
    id: "clean-professional",
    label: "Clean & Professional",
    description:
      "A polished, trustworthy look with clear structure — easy to scan and easy to trust.",
    bestFor: "Service businesses that want a polished, trustworthy look",
  },
  {
    id: "bold-modern",
    label: "Bold & Modern",
    description:
      "Stronger presence and a sharper, more contemporary feel — confident without clutter.",
    bestFor: "Businesses that want a sharper, more modern feel",
  },
  {
    id: "local-trust",
    label: "Local & Trustworthy",
    description:
      "Friendly local tone that reinforces reputation and makes the next step obvious.",
    bestFor: "Local service businesses that rely on calls and reputation",
  },
  {
    id: "premium-polished",
    label: "Premium & Polished",
    description:
      "More elevated visuals and spacing — a step up without feeling flashy.",
    bestFor: "Businesses that want a more high-end look",
  },
  {
    id: "simple-direct",
    label: "Simple & Direct",
    description:
      "Clarity first: fewer distractions, faster “here’s what you get” messaging.",
    bestFor: "Businesses that want clarity and speed over extra design flair",
  },
];

export function isFunnelDesignDirectionId(v: string): v is FunnelDesignDirectionId {
  return (FUNNEL_DESIGN_DIRECTION_IDS as readonly string[]).includes(v);
}

type StylePreset = "clean-modern" | "bold-premium" | "friendly-local" | "minimal-elegant";
type ColorPreset = "blue" | "green" | "dark" | "warm-neutral" | "bold-accent" | "wellness";

/** Maps visitor-facing design direction to presentation presets (industry still picks layout template when applicable). */
export function presetsForDesignDirection(
  key: string
): { stylePreset: StylePreset; colorPreset: ColorPreset } | null {
  const k = String(key || "").trim();
  if (!isFunnelDesignDirectionId(k)) return null;
  switch (k) {
    case "clean-professional":
      return { stylePreset: "clean-modern", colorPreset: "blue" };
    case "bold-modern":
      return { stylePreset: "bold-premium", colorPreset: "bold-accent" };
    case "local-trust":
      return { stylePreset: "friendly-local", colorPreset: "green" };
    case "premium-polished":
      return { stylePreset: "minimal-elegant", colorPreset: "dark" };
    case "simple-direct":
      return { stylePreset: "minimal-elegant", colorPreset: "warm-neutral" };
    default:
      return null;
  }
}
