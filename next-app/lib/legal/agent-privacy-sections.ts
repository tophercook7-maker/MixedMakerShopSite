import type { LegalSection } from "@/lib/legal/types";

/** Source: Autonomous Desktop Agent Privacy Policy (app legal/PRIVACY.md). */
export const AGENT_PRIVACY_LAST_UPDATED = "June 21, 2026";

export const AGENT_PRIVACY_INTRO: readonly string[] = [
  "Seller: MixedMakerShop (\"we\", \"us\"). Contact: topher@mixedmakershop.com.",
  "Autonomous Desktop Agent (the \"App\") is a macOS application that automates your desktop to accomplish goals you describe in natural language. This policy explains what the App accesses and what leaves your computer.",
];

export const AGENT_PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    id: "local-first",
    title: "1. The App is local-first",
    paragraphs: [
      "We do not operate a server that receives your screen contents or activity. The App runs on your Mac and talks directly to the third parties below using your own credentials. We have no backend that stores your usage data.",
    ],
  },
  {
    id: "what-it-accesses",
    title: "2. What the App accesses",
    list: [
      "Screen contents. To perform a task, the App captures screenshots of your screen (or a single window you select) and sends them to your configured AI provider (Anthropic) to identify on-screen elements. Screenshots may contain anything visible on your screen, including sensitive or personal information. Capture only happens during an active run that you start.",
      "Mouse and keyboard control. During a run, the App moves the mouse and types to perform actions, gated by your per-action Allow / Skip / Abort approval.",
      "Your Anthropic API key (BYOK). Stored locally in the macOS Keychain. It is sent only to Anthropic to authenticate your requests. We never receive it.",
    ],
  },
  {
    id: "third-parties",
    title: "3. Data sent to third parties",
    list: [
      "Anthropic (the AI provider). Screenshots and your typed goal are sent to Anthropic's API to plan actions. Your use is governed by Anthropic's terms and privacy policy. Review Anthropic's data-retention settings for your account.",
    ],
    afterList:
      "The App uses your own Anthropic API key (BYOK) and contains no payment processor or in-app purchase, so the App itself collects no payment data.",
  },
  {
    id: "payments",
    title: "4. Purchases and payment",
    paragraphs: [
      "The App is a paid download purchased on mixedmakershop.com. Payment is handled by our payment processor, Stripe, on the website — not inside the App. Stripe processes your card and billing details under its own privacy policy; we never see or store your full card number. We receive limited transaction information (such as confirmation that a purchase was completed and the email associated with it) to provide your download and support, and to honor refunds.",
    ],
  },
  {
    id: "device-storage",
    title: "5. Data stored on your device",
    list: [
      "API key — macOS Keychain.",
      "App preferences (e.g. terms-accepted version) — a JSON file in ~/Library/Application Support/Autonomous Desktop Agent/.",
    ],
    afterList: "You can clear the API key at any time in Settings.",
  },
  {
    id: "analytics",
    title: "6. Analytics / telemetry",
    paragraphs: ["The App does not collect analytics by default. We do not collect telemetry."],
  },
  {
    id: "children",
    title: "7. Children",
    paragraphs: [
      "The App is not directed to children under 13 (or the age of digital consent in your jurisdiction).",
    ],
  },
  {
    id: "your-rights",
    title: "8. Your rights",
    paragraphs: [
      "Because we do not hold your personal data on our servers, most data is under your direct control on your device or in your Anthropic account. For any questions, contact topher@mixedmakershop.com.",
    ],
  },
  {
    id: "changes",
    title: "9. Changes",
    paragraphs: ["We may update this policy; the \"Last updated\" date will change accordingly."],
  },
];
