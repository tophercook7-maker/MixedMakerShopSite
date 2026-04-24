"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { trackPublicEvent } from "@/lib/public-analytics";
import { mmsBtnPrimary, mmsOnGlassSecondary } from "@/lib/mms-umbrella-ui";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-orange-300/45 focus:ring-2 focus:ring-orange-300/15";

export function IdeaSuggestionForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const idea = String(fd.get("idea") || "").trim();
    const category = String(fd.get("category") || "").trim();
    const notes = String(fd.get("notes") || "").trim();

    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: [
            "Business: Idea Lab Suggestion",
            "Source: idea_lab",
            `Category: ${category || "(not provided)"}`,
            "",
            "Idea:",
            idea,
            "",
            "Notes:",
            notes || "(none)",
          ].join("\n"),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      trackPublicEvent("public_contact_cta_click", { location: "idea_lab_form", target: "suggest_idea_submit" });
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. You can still send the idea from the contact page.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="idea-name">
            Name
          </label>
          <input id="idea-name" name="name" required className={inputClass} autoComplete="name" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="idea-email">
            Email
          </label>
          <input id="idea-email" name="email" required type="email" className={inputClass} autoComplete="email" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="idea-category">
          What kind of idea is it?
        </label>
        <select id="idea-category" name="category" className={inputClass} defaultValue="">
          <option value="" disabled>
            Pick one
          </option>
          <option>Website or tool</option>
          <option>3D print</option>
          <option>Property care</option>
          <option>Template or kit</option>
          <option>Something else</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="idea">
          Suggest an idea
        </label>
        <textarea id="idea" name="idea" required rows={4} className={inputClass} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="idea-notes">
          Notes
        </label>
        <textarea id="idea-notes" name="notes" rows={3} className={inputClass} />
      </div>
      {status === "success" ? (
        <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
          Got it. Thanks for sending the idea.
        </p>
      ) : null}
      {status === "error" ? <p className={cn("text-sm", mmsOnGlassSecondary)}>{message}</p> : null}
      <button type="submit" disabled={status === "loading"} className={cn(mmsBtnPrimary, "w-full px-8 sm:w-auto")}>
        {status === "loading" ? "Sending..." : "Suggest an Idea"}
      </button>
    </form>
  );
}
