import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/public/LegalPageLayout";
import {
  AGENT_PRIVACY_INTRO,
  AGENT_PRIVACY_LAST_UPDATED,
  AGENT_PRIVACY_SECTIONS,
} from "@/lib/legal/agent-privacy-sections";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/autonomous-desktop-agent/privacy`;

export const metadata: Metadata = {
  title: "Autonomous Desktop Agent — Privacy Policy | MixedMakerShop",
  description:
    "Privacy Policy for the Autonomous Desktop Agent macOS app: local-first, no backend, screenshots sent only to your own Anthropic API key (BYOK).",
  alternates: { canonical },
  openGraph: {
    title: "Autonomous Desktop Agent — Privacy Policy | MixedMakerShop",
    description:
      "Privacy Policy for the Autonomous Desktop Agent macOS app: local-first, no backend, screenshots sent only to your own Anthropic API key (BYOK).",
    url: canonical,
  },
};

export default function AgentPrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Autonomous Desktop Agent"
      title="Privacy Policy"
      lastUpdated={AGENT_PRIVACY_LAST_UPDATED}
      intro={AGENT_PRIVACY_INTRO}
      sections={AGENT_PRIVACY_SECTIONS}
      relatedLink={{ href: "/autonomous-desktop-agent/eula", label: "EULA" }}
    />
  );
}
