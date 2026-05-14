"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Send } from "lucide-react";
import {
  getCaptainMakerObjectionResponse,
  getCaptainMakerRecommendation,
  type CaptainMakerRecommendation,
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

const budgetOptions = [
  "Under $100",
  "$100-$400",
  "$400-$800",
  "$800+",
  "Not sure yet",
] as const;

const captainOpening =
  "Ahoy, Maker — I’m Captain Maker. Tell me what you’re trying to build, fix, promote, or grow, and I’ll point you to the right starting place.";

type CaptainMakerLink = {
  label: string;
  href: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  links?: CaptainMakerLink[];
};

function newMessage(role: ChatMessage["role"], content: string, links?: CaptainMakerLink[]): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    links,
  };
}

export function CaptainMakerGuide() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    newMessage("assistant", captainOpening, [
      { label: "See starting pricing", href: "/pricing" },
      { label: "Contact page", href: "/contact" },
    ]),
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatStatus, setChatStatus] = useState<"idle" | "loading">("idle");
  const [chatError, setChatError] = useState("");
  const [wantsEstimate, setWantsEstimate] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const transcript = useMemo(
    () =>
      messages
        .map((message) => `${message.role === "assistant" ? "Captain Maker" : "Maker"}: ${message.content}`)
        .join("\n\n"),
    [messages],
  );

  const latestVisitorMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "user")?.content || "",
    [messages],
  );

  const recommendation = useMemo(
    () => getCaptainMakerRecommendation(transcript || latestVisitorMessage),
    [latestVisitorMessage, transcript],
  );
  const objectionResponse = useMemo(
    () => getCaptainMakerObjectionResponse(transcript || latestVisitorMessage),
    [latestVisitorMessage, transcript],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, chatStatus]);

  async function handleChatSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = chatInput.trim();
    if (!content || chatStatus === "loading") return;

    const userMessage = newMessage("user", content);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setChatInput("");
    setChatError("");
    setChatStatus("loading");

    try {
      const res = await fetch("/api/captain-maker-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        reply?: string;
        links?: CaptainMakerLink[];
        recommendation?: CaptainMakerRecommendation;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(body.error || "Captain Maker could not answer that yet.");
      }
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          body.reply ||
            "I can help with websites, landing pages, local SEO, AI helpers, flyers, 3D printing, property care, and custom projects. What are you trying to get done?",
          body.links,
        ),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Captain Maker could not answer that yet.";
      setChatError(message);
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "The signal got choppy for a second, Maker. Try asking again, or start a free estimate and Mixed Maker Shop can review the details.",
          [{ label: "Contact page", href: "/contact" }],
        ),
      ]);
    } finally {
      setChatStatus("idle");
    }
  }

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
    const projectNeed = latestVisitorMessage || details;

    const message = [
      "Captain Maker free estimate request",
      "",
      `Recommendation: ${recommendation.title}`,
      `Starting price note: ${recommendation.price}`,
      `Recommendation details: ${recommendation.summary}`,
      `Captain Maker guidance: ${objectionResponse || recommendation.salesGuide}`,
      "",
      `Latest Maker question: ${latestVisitorMessage || "(not provided)"}`,
      `Project type: ${projectType || "(not provided)"}`,
      `Timeline: ${timeline || "(not provided)"}`,
      `Budget range: ${budget || "(not provided)"}`,
      `Marketing permission: ${marketingPermission ? "yes" : "no"}`,
      "",
      "Captain Maker chat transcript:",
      transcript || "(not provided)",
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
          transcript,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.ok !== true) {
        const details = body?.details ? ` Details: ${JSON.stringify(body.details)}` : "";
        throw new Error(String(body?.error || "Captain Maker could not log that request.") + details);
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
        <h2 className={cn(mmsH2OnGlass, "mt-4")}>Chat with the captain.</h2>
        <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
          Ask about website help, Google Business Profile setup, monthly support, free previews, AI helpers, flyers,
          3D printing, property care, pricing ranges, free estimates, or the contact page.
        </p>
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          <div className="max-h-[32rem] min-h-[24rem] space-y-4 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm md:text-base",
                    message.role === "user"
                      ? "bg-orange-300 text-[#1d251f]"
                      : "border border-white/10 bg-white/10 text-white",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.links && message.links.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.links.map((link) => (
                        <Link
                          key={`${message.id}-${link.href}`}
                          href={link.href}
                          className={cn(
                            "rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs font-semibold text-white no-underline hover:no-underline",
                            message.role === "user" && "border-black/15 bg-black/10 text-[#1d251f]",
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {chatStatus === "loading" ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                  Captain Maker is checking the chart...
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="border-t border-white/10 p-4 sm:p-5">
            <label className="sr-only" htmlFor="captain-maker-message">
              Ask Captain Maker a question
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                id="captain-maker-message"
                className={cn(inputClass, "min-h-[3.35rem] resize-none sm:min-h-0")}
                rows={2}
                value={chatInput}
                onChange={(event) => setChatInput(event.currentTarget.value)}
                placeholder="Ask Captain Maker what you need, what it might cost, or where to start..."
                disabled={chatStatus === "loading"}
              />
              <button
                type="submit"
                disabled={chatStatus === "loading" || !chatInput.trim()}
                className={cn(mmsBtnPrimary, "min-h-[3.35rem] justify-center px-6 sm:self-end")}
              >
                {chatStatus === "loading" ? "Sending..." : "Send"}
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {chatError ? <p className={cn("mt-3 text-sm", mmsOnGlassSecondary)}>{chatError}</p> : null}
          </form>
        </div>
        <button
          type="button"
          className={cn(mmsBtnSecondaryOnGlass, "mt-5 w-full justify-center sm:w-auto")}
          onClick={() => setWantsEstimate(true)}
        >
          Start free estimate
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="public-glass-box--soft public-glass-box--pad">
        <p className={mmsSectionEyebrowOnGlass}>Next step</p>
        <h3 className={cn(mmsH2OnGlass, "mt-4 !text-2xl")}>Start a free estimate when you&apos;re ready.</h3>
        <p className={cn("mt-4 text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
          Chat with Captain Maker first, then send the details for review. The captain can point you toward a likely
          service path, but Mixed Maker Shop confirms scope, pricing, and timing before anything is scheduled.
        </p>
        <p className={cn("mt-5 text-sm leading-relaxed", mmsOnGlassSecondary)}>
          No pressure on the deck. Use the chat to ask a few questions, then start the estimate step when you have enough
          context to share.
        </p>

        {wantsEstimate || status === "success" ? (
          <div className="mt-6 border-t border-white/10 pt-6">
            {status === "success" ? (
              <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                {LEAD_CONFIRMATION_MESSAGE}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className={cn("rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm", mmsOnGlassSecondary)}>
                  Captain Maker&apos;s current direction: <strong className={mmsOnGlassPrimary}>{recommendation.title}</strong>.
                  Mixed Maker Shop can review the chat transcript and details before giving a real quote.
                </p>
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
                  <textarea
                    name="project_details"
                    required
                    rows={4}
                    className={inputClass}
                    defaultValue={latestVisitorMessage}
                  />
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
            Start free estimate after the chat
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
