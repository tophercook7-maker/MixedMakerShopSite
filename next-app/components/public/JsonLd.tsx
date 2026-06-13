/**
 * Renders one or more schema.org objects as a JSON-LD <script>.
 * Use on public pages that need per-page structured data (Service, FAQPage, Article, …)
 * in addition to the site-wide graph injected in app/layout.tsx.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
