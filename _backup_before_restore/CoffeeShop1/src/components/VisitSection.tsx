const infoCards = [
  {
    title: "Address",
    body: "101 Central Ave\nHot Springs, AR 71901"
  },
  {
    title: "Hours",
    body: "Mon–Fri: 7am–6pm\nSat–Sun: 8am–5pm"
  },
  {
    title: "Contact",
    body: "(501) 555-0199\nhello@beanbliss.coffee"
  }
];

export function VisitSection() {
  return (
    <section id="visit" className="bg-stone-50 py-20 dark:bg-roast dark:text-stone-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="section-header logo-font text-5xl font-bold">Visit Us</h2>
          <p className="mt-6 text-lg text-stone-600 dark:text-stone-300">Mock location and hours for portfolio use.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {infoCards.map((card) => (
            <article key={card.title} className="rounded-3xl bg-white p-8 shadow-card dark:bg-stone-900">
              <h3 className="mb-3 text-xl font-bold">{card.title}</h3>
              <p className="whitespace-pre-line text-stone-600 dark:text-stone-300">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
