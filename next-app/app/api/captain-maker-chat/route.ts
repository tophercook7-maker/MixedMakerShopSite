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

const SYSTEM_PROMPT = `You are Captain Maker, the friendly guide for Mixed Maker Shop. Refer to every public visitor as "Maker." Never call a public visitor "Topher" or "Maker Topher." Only use "Maker Topher" in admin, dev, or test context if the user is identified as Topher. Help Makers figure out what they need: website help, Google Business Profile setup, monthly support, landing pages, local SEO help, AI helpers, flyers/ads, 3D printing, property care, free estimates, or the contact page. Ask one helpful follow-up question when needed. Give short, practical answers. Recommend the best next step and point Makers toward the right page. Never promise exact pricing, rankings, income, or timelines. Keep the tone warm, useful, and slightly playful.

Guardrails:
- Stay focused on Mixed Maker Shop services: websites, landing pages, Google Business Profile setup, monthly support, local SEO foundations, free mockups / website previews, AI helpers / bots, flyers / ads, 3D printing, property care, pricing ranges, free estimates, and the contact page.
- If asked about unrelated topics, politely steer back to Mixed Maker Shop services.
- Do not give legal, medical, or financial advice.
- Do not guarantee search rankings, revenue, income, timelines, or results.
- Do not finalize quotes. Say Mixed Maker Shop can review details before anything is scheduled or priced exactly.

Useful Mixed Maker Shop paths:
- Free website preview / mockup: /free-mockup#free-mockup-start
- Free website check: /free-website-check
- Web design: /web-design
- Google Business Profile setup and monthly support: /pricing
- Websites and tools: /websites-tools
- 3D printing: /3d-printing
- Property care: /property-care
- Pricing: /pricing
- Contact page: /contact`;

const serviceLinks = {
  mockup: { label: "Start a free website preview", href: "/free-mockup#free-mockup-start" },
  websiteCheck: { label: "Run a free website check", href: "/free-website-check" },
  webDesign: { label: "View web design services", href: "/web-design" },
  support: { label: "See GBP setup and monthly support", href: "/pricing" },
  tools: { label: "Explore websites and tools", href: "/websites-tools" },
  printing: { label: "Start a 3D print request", href: "/3d-printing" },
  propertyCare: { label: "View property care", href: "/property-care" },
  pricing: { label: "See starting pricing", href: "/pricing" },
  contact: { label: "Open the contact page", href: "/contact" },
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
    "google",
    "gbp",
    "business profile",
    "monthly",
    "support",
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
  if (includesAny(text, ["google", "gbp", "business profile", "monthly", "support"])) links.push(serviceLinks.support);
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
    return "I can’t give legal, medical, or financial advice from the deck, Maker. For Mixed Maker Shop work, I can help you sort out website help, Google Business Profile setup, monthly support, AI helpers, 3D printing, property care, a free estimate, or the contact page. What are you trying to get done?";
  }
  if (isMostlyUnrelated(text)) {
    return "That may be outside my chart, Maker. I’m best at helping with Mixed Maker Shop services: websites, Google Business Profile setup, monthly support, AI helpers, flyers or ads, 3D printing, property care, and custom projects. Which one are you considering?";
  }
  if (includesAny(text, ["price", "pricing", "cost", "budget", "how much"])) {
    return "Here are the starting points, Maker: landing pages start at $100, websites start at $400, Google Business Profile setup is $150 one-time, monthly support starts at $45/mo, flyers and ads start at $50, and AI helpers are $200 during a first website build or $500 later. 3D prints and custom work need a real estimate because details matter.";
  }
  if (includesAny(text, ["mockup", "preview", "demo"])) {
    return "A free website preview is a good first port, Maker, if you want to see the direction before committing. Share the business, service, and rough goal, then Mixed Maker Shop can review it and build a homepage-style preview.";
  }
  if (includesAny(text, ["seo", "rank", "google", "local"])) {
    return "For local visibility, Maker, the smart starting place is clear service pages, local wording, fast mobile layout, contact paths, consistent business details, and Google Business Profile activity. I can’t promise rankings, but monthly support can help keep the site and profile from sitting untouched.";
  }
  if (includesAny(text, ["ai", "bot", "chatbot", "automation"])) {
    return "An AI helper can answer common questions, guide Makers, and collect leads. The best fit depends on your site, services, and the questions customers ask most. If you already have a website, Mixed Maker Shop can review where the bot should live and what it should safely answer.";
  }
  if (includesAny(text, ["3d", "print", "printed", "part", "gift", "keychain"])) {
    return "For 3D printing, Maker, the next step is describing the item, size, color/material preference, deadline, and whether you already have a file. Mixed Maker Shop can review those details before giving a real estimate.";
  }
  if (includesAny(text, ["property", "lawn", "yard", "cleanup", "pressure washing"])) {
    return "For property care, Maker, start with what needs done, the location, photos if you have them, and how soon you need help. Captain’s note: Mixed Maker Shop can review the details and point you toward the right property-care path.";
  }

  const recommendation = getCaptainMakerRecommendation(latestMessage);
  return `${recommendation.salesGuide} Best next step: tell me whether this is for a business, event, personal project, or custom build. Then Mixed Maker Shop can review the details before any quote is finalized.`;
}

function priorityServiceReply(latestMessage: string): string | null {
  const text = latestMessage.toLowerCase();
  if (includesAny(text, ["landing"]) && includesAny(text, ["website", "full site", "full website", "site"])) {
    return "Good question, Maker. A landing page is best when you need one focused offer, event, service, or quick online presence. A full website is better when you need multiple pages, service details, photos, menus, booking, payments, or a stronger local trust base. Best next step: tell me what the page needs to accomplish, then Mixed Maker Shop can review whether a landing page or full site is the smarter build.";
  }
  if (includesAny(text, ["website", "site", "web design"]) && includesAny(text, ["seo", "google", "local"])) {
    return "For a website plus local SEO help, Maker, I’d start with clear service pages, local wording, fast mobile layout, contact paths, trust signals, Google Business Profile setup, and monthly support if you want ongoing activity. I can’t promise rankings, but that gives local customers a clearer path.";
  }
  if (includesAny(text, ["free mockup", "preview", "website preview", "demo"])) {
    return "A free website preview is the easiest first step, Maker, if you want to see the direction before committing. Send the business/service details and Mixed Maker Shop can review the fit before anything turns into a quote.";
  }
  if (includesAny(text, ["google business profile", "gbp", "monthly support", "support plan", "google profile"])) {
    return "For Google Business Profile setup and monthly support, Maker, I’d start with the pricing page. GBP setup is a one-time setup path, and monthly support helps keep updates, visibility notes, and small site improvements from getting ignored.";
  }
  return null;
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
        : priorityServiceReply(latestMessage) || (await openAiReply(messages));

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
          "The signal got choppy for a second, Maker. Try sending that again, or start a free estimate so Mixed Maker Shop can review the details directly.",
        links: [serviceLinks.contact],
      },
      { status: 200 },
    );
  }
}
