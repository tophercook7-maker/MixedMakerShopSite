import { leads } from "@/lib/leads-data";

export const metadata = {
  title: "Local leads (sample)",
  robots: { index: false, follow: false },
};

export default function LocalLeadsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Local leads</h1>
      {leads.map((lead) => (
        <div key={lead.id} className="border border-neutral-200 dark:border-neutral-700 p-4 rounded-lg mb-3 bg-white dark:bg-neutral-900">
          <h3 className="text-lg font-medium">{lead.businessName}</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {lead.category} • {lead.location}
          </p>

          {lead.email ? (
            <a href={`mailto:${lead.email}`} className="text-blue-600 dark:text-blue-400 block mt-2 hover:underline">
              Email
            </a>
          ) : null}

          {lead.facebook ? (
            <a
              href={lead.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 block mt-1 hover:underline"
            >
              Facebook
            </a>
          ) : null}

          <p className="mt-2">
            <span className="text-neutral-500 dark:text-neutral-400">Status:</span> {lead.status}
          </p>
          {lead.notes ? <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{lead.notes}</p> : null}
        </div>
      ))}
    </main>
  );
}
