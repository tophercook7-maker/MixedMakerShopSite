import {
  MOCKUP_LEAD_STATUS_LABELS,
  mockupLeadStatusBadgeTone,
  type MockupLeadStatus,
} from "@/lib/lead-status";

const toneClass: Record<
  ReturnType<typeof mockupLeadStatusBadgeTone>,
  string
> = {
  neutral: "border-white/15 bg-white/5 text-zinc-200",
  info: "border-sky-500/35 bg-sky-500/10 text-sky-100",
  progress: "border-violet-500/35 bg-violet-500/10 text-violet-100",
  positive: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  closed: "border-white/12 bg-black/25 text-zinc-400",
};

type Props = {
  status: MockupLeadStatus;
  className?: string;
};

export function MockupLeadStatusBadge({ status, className = "" }: Props) {
  const tone = mockupLeadStatusBadgeTone(status);
  const label = MOCKUP_LEAD_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${toneClass[tone]} ${className}`.trim()}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
