/** Scroll to an in-page anchor (`#id` or bare id). Returns whether a target was found. */
export function scrollToHashTarget(hashOrId: string, behavior: ScrollBehavior = "smooth"): boolean {
  if (typeof document === "undefined") return false;
  const id = hashOrId.replace(/^#/, "").trim();
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

/** Update the URL hash without jumping (after programmatic scroll). */
export function pushHashToHistory(hash: string) {
  if (typeof window === "undefined") return;
  const normalized = hash.startsWith("#") ? hash : `#${hash}`;
  if (window.location.hash === normalized) return;
  window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${normalized}`);
}
