import { NextResponse } from "next/server";
import { getCaptainMakerRecommendation } from "@/lib/captain-maker-recommendation";

type ChatRole = "user" | "assistant";

type ClientMessage = {
  role?: unknown;
  content?: unknown;
};

type CaptainMakerLink = {
  label: string;
  href: string;
};

const SYSTEM_PROMPT = `You are Captain Maker, the friendly guide for Mixed Maker Shop. Help visitors figure out what they need: a website, landing page, local SEO help, AI helper, flyer/ad, 3D print, property care, or custom project. Ask one helpful follow-up question when needed. Give short, practical answers. Recommend the best next step and point users toward contacting Topher or starting a free estimate. Never promise exact pricing, rankings, income, or timelines. Keep the tone warm, useful, and slightly playful.

Guardrails:
- Stay focused on Mixed Maker Shop services: websites, landing pages, local SEO foundations, free mockups / website previews, AI helpers / bots, flyers / ads, 3D printing, property care, pricing ranges, and contacting Topher.
- If asked about unrelated topics, politely steer back to Mixed Maker Shop services.
- Do not give legal, medical, or financial advice.
- Do not guarantee search rankings, revenue, income, timelines, or results.
- Do not finalize quotes. Say Topher can review details before anything is scheduled or priced exactly.

Useful Mixed Maker Shop paths:
- Free website preview / mockup: /free-mockup#free-mockup-start
- Free website check: /free-website-check
- Web design: /web-design
- Websites and tools: /websites-tools
- 3D printing: /3d-printing
- Property care: /property-care
- Pricing: /pricing
- Contact Topher: /contact`;

const serviceLinks = {
  mockup: { label: "Start a free website preview", href: "/free-mockup#free-mockup-start" },
  websiteCheck: { label: "Run a free website check", href: "/free-website-check" },
  webDesign: { label: "View web design services", href: "/web-design" },
  tools: { label: "Explore websites and tools", href: "/websites-tools" },
  printing: { label: "Start a 3D print request", href: "/3d-printing" },
  propertyCare: { label: "View property care", href: "/property-care" },
  pricing: { label: "See starting pricing", href: "/pricing" },
  contact: { label: "Contact Topher", href: "/contact" },
} satisfies Record<string, CaptainMakerLink>;

function cleanMessages(input: unknown): Array<{ role: ChatRole; content: string }> {
  if (!Array.isArray(input)) return [];
  return input
    .map((message: ClientMessage) => ({
      role: message.role === "assistant" ? "assistant" : message.role === "user" ? "user" : null,
      content: typeof message.content === "string" ? message.content.trim().slice(0, 1200) : "",
    }))
    .filter((message): message is { role: ChatRole; content: string } => Boolean(message.role && message.content))
    .slice(-10);
}

function includesAny(haystack: string, words: string[]): boolean {
  return words.some((word) => haystack.includes(word));
}

function isRestrictedAdvice(text: string): boolean {
  return /\b(lawsuit|sue|contract|legal|lawyer|attorney|diagnose|medical|doctor|medicine|investment|stock|tax advice|loan|mortgage)\b/.test(
    text,
  );
}

function isMostlyUnrelated(text: string): boolean {
  const serviceWords = [
    "website",
    "site",
    "landing",
    "seo",
    "mockup",
    "preview",
    "ai",
    "bot",
    "flyer",
    "ad",
    "print",
    "3d",
    "property",
    "lawn",
    "pricing",
    "price",
    "cost",
    "contact",
    "topher",
    "business",
    "page",
    "design",
    "quote",
    "estimate",
  ];
  return text.length > 18 && !includesAny(text, serviceWords);
}

function linksFor(text: string): CaptainMakerLink[] {
  const links: CaptainMakerLink[] = [];
  if (includesAny(text, ["mockup", "preview", "demo"])) links.push(serviceLinks.mockup);
  if (includesAny(text, ["check", "audit", "review my site"])) links.push(serviceLinks.websiteCheck);
  if (includesAny(text, ["website", "site", "web design", "seo", "landing"])) links.push(serviceLinks.webDesign);
  if (includesAny(text, ["ai", "bot", "automation", "tool", "template"])) links.push(serviceLinks.tools);
  if (includesAny(text, ["3d", "print", "printed", "part", "gift", "keychain"])) links.push(serviceLinks.printing);
  if (includesAny(text, ["property", "lawn", "yard", "cleanup", "pressure washing"])) links.push(serviceLinks.propertyCare);
  if (includesAny(text, ["price", "pricing", "cost", "budget", "how much"])) links.push(serviceLinks.pricing);
  links.push(serviceLinks.contact);
  return Array.from(new Map(links.map((link) => [link.href, link])).values()).slice(0, 4);
}

function fallbackReply(latestMessage: string): string {
  const text = latestMessage.toLowerCase();
  if (isRestrictedAdvice(text)) {
    return "I can’t give legal, medical, or financial advice from the deck. For Mixed Maker Shop work, I can help you sort out a website, landing page, local SEO foundation, AI helper, flyer, 3D print, or property-care next step. What are you trying to get done?";
  }
  if (isMostlyUnrelated(text)) {
    return "That may be outside my chart, Maker. I’m best at helping with Mixed Maker Shop services: websites, landing pages, local SEO basics, AI helpers, flyers or ads, 3D printing, property care, and custom projects. Which one are you considering?";
  }
  if (includesAny(text, ["price", "pricing", "cost", "budget", "how much"])) {
    return "Here are the starting points: landing pages start at $100, websites start at $400, flyers and ads start at $50, and AI helpers are $200 during a first website build or $500 later. 3D prints and custom work need a real estimate because details matter. Topher can review the specifics before anything is finalized.";
  }
  if (includesAny(text, ["mockup", "preview", "demo"])) {
    return "A free website preview is a good first port if you want to see the direction before committing. Share the business, service, and rough goal, then Topher can review it and build a homepage-style preview.";
  }
  if (includesAny(text, ["seo", "rank", "google", "local"])) {
    return "For local SEO, the smart starting point is clear service pages, local wording, fast mobile layout, contact paths, and consistent business details. I can’t promise rankings, but Topher can review what your site needs to be easier for local customers to find.";
  }
  if (includesAny(text, ["ai", "bot", "chatbot", "automation"])) {
    return "An AI helper can answer common questions, guide visitors, and collect leads. The best fit depends on your site, services, and the questions customers ask most. If you already have a website, Topher can review where the bot should live and what it should safely answer.";
  }
  if (includesAny(text, ["3d", "print", "printed", "part", "gift", "keychain"])) {
    return "For 3D printing, the next step is describing the item, size, color/material preference, deadline, and whether you already have a file. Topher and GiGi can review those details before giving a real estimate.";
  }
  if (includesAny(text, ["property", "lawn", "yard", "cleanup", "pressure washing"])) {
    return "For property care, start with what needs done, the location, photos if you have them, and how soon you need help. Captain’s note: Topher can review the details and point you toward the right property-care path.";
  }

  const recommendation = getCaptainMakerRecommendation(latestMessage);
  return `${recommendation.salesGuide} Best next step: tell me whether this is for a business, event, personal project, or custom build. Then Topher can review the details before any quote is finalized.`;
}

async function openAiReply(messages: Array<{ role: ChatRole; content: string }>): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CAPTAIN_MAKER_OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.45,
      max_tokens: 260,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!res.ok) {
    console.error("[captain-maker-chat] OpenAI request failed", await res.text().catch(() => res.statusText));
    return null;
  }
  const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return body.choices?.[0]?.message?.content?.trim().slice(0, 1400) || null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
    const messages = cleanMessages(body?.messages);
    const latestMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";

    if (!latestMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const guardedReply =
      isRestrictedAdvice(latestMessage.toLowerCase()) || isMostlyUnrelated(latestMessage.toLowerCase())
        ? fallbackReply(latestMessage)
        : await openAiReply(messages);

    const reply = guardedReply || fallbackReply(latestMessage);
    return NextResponse.json({
      reply,
      links: linksFor(latestMessage.toLowerCase()),
      recommendation: getCaptainMakerRecommendation(latestMessage),
    });
  } catch (error) {
    console.error("[captain-maker-chat] failed", error);
    return NextResponse.json(
      {
        reply:
          "The signal got choppy for a second, Maker. Try sending that again, or start a free estimate and Topher can review the details directly.",
        links: [serviceLinks.contact],
      },
      { status: 200 },
    );
  }
}
