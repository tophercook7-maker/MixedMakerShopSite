import type { LegalSection } from "@/lib/legal/types";

/** Source: Autonomous Desktop Agent EULA (app legal/EULA.md). */
export const AGENT_EULA_LAST_UPDATED = "June 21, 2026";

export const AGENT_EULA_INTRO: readonly string[] = [
  'This End User License Agreement ("Agreement") is between you and MixedMakerShop ("we", "us") for the Autonomous Desktop Agent software (the "App").',
  "By purchasing, installing, or using the App, you agree to this Agreement. If you do not agree, do not purchase or use the App.",
];

export const AGENT_EULA_SECTIONS: readonly LegalSection[] = [
  {
    id: "license-grant",
    title: "1. License grant",
    paragraphs: [
      "The App is licensed, not sold. In exchange for the one-time license fee, we grant you a personal, non-exclusive, non-transferable license to install and use the App on Macs you own or control, for your own use, subject to this Agreement.",
    ],
  },
  {
    id: "fee",
    title: "2. License fee and bring your own key",
    paragraphs: [
      "The App requires a one-time purchase (no subscription). The price shown at checkout is the total license fee. Separately, the App's live AI features require your own Anthropic API key (see Section 3) — that usage is billed by Anthropic directly, not by us. The license fee does not include AI usage costs.",
    ],
  },
  {
    id: "byok",
    title: "3. Bring Your Own Key (BYOK)",
    paragraphs: [
      "The App requires your own Anthropic API key to operate live features. You are responsible for all charges incurred on your Anthropic account and for complying with Anthropic's terms. We are not responsible for AI provider availability, output, or costs.",
    ],
  },
  {
    id: "refunds",
    title: "4. Refunds",
    paragraphs: [
      "The App is a digital product delivered immediately, so sales are generally final. That said, we want you to be happy: if the App does not work for you, email topher@mixedmakershop.com within 14 days of purchase and we will issue a full refund. Refunds requested after 14 days are at our discretion.",
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable use and automation risk",
    paragraphs: [
      "The App simulates real mouse and keyboard input and can control other applications on your computer. You acknowledge:",
    ],
    list: [
      "You are solely responsible for the goals you give the App and the actions it performs on your systems and accounts.",
      "Automation can produce unintended results. The App provides a per-action confirmation gate and a dry-run mode; you are responsible for using them.",
      "You will not use the App to violate any law, third-party terms of service, or to access systems you are not authorized to use.",
    ],
  },
  {
    id: "restrictions",
    title: "6. Restrictions",
    paragraphs: [
      "You may not resell, redistribute, or share the App or its installer; reverse engineer, decompile, or attempt to extract source code except to the extent permitted by law; remove proprietary notices; or use the App to build a competing product.",
    ],
  },
  {
    id: "warranty",
    title: "7. Disclaimer of warranty",
    paragraphs: [
      "THE APP IS PROVIDED \"AS IS\" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE ERROR-FREE OR THAT AUTOMATED ACTIONS WILL BE CORRECT OR SAFE.",
    ],
  },
  {
    id: "liability",
    title: "8. Limitation of liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, OR FOR ANY LOSS OF DATA, PROFITS, OR DAMAGE TO SYSTEMS ARISING FROM YOUR USE OF THE APP. OUR TOTAL LIABILITY ARISING FROM OR RELATED TO THE APP WILL NOT EXCEED THE AMOUNT YOU PAID FOR THE LICENSE.",
    ],
  },
  {
    id: "termination",
    title: "9. Termination",
    paragraphs: [
      "This license terminates automatically if you breach it. Upon termination you must stop using and delete the App.",
    ],
  },
  {
    id: "governing-law",
    title: "10. Governing law",
    paragraphs: [
      "This Agreement is governed by the laws of the State of Arkansas, USA, without regard to conflict-of-laws rules.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact",
    paragraphs: ["MixedMakerShop — topher@mixedmakershop.com"],
  },
];
