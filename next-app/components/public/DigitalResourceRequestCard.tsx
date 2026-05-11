"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { StarterResourceTitle } from "@/lib/websites-tools-starter-resources";
import {
  mmsBtnPrimary,
  mmsOnGlassSecondary,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { publicTopherEmail } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-orange-300/45 focus:ring-2 focus:ring-orange-300/15";
const textareaClass = `${inputClass} min-h-[72px] resize-y`;
const labelClass = "block text-xs font-medium text-white/85";

const mailtoBase = `mailto:${publicTopherEmail}`;
function mailtoSubject(subject: string) {
  return `${mailtoBase}?subject=${encodeURIComponent(subject)}`;
}

export function DigitalResourceRequestCard(props: { title: StarterResourceTitle; body: string }) {
  const { title, body } = props;
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      selectedResource: title,
      businessName: String(fd.get("businessName") || "").trim(),
      website: String(fd.get("website") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
    };
    try {
      const res = await fetch("/api/forms/digital-resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.error && typeof data.error === "object"
            ? "Please fix the highlighted fields."
            : typeof data?.error === "string"
              ? data.error
              : "Something went wrong.";
        setError(msg);
        setLoading(false);
        return;
      }
      e.currentTarget.reset();
      setDone(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="public-glass-box--soft public-glass-box--pad flex flex-col">
      <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
      <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{body}</p>

      {done ? (
        <p className="mt-4 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          Request received — check your inbox for the sheet.
        </p>
      ) : null}

      <form className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5" onSubmit={handleSubmit}>
        <label className={labelClass}>
          Name <span className="text-orange-200/90">*</span>
          <input className={cn(inputClass, "mt-1.5")} name="name" required autoComplete="name" />
        </label>
        <label className={labelClass}>
          Email <span className="text-orange-200/90">*</span>
          <input className={cn(inputClass, "mt-1.5")} name="email" type="email" required autoComplete="email" />
        </label>
        <label className={labelClass}>
          Business name
          <input className={cn(inputClass, "mt-1.5")} name="businessName" placeholder="Optional" />
        </label>
        <label className={labelClass}>
          Website
          <input className={cn(inputClass, "mt-1.5")} name="website" placeholder="Optional" />
        </label>
        <label className={labelClass}>
          Notes
          <textarea className={cn(textareaClass, "mt-1.5")} name="notes" placeholder="Where to send it, format prefs, etc." />
        </label>
        {error ? <p className="text-xs text-red-200">{error}</p> : null}
        <button type="submit" disabled={loading} className={cn(mmsBtnPrimary, "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60")}>
          Request this resource
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </form>

      <p className={cn("mt-4 text-xs leading-relaxed", mmsOnGlassSecondary)}>
        Email fallback:{" "}
        <a href={mailtoSubject(`Resource request: ${title}`)} className={cn(mmsTextLinkOnGlass, "font-semibold")}>
          draft to {publicTopherEmail}
        </a>
      </p>
    </article>
  );
}
