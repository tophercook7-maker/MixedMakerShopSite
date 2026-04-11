/** Deep-merge plain objects; arrays and scalars from `override` replace entirely. */
export function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T> | undefined): T {
  if (!override) return structuredClone(base);
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override) as (keyof T)[]) {
    const v = override[key];
    if (v === undefined) continue;
    const b = base[key];
    if (isPlainObject(b) && isPlainObject(v)) {
      out[key as string] = deepMerge(b as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[key as string] = v as unknown;
    }
  }
  return out as T;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
