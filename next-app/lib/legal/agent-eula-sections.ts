import type { LegalSection } from "@/lib/legal/types";

/** Source: Autonomous Desktop Agent EULA (app legal/EULA.md). */
export const AGENT_EULA_LAST_UPDATED = "June 21, 2026";

export const AGENT_EULA_INTRO: readonly string[] = [
  'This End User License Agreement ("Agreement") is between you and MixedMakerShop ("we", "us") for the Autonomous Desktop Agent software (the "App").',
  "By installing or using the App, you agree to this Agreement. If you do not agree, do not use the App.",
];

export const AGENT_EULA_SECTIONS: readonly LegalSection[] = [
  {
    id: "license-grant",
    title: "1. License grant",
    paragraphs: [
      "The App is provided free of charge. We grant you a personal, non-exclusive, non-transferable license to install and use the App on your own devices, solely for your own use, subject to this Agreement.",
    ],
  },
  {
    id: "no-fees",
    title: "2. No fees; bring your own key",
    paragraphs: [
      "There is no purchase, license key, subscription, or trial. The App's live AI features require your own Anthropic API key (see Section 3) — your usage costs are billed by Anthropic directly, not by us.",
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
    id: "acceptable-use",
    title: "4. Acceptable use and automation risk",
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
    title: "5. Restrictions",
    paragraphs: [
      "You may not reverse engineer, decompile, or attempt to extract source code except to the extent permitted by law; remove proprietary notices; or use the App to build a competing product.",
    ],
  },
  {
    id: "warranty",
    title: "6. Disclaimer of warranty",
    paragraphs: [
      "THE APP IS PROVIDED \"AS IS\" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE ERROR-FREE OR THAT AUTOMATED ACTIONS WILL BE CORRECT OR SAFE.",
    ],
  },
  {
    id: "liability",
    title: "7. Limitation of liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, OR FOR ANY LOSS OF DATA, PROFITS, OR DAMAGE TO SYSTEMS ARISING FROM YOUR USE OF THE APP. BECAUSE THE APP IS PROVIDED FREE OF CHARGE, OUR TOTAL LIABILITY WILL NOT EXCEED USD $50.",
    ],
  },
  {
    id: "termination",
    title: "8. Termination",
    paragraphs: [
      "This license terminates automatically if you breach it. Upon termination you must stop using and delete the App.",
    ],
  },
  {
    id: "governing-law",
    title: "9. Governing law",
    paragraphs: [
      "This Agreement is governed by the laws of the State of Arkansas, USA, without regard to conflict-of-laws rules.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    paragraphs: ["MixedMakerShop — topher@mixedmakershop.com"],
  },
];
