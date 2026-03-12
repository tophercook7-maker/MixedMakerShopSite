"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  name: "",
  email: "",
  message: ""
};

export function ContactSection() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(values: FormState): FormErrors {
    const nextErrors: FormErrors = {};
    if (!values.name.trim()) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Please enter a valid email.";
    if (values.message.trim().length < 12) nextErrors.message = "Message should be at least 12 characters.";
    return nextErrors;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
    setForm(initialState);
  }

  return (
    <section id="contact" className="bg-white py-20 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <h2 className="section-header logo-font text-5xl font-bold">Contact</h2>
          <p className="mt-6 text-lg text-stone-600 dark:text-stone-300">
            Questions, catering requests, or pickup timing? Send us a note.
          </p>
        </div>

        <form
          className="mt-10 rounded-3xl bg-stone-50 p-8 shadow-card dark:bg-stone-900"
          noValidate
          onSubmit={onSubmit}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <label className="text-left text-sm font-medium">
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none ring-amber-400 focus:ring-2 dark:border-stone-700 dark:bg-stone-950"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name ? (
                <span id="name-error" className="mt-1 block text-xs text-red-600">
                  {errors.name}
                </span>
              ) : null}
            </label>

            <label className="text-left text-sm font-medium">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none ring-amber-400 focus:ring-2 dark:border-stone-700 dark:bg-stone-950"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email ? (
                <span id="email-error" className="mt-1 block text-xs text-red-600">
                  {errors.email}
                </span>
              ) : null}
            </label>
          </div>

          <label className="mt-6 block text-left text-sm font-medium">
            Message
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none ring-amber-400 focus:ring-2 dark:border-stone-700 dark:bg-stone-950"
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
            />
            {errors.message ? (
              <span id="message-error" className="mt-1 block text-xs text-red-600">
                {errors.message}
              </span>
            ) : null}
          </label>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-coffee transition hover:bg-amber-400"
            >
              Send Message
            </button>
            {submitted ? (
              <p className="text-sm font-medium text-emerald-600" role="status">
                Thanks! We will reach out shortly.
              </p>
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-300">Typical response time: within 1 business day.</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
