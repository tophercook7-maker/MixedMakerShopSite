"use client";

import { FormEvent, useState } from "react";
import {
  mmsBtnPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";
import { publicTopherEmail } from "@/lib/public-brand";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-orange-300/45 focus:ring-2 focus:ring-orange-300/15";
const textareaClass = `${inputClass} min-h-[120px] resize-y`;
const labelClass = "block text-sm font-medium text-white/90";

const mailtoBase = `mailto:${publicTopherEmail}`;
function mailtoSubject(subject: string) {
  return `${mailtoBase}?subject=${encodeURIComponent(subject)}`;
}

export function AiAutomationInquiryForm() {
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
      businessName: String(fd.get("businessName") || "").trim(),
      website: String(fd.get("website") || "").trim(),
      automationInterest: String(fd.get("automationInterest") || "").trim(),
      currentProblem: String(fd.get("currentProblem") || "").trim(),
      urgency: String(fd.get("urgency") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
    };
    try {
      const res = await fetch("/api/forms/ai-automation", {
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
              : "Something went wrong. Try again or email Topher directly.";
        setError(msg);
        setLoading(false);
        return;
      }
      e.currentTarget.reset();
      setDone(true);
    } catch {
      setError("Something went wrong. Try again or email Topher directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-glass-box public-glass-box--pad mx-auto mt-10 max-w-3xl">
      <p className={cn("text-sm font-semibold uppercase tracking-[0.14em]", mmsSectionEyebrowOnGlass)}>Start a conversation</p>
      <h3 className="mt-3 text-xl font-bold tracking-tight text-white">Talk to Topher about AI automation</h3>
      <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
        Send a structured request so nothing gets lost — Topher reads every submission and replies from Mixed Maker Shop.
      </p>

      {done ? (
        <p className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Thanks — your note is in. Topher will follow up by email shortly.
        </p>
      ) : null}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Name <span className="text-orange-200/90">*</span>
            <input className={cn(inputClass, "mt-2")} name="name" required autoComplete="name" placeholder="Your name" />
          </label>
          <label className={labelClass}>
            Email <span className="text-orange-200/90">*</span>
            <input
              className={cn(inputClass, "mt-2")}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Business name
            <input className={cn(inputClass, "mt-2")} name="businessName" placeholder="Optional" />
          </label>
          <label className={labelClass}>
            Website
            <input className={cn(inputClass, "mt-2")} name="website" placeholder="https:// or leave blank" />
          </label>
        </div>
        <label className={labelClass}>
          What do you want to automate or streamline? <span className="text-orange-200/90">*</span>
          <textarea
            className={cn(textareaClass, "mt-2")}
            name="automationInterest"
            required
            placeholder="Example: follow-up texts after missed calls, sorting quote requests, drafting replies you approve before sending."
          />
        </label>
        <label className={labelClass}>
          What is happening today — and where does time get lost? <span className="text-orange-200/90">*</span>
          <textarea
            className={cn(textareaClass, "mt-2 min-h-[140px]")}
            name="currentProblem"
            required
            placeholder="Plain-language workflow: what triggers it, what you do now, and what “done” looks like."
          />
        </label>
        <label className={labelClass}>
          Urgency
          <input className={cn(inputClass, "mt-2")} name="urgency" placeholder="Optional — e.g. this week, this month, exploratory" />
        </label>
        <label className={labelClass}>
          Anything else we should know?
          <textarea className={cn(textareaClass, "mt-2 min-h-[88px]")} name="notes" placeholder="Tools you use, constraints, or links." />
        </label>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}

        <button type="submit" disabled={loading} className={cn(mmsBtnPrimary, "mt-2 w-full px-8 py-3.5 disabled:opacity-60")}>
          {loading ? "Sending…" : "Talk to Topher about AI automation"}
        </button>
      </form>

      <p className={cn("mt-6 text-center text-sm leading-relaxed", mmsOnGlassSecondary)}>
        Prefer email?{" "}
        <a href={mailtoSubject("AI automation — Mixed Maker Shop")} className={cn(mmsTextLinkOnGlass, "font-semibold")}>
          Open a draft to {publicTopherEmail}
        </a>{" "}
        — include the same details so replies stay fast.
      </p>
    </div>
  );
}
