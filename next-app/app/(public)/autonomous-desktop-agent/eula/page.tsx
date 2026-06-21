import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/public/LegalPageLayout";
import {
  AGENT_EULA_INTRO,
  AGENT_EULA_LAST_UPDATED,
  AGENT_EULA_SECTIONS,
} from "@/lib/legal/agent-eula-sections";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/autonomous-desktop-agent/eula`;

export const metadata: Metadata = {
  title: "Autonomous Desktop Agent — EULA | MixedMakerShop",
  description:
    "End User License Agreement for the Autonomous Desktop Agent macOS app: free, bring-your-own-key license terms, automation risk, and disclaimers.",
  alternates: { canonical },
  openGraph: {
    title: "Autonomous Desktop Agent — EULA | MixedMakerShop",
    description:
      "End User License Agreement for the Autonomous Desktop Agent macOS app: free, bring-your-own-key license terms, automation risk, and disclaimers.",
    url: canonical,
  },
};

export default function AgentEulaPage() {
  return (
    <LegalPageLayout
      eyebrow="Autonomous Desktop Agent"
      title="End User License Agreement"
      lastUpdated={AGENT_EULA_LAST_UPDATED}
      intro={AGENT_EULA_INTRO}
      sections={AGENT_EULA_SECTIONS}
      relatedLink={{ href: "/autonomous-desktop-agent/privacy", label: "Privacy Policy" }}
    />
  );
}
