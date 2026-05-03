"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  getCaptainMakerObjectionResponse,
  getCaptainMakerRecommendation,
} from "@/lib/captain-maker-recommendation";
import { LEAD_CONFIRMATION_MESSAGE } from "@/lib/lead-confirmation-message";
import { cn } from "@/lib/utils";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsTextLinkOnGlass,
} from "@/lib/mms-umbrella-ui";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-orange-300/45 focus:ring-2 focus:ring-orange-300/15";

const needOptions = [
  "Website",
  "AI helper",
  "Flyer / ad",
  "3D print",
  "Something custom",
] as const;

const audienceOptions = ["Business", "Personal project", "Event", "Gift", "Side hustle"] as const;

const budgetOptions = [
  "Under $100",
  "$100-$400",
  "$400-$800",
  "$800+",
  "Not sure yet",
] as const;

const captainOpening =
  "Ahoy, Maker. I’m Captain Maker — your guide through Mixed Maker Shop. Tell me what you’re trying to build, print, promote, or automate, and I’ll help you find the right starting point.";

export function CaptainMakerGuide() {
  const [projectNeed, setProjectNeed] = useState("");
  const [audience, setAudience] = useState("");
  const [serviceHint, setServiceHint] = useState("");
  const [wantsEstimate, setWantsEstimate] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const recommendation = useMemo(
    () => getCaptainMakerRecommendation(projectNeed, serviceHint),
    [projectNeed, serviceHint],
  );
  const objectionResponse = useMemo(
    () => getCaptainMakerObjectionResponse(projectNeed, serviceHint),
    [projectNeed, serviceHint],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const projectType = String(fd.get("project_type") || recommendation.title).trim();
    const timeline = String(fd.get("timeline") || "").trim();
    const budget = String(fd.get("budget") || "").trim();
    const details = String(fd.get("project_details") || "").trim();
    const marketingPermission = fd.get("marketing_permission") === "yes";

    const message = [
      "Captain Maker free estimate request",
      "",
      `Recommendation: ${recommendation.title}`,
      `Starting price note: ${recommendation.price}`,
      `Recommendation details: ${recommendation.summary}`,
      `Captain Maker guidance: ${objectionResponse || recommendation.salesGuide}`,
      "",
      `What they are trying to build: ${projectNeed || "(not provided)"}`,
      `Project context: ${audience || "(not provided)"}`,
      `Service hint: ${serviceHint || "(not provided)"}`,
      `Project type: ${projectType || "(not provided)"}`,
      `Timeline: ${timeline || "(not provided)"}`,
      `Budget range: ${budget || "(not provided)"}`,
      `Marketing permission: ${marketingPermission ? "yes" : "no"}`,
      "",
      "Project details:",
      details || "(not provided)",
    ].join("\n");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "public_lead",
          source: "captain_maker_chat",
          name,
          business_name: `${recommendation.title} estimate - ${name || "Captain Maker lead"}`,
          email,
          phone: phone || undefined,
          category: recommendation.title,
          service_type: recommendation.key,
          request: projectNeed || details,
          message,
          transcript: [
            `Captain Maker opening: ${captainOpening}`,
            `Visitor need: ${projectNeed || "(not provided)"}`,
            `Visitor context: ${audience || "(not provided)"}`,
            `Visitor service hint: ${serviceHint || "(not provided)"}`,
            objectionResponse ? `Captain Maker objection response: ${objectionResponse}` : "",
            `Captain Maker recommendation: ${recommendation.title} (${recommendation.price})`,
            `Captain Maker CTA: Want me to help start your free estimate?`,
          ].join("\n"),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(String(body?.error || "Captain Maker could not log that request."));
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="public-glass-box public-glass-box--pad">
        <p className={mmsSectionEyebrowOnGlass}>Captain Maker</p>
        <h2 className={cn(mmsH2OnGlass, "mt-4")}>Let the captain point the ship.</h2>
        <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
          {captainOpening}
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>What are you trying to build?</span>
            <textarea
              className={inputClass}
              rows={5}
              value={projectNeed}
              onChange={(event) => setProjectNeed(event.currentTarget.value)}
              placeholder="Example: I need a quick page for an event, a full site for my business, a flyer, a bot, or a custom printed item."
            />
          </label>
          <label className="block">
            <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>
              Is it for a business, personal project, event, gift, or side hustle?
            </span>
            <select className={inputClass} value={audience} onChange={(event) => setAudience(event.currentTarget.value)}>
              <option value="">Pick one</option>
              {audienceOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>
              Do you need a website, AI helper, flyer/ad, 3D print, or something custom?
            </legend>
            <div className="flex flex-wrap gap-2">
              {needOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    mmsBtnSecondaryOnGlass,
                    "px-4 py-2 text-xs",
                    serviceHint === option && "border-orange-200/70 bg-orange-300/20 text-white",
                  )}
                  onClick={() => setServiceHint(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" className={cn(mmsBtnPrimary, "w-full justify-center sm:w-auto")} onClick={() => setWantsEstimate(true)}>
            Want me to help start your free estimate?
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="public-glass-box--soft public-glass-box--pad">
        <p className={mmsSectionEyebrowOnGlass}>Captain&apos;s recommendation</p>
        <h3 className={cn(mmsH2OnGlass, "mt-4 !text-2xl")}>{recommendation.title}</h3>
        <p className={cn("mt-3 text-lg font-bold", mmsOnGlassPrimary)}>{recommendation.price}</p>
        <p className={cn("mt-4 text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
          {objectionResponse || recommendation.salesGuide}
        </p>
        <p className={cn("mt-4 text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
          {recommendation.summary}
        </p>
        <p className={cn("mt-5 text-sm leading-relaxed", mmsOnGlassSecondary)}>
          No pressure on the deck. Captain Maker can help you choose the right starting point now, then Topher can review
          the details before anything gets scheduled.
        </p>

        {wantsEstimate || status === "success" ? (
          <div className="mt-6 border-t border-white/10 pt-6">
            {status === "success" ? (
              <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                {LEAD_CONFIRMATION_MESSAGE}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Name</span>
                    <input name="name" required className={inputClass} autoComplete="name" />
                  </label>
                  <label className="block">
                    <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Email</span>
                    <input name="email" required type="email" className={inputClass} autoComplete="email" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Phone</span>
                    <input name="phone" type="tel" className={inputClass} autoComplete="tel" />
                  </label>
                  <label className="block">
                    <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Project type</span>
                    <input name="project_type" className={inputClass} defaultValue={recommendation.title} />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Timeline</span>
                    <input name="timeline" className={inputClass} placeholder="ASAP, this month, flexible..." />
                  </label>
                  <label className="block">
                    <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Budget range</span>
                    <select name="budget" className={inputClass} defaultValue="">
                      <option value="">Pick one</option>
                      {budgetOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className={cn("mb-2 block text-sm font-semibold", mmsOnGlassPrimary)}>Project details</span>
                  <textarea name="project_details" required rows={4} className={inputClass} />
                </label>
                <label className={cn("flex items-start gap-3 text-sm leading-relaxed", mmsOnGlassSecondary)}>
                  <input name="marketing_permission" value="yes" type="checkbox" className="mt-1" />
                  <span>Captain Maker can log that you&apos;re okay with Mixed Maker Shop following up about this request.</span>
                </label>
                {status === "error" ? <p className={cn("text-sm", mmsOnGlassSecondary)}>{error}</p> : null}
                <button type="submit" disabled={status === "loading"} className={cn(mmsBtnPrimary, "w-full justify-center sm:w-auto")}>
                  {status === "loading" ? "Logging request..." : "Send free estimate request"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <button type="button" className={cn(mmsTextLinkOnGlass, "mt-6 inline-flex items-center gap-2")} onClick={() => setWantsEstimate(true)}>
            Want me to help start your free estimate?
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
