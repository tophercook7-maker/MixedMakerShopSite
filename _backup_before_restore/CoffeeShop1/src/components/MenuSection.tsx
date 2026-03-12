import { menuCategories } from "@/data/menu";

export function MenuSection() {
  return (
    <section id="menu" className="bg-stone-50 py-20 dark:bg-roast dark:text-stone-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="section-header logo-font text-5xl font-bold">Menu</h2>
          <p className="mt-6 text-lg text-stone-600 dark:text-stone-300">
            Favorites plus rotating flavors without the giant syrup wall.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {menuCategories.map((category) => (
            <article
              key={category.title}
              className="menu-card rounded-3xl bg-white p-8 shadow-card dark:bg-stone-900"
            >
              <h3 className="mb-2 text-2xl font-bold">{category.title}</h3>
              <p className="mb-6 text-stone-600 dark:text-stone-300">{category.description}</p>
              <ul className="space-y-3">
                {category.items.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-4">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.price}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
          * Prices are mock data for portfolio use.
        </p>
      </div>
    </section>
  );
}
