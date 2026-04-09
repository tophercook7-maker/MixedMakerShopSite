export type FollowUpTemplateKey = "initial_outreach" | "follow_up_1" | "follow_up_2" | "follow_up_3";

export type FollowUpTemplate = {
  key: FollowUpTemplateKey;
  label: string;
  subject?: string;
  body: string;
};

/** Built-in copy for manual send / paste — no admin CMS yet. */
export const FOLLOW_UP_TEMPLATES: readonly FollowUpTemplate[] = [
  {
    key: "initial_outreach",
    label: "Initial outreach",
    subject: "Got your request",
    body: `Hey — I got your message.

I'm going to take a look at what you sent and get back to you with next steps or a mockup.

If there's anything specific you want me to focus on, just reply here.

– Topher`,
  },
  {
    key: "follow_up_1",
    label: "Follow-up 1",
    body: `Hey — just checking in to make sure you saw my last message.

If you want, I can put together a quick mockup or point you in the right direction.

– Topher`,
  },
  {
    key: "follow_up_2",
    label: "Follow-up 2",
    body: `Still happy to help if you're working on your site.

Even if you just want quick feedback, I can take a look.

– Topher`,
  },
  {
    key: "follow_up_3",
    label: "Follow-up 3 (final)",
    body: `I'm going to close this out for now, but if you still want help with your site later, just reach out anytime.

– Topher`,
  },
] as const;

const BY_KEY = new Map(FOLLOW_UP_TEMPLATES.map((t) => [t.key, t]));

export function getFollowUpTemplate(key: string | null | undefined): FollowUpTemplate | null {
  const k = String(key || "").trim() as FollowUpTemplateKey;
  return BY_KEY.get(k) ?? null;
}

/** Next template to use when `follow_up_count` outbound sends so far = `currentCount`. */
export function templateKeyForNextSend(currentCount: number): FollowUpTemplateKey | null {
  const keys: FollowUpTemplateKey[] = ["initial_outreach", "follow_up_1", "follow_up_2", "follow_up_3"];
  const idx = Math.floor(currentCount);
  if (idx < 0 || idx >= keys.length) return null;
  return keys[idx];
}
