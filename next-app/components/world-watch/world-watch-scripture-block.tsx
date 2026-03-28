export function WorldWatchScriptureBlock({
  reference,
  text,
}: {
  reference?: string | null;
  text?: string | null;
}) {
  if (!reference && !text) return null;
  return (
    <aside className="border-l-2 border-teal-500/25 bg-teal-500/[0.04] py-3 pl-4 pr-3">
      {reference ? (
        <p className="text-xs font-medium uppercase tracking-wide text-teal-200/75">{reference}</p>
      ) : null}
      {text ? (
        <p className="mt-2 text-sm italic leading-relaxed text-slate-400">{text}</p>
      ) : null}
    </aside>
  );
}
