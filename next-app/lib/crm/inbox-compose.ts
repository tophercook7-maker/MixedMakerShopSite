import { appendEncodedSmsBody, cleanPhoneForSmsAndTel } from "@/lib/crm/lead-phone-link";
import { getTemplateSet } from "@/lib/crm-utils";
import { quickReplyForCategory } from "@/lib/crm/inbox-quick-replies";
import type { InboxCategory, InboxItem } from "@/lib/crm/inbox-queue";

export type InboxComposeFields = {
  businessCategory?: string | null;
  suggestedResponse?: string | null;
  bestContactMethod?: string | null;
  website?: string | null;
  hasWebsite?: boolean | null;
  leadTags?: string[] | null;
};

export type InboxFocusItem = InboxItem & InboxComposeFields;

export type InboxSendAction = {
  label: string;
  href: string;
  channel: "text" | "email" | "call" | "facebook" | "copy";
  copyFirst: boolean;
};

function withHttp(url: string): string {
  const u = url.trim();
  return u.startsWith("http") ? u : `https://${u}`;
}

export function defaultInboxMessage(item: InboxFocusItem): string {
  const suggested = String(item.suggestedResponse || "").trim();
  if (suggested) return suggested;

  if (item.kind === "mockup") {
    return quickReplyForCategory("new").message;
  }

  const templates = getTemplateSet({
    category: item.businessCategory,
    businessName: item.title,
  });

  if (item.category === "reply") {
    return quickReplyForCategory("reply").message;
  }
  if (item.category === "follow_up") {
    return templates.smsFollowUp || quickReplyForCategory("follow_up").message;
  }

  if (item.contact.phone) return templates.smsInitial;
  if (item.contact.email) return templates.emailBody;
  return templates.smsInitial;
}

function resolveChannel(item: InboxFocusItem): InboxSendAction["channel"] {
  const method = String(item.bestContactMethod || "").trim().toLowerCase();
  if (method === "email" && item.contact.email) return "email";
  if (method === "facebook" && item.contact.facebookUrl) return "facebook";
  if (method === "phone" && item.contact.phone) return "text";
  if (item.contact.phone) return "text";
  if (item.contact.email) return "email";
  if (item.contact.facebookUrl) return "facebook";
  return "copy";
}

export function buildInboxSendAction(item: InboxFocusItem, message: string): InboxSendAction {
  const body = message.trim();
  const channel = resolveChannel(item);

  if (channel === "text" && item.contact.phone) {
    const phone = cleanPhoneForSmsAndTel(item.contact.phone);
    if (phone) {
      return {
        label: "Send text",
        href: appendEncodedSmsBody(phone.smsHref, body),
        channel: "text",
        copyFirst: true,
      };
    }
  }

  if (channel === "email" && item.contact.email) {
    const subject =
      item.category === "reply"
        ? `Re: ${item.title}`
        : `Quick idea for ${item.title}`;
    const params = new URLSearchParams();
    params.set("subject", subject);
    if (body) params.set("body", body);
    return {
      label: "Send email",
      href: `mailto:${encodeURIComponent(item.contact.email)}?${params.toString()}`,
      channel: "email",
      copyFirst: true,
    };
  }

  if (channel === "call" && item.contact.phone) {
    const phone = cleanPhoneForSmsAndTel(item.contact.phone);
    return {
      label: "Call now",
      href: phone?.telHref || `tel:${item.contact.phone}`,
      channel: "call",
      copyFirst: false,
    };
  }

  if (channel === "facebook" && item.contact.facebookUrl) {
    return {
      label: "Open Facebook",
      href: withHttp(item.contact.facebookUrl),
      channel: "facebook",
      copyFirst: true,
    };
  }

  if (item.kind === "mockup" && item.contact.email) {
    const params = new URLSearchParams();
    params.set("subject", `Your free website preview — ${item.title}`);
    if (body) params.set("body", body);
    return {
      label: "Email them",
      href: `mailto:${encodeURIComponent(item.contact.email)}?${params.toString()}`,
      channel: "email",
      copyFirst: true,
    };
  }

  return {
    label: "Copy message",
    href: "",
    channel: "copy",
    copyFirst: true,
  };
}

export function categoryHeadline(category: InboxCategory, item: InboxFocusItem): string {
  if (item.kind === "mockup") return "New free mockup — reach out";
  switch (category) {
    case "reply":
      return "They replied — your turn";
    case "follow_up":
      return "Follow-up due";
    case "mockup":
      return "New mockup lead";
    default:
      return "New lead — say hello";
  }
}
