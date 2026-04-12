import type { ShowcaseProject } from "@/lib/live-web-projects";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark";

function bodyMuted(isLight: boolean) {
  return isLight ? "text-sm leading-relaxed text-[#354239] md:text-[15px]" : "text-sm leading-relaxed text-[#E8FDF5]/78";
}

/** Audience + problem — rendered after title, before the main result line. */
export function ShowcaseCaseStudyBeforePrimary({
  project,
  variant,
  className,
  /** When set, overrides `project.audienceLine` for the top line. */
  audienceLine,
}: {
  project: ShowcaseProject;
  variant: Variant;
  className?: string;
  audienceLine?: string;
}) {
  const isLight = variant === "light";
  const topLine = audienceLine ?? project.audienceLine;
  if (!topLine && !project.problemLine) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {topLine ? (
        <p
          className={cn(
            "text-sm font-semibold leading-snug md:text-[15px]",
            isLight ? "text-[#3d4a41]" : "text-[#E8FDF5]/92",
          )}
        >
          {topLine}
        </p>
      ) : null}
      {project.problemLine ? <p className={bodyMuted(isLight)}>{project.problemLine}</p> : null}
    </div>
  );
}

/** Why it works + optional “how it was built” details — after supporting description. */
export function ShowcaseCaseStudyAfterContext({
  project,
  variant,
  className,
}: {
  project: ShowcaseProject;
  variant: Variant;
  className?: string;
}) {
  const isLight = variant === "light";
  const hasDetails = Boolean(project.buildHighlights?.length);
  if (!project.engagementLine && !project.whyItWorksLine && !hasDetails) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {project.engagementLine ? (
        <p
          className={cn(
            "text-sm font-medium italic leading-relaxed md:text-[15px]",
            isLight ? "text-[#3f5a47]" : "text-[#c5ddd2]",
          )}
        >
          {project.engagementLine}
        </p>
      ) : null}
      {project.whyItWorksLine ? (
        <p className={cn("text-sm font-medium leading-relaxed md:text-[15px]", isLight ? "text-[#3d4a41]" : "text-[#E8FDF5]/88")}>
          {project.whyItWorksLine}
        </p>
      ) : null}
      {hasDetails ? (
        <details
          className={cn(
            "rounded-xl border px-3.5 py-2.5 shadow-sm open:shadow-md",
            isLight
              ? "border-[#3f5a47]/16 bg-white/60 text-[#1e241f] open:ring-1 open:ring-[#b85c1e]/12"
              : "border-white/14 bg-black/25 text-[#E8FDF5] open:ring-1 open:ring-white/10",
          )}
        >
          <summary
            className={cn(
              "cursor-pointer list-none text-sm font-bold leading-snug outline-none [&::-webkit-details-marker]:hidden",
              isLight ? "text-[#3f5a47]" : "text-[#eab08a]",
            )}
          >
            See how this was built
          </summary>
          <ul
            className={cn(
              "mt-3 space-y-2 border-t pt-3 text-sm leading-snug",
              isLight ? "border-[#3f5a47]/10 text-[#354239]" : "border-white/10 text-[#E8FDF5]/82",
            )}
          >
            {project.buildHighlights?.map((line) => (
              <li key={line} className="flex gap-2 pl-0.5">
                <span className={cn("font-bold", isLight ? "text-[#3f5a47]" : "text-[#c5ddd2]")} aria-hidden>
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
