"use client";

import { useEffect, useState } from "react";

const testimonials = [
  {
    quote: "Best latte in town and the staff remembers my order every time.",
    name: "Maya R.",
    role: "Local customer"
  },
  {
    quote: "Quiet vibe, strong espresso, and reliable Wi-Fi for deep work mornings.",
    name: "Jordan T.",
    role: "Remote designer"
  },
  {
    quote: "Cold brew is consistently smooth, and the seasonal menu always hits.",
    name: "Chris L.",
    role: "Weekend regular"
  }
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const active = testimonials[activeIndex];

  return (
    <section id="testimonials" className="bg-white py-20 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="section-header logo-font text-5xl font-bold">Testimonials</h2>
        <p className="mt-6 text-lg text-stone-600 dark:text-stone-300">
          What regulars say about the Bean Bliss experience.
        </p>

        <article className="mt-10 rounded-3xl bg-stone-50 p-8 shadow-card dark:bg-stone-900">
          <p className="text-2xl leading-relaxed text-stone-800 dark:text-stone-100">“{active.quote}”</p>
          <p className="mt-5 text-base font-semibold">{active.name}</p>
          <p className="text-sm text-stone-600 dark:text-stone-300">{active.role}</p>
        </article>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-amber-500 hover:text-amber-600 dark:border-stone-700"
            aria-label="Previous testimonial"
          >
            Prev
          </button>
          {testimonials.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Show testimonial ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full ${
                index === activeIndex ? "bg-amber-500" : "bg-stone-300 dark:bg-stone-700"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-amber-500 hover:text-amber-600 dark:border-stone-700"
            aria-label="Next testimonial"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
