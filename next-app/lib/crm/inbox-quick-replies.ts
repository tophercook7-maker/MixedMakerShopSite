export type InboxQuickReply = {
  id: string;
  label: string;
  message: string;
};

/** Short reply chips for the focus inbox — no navigation required. */
export const INBOX_QUICK_REPLIES: InboxQuickReply[] = [
  {
    id: "first_touch",
    label: "First hello",
    message:
      "Hey — this is Topher with MixedMaker. I help local businesses get more calls with simple websites.\n\nWant me to show you a quick example for your business?",
  },
  {
    id: "interested",
    label: "They’re interested",
    message:
      "Nice, glad you like it 👍\n\nI can turn that into a real live site pretty quickly — want me to show you how it would work and pricing?",
  },
  {
    id: "price",
    label: "Pricing",
    message:
      "Good question — I keep it simple.\n\nStarter setups are $400 (clean one-page site, mobile-friendly, click-to-call, contact form).\n\nBusiness setups are $900 for 3–5 pages, service pages, stronger CTAs, and Google setup.\n\nWant me to break down what you'd get?",
  },
  {
    id: "follow_up",
    label: "Gentle follow-up",
    message:
      "Hey — just circling back in case my last note got buried.\n\nStill happy to show you a quick website idea for your business if you want.",
  },
  {
    id: "not_now",
    label: "Not now",
    message:
      "No worries at all 👍\n\nIf you ever want something like that set up later, just let me know.",
  },
];

export function quickReplyForCategory(category: string): InboxQuickReply {
  if (category === "reply") return INBOX_QUICK_REPLIES.find((q) => q.id === "interested")!;
  if (category === "follow_up") return INBOX_QUICK_REPLIES.find((q) => q.id === "follow_up")!;
  return INBOX_QUICK_REPLIES.find((q) => q.id === "first_touch")!;
}
