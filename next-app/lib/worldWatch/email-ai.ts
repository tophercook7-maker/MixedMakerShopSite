import type { SelectedWeeklyContent } from "@/lib/worldWatch/email-select";
import type { WeeklyEmailDraft } from "@/lib/worldWatch/email-render";

const SUBJECT_POOL = [
  "Deep Well Weekly | Peace in a restless world",
  "Deep Well Weekly | A calm look at the week",
  "Deep Well Weekly | Reflection, clarity, and perspective",
];

function pickSubject(): string {
  return SUBJECT_POOL[Math.floor(Math.random() * SUBJECT_POOL.length)] ?? SUBJECT_POOL[0];
}

/** Build draft without AI — calm, grounded copy from selected items only. */
export function buildWeeklyDraftFromSelection(selected: SelectedWeeklyContent): WeeklyEmailDraft {
  const opening =
    "Thank you for reading Deep Well Weekly. This is a short, curated pause—global awareness through a peaceful, scriptural lens, without urgency or noise.";

  const biblicalBlock =
    selected.biblical != null
      ? {
          title: selected.biblical.title,
          body: `${selected.biblical.summary}\n\n${selected.biblical.reflection}`.trim(),
          sourceLine: `${selected.biblical.source_name}`,
        }
      : {
          title: "Biblical insight",
          body: "This week we’re keeping our main reflection brief—a invitations to slow breathing, gratitude, and trust in God’s unfolding purposes.",
          sourceLine: "Deep Well Audio",
        };

  let globalBlocks = selected.global.map((g) => ({
    title: g.title,
    summary: g.summary.slice(0, 520) + (g.summary.length > 520 ? "…" : ""),
  }));
  if (globalBlocks.length === 0) {
    globalBlocks = [
      {
        title: "A lighter digest this week",
        summary:
          "Some weeks bring fewer headlines worth amplifying. That can be its own invitation: steadiness in prayer, kindness close to home, and trust when the pace of news slows.",
      },
    ];
  }

  const prophecyBlock =
    selected.prophecy != null
      ? {
          title: selected.prophecy.title,
          body: `${selected.prophecy.summary}\n\nWe hold prophecy-related themes lightly—watchful, humble, and free from date-setting or alarm.`,
        }
      : null;

  const closing =
    "Grace and peace to you this week. May your mind find room to breathe, and may Christ’s peace guard your heart when the world feels loud.";

  return {
    subject: pickSubject(),
    previewText: "A thoughtful weekly reflection on global events through a biblical lens.",
    opening,
    biblicalBlock,
    globalBlocks,
    prophecyBlock,
    closing,
  };
}

/**
 * Optional OpenAI refinement. Returns `null` if no key or on failure — caller uses template draft.
 */
export async function refineWeeklyDraftWithAi(draft: WeeklyEmailDraft): Promise<WeeklyEmailDraft | null> {
  const key = String(process.env.OPENAI_API_KEY || "").trim();
  if (!key) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_WEEKLY_EMAIL_MODEL || "gpt-4o-mini",
        temperature: 0.45,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You refine email copy for "Deep Well Weekly," a Christian audience. Rules:
- No fear language, sensationalism, political outrage, or hype
- No certainty claims about prophecy or end-times timing
- Short paragraphs, peaceful premium tone
- Keep facts faithful to the input; do not invent news
- Output JSON only with keys: opening (string), biblicalBody (string), globalSummaries (array of {title, summary}), prophecyBody (string or empty string if none), closing (string), subject (string), previewText (string)
- subject must be like "Deep Well Weekly | …" calm phrase
- previewText one line max ~120 chars`,
          },
          {
            role: "user",
            content: JSON.stringify({
              draft: {
                opening: draft.opening,
                biblicalTitle: draft.biblicalBlock.title,
                biblicalBody: draft.biblicalBlock.body,
                global: draft.globalBlocks,
                prophecy: draft.prophecyBlock,
                closing: draft.closing,
              },
            }),
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      opening?: string;
      biblicalBody?: string;
      globalSummaries?: { title?: string; summary?: string }[];
      prophecyBody?: string;
      closing?: string;
      subject?: string;
      previewText?: string;
    };

    return {
      subject: String(parsed.subject || draft.subject),
      previewText: String(parsed.previewText || draft.previewText),
      opening: String(parsed.opening || draft.opening),
      biblicalBlock: {
        title: draft.biblicalBlock.title,
        body: String(parsed.biblicalBody || draft.biblicalBlock.body),
        sourceLine: draft.biblicalBlock.sourceLine,
      },
      globalBlocks: Array.isArray(parsed.globalSummaries)
        ? parsed.globalSummaries
            .filter((x) => x && x.title)
            .map((x) => ({ title: String(x.title), summary: String(x.summary || "") }))
        : draft.globalBlocks,
      prophecyBlock:
        draft.prophecyBlock && String(parsed.prophecyBody || "").trim()
          ? { title: draft.prophecyBlock.title, body: String(parsed.prophecyBody).trim() }
          : draft.prophecyBlock && !String(parsed.prophecyBody || "").trim()
            ? null
            : draft.prophecyBlock,
      closing: String(parsed.closing || draft.closing),
    };
  } catch {
    return null;
  }
}
