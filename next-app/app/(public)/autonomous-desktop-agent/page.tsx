import type { Metadata } from "next";
import Link from "next/link";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { publicShellClass } from "@/lib/public-brand";
import {
  mmsOnGlassMuted,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

const APP_VERSION = "1.0.0";
const DMG_HREF = "/downloads/Autonomous-Desktop-Agent-1.0.0.dmg";
const canonical = `${SITE_URL}/autonomous-desktop-agent`;

export const metadata: Metadata = {
  title: "Autonomous Desktop Agent — Free macOS Automation App | MixedMakerShop",
  description:
    "Download Autonomous Desktop Agent for macOS: describe a goal in plain English and it drives your apps for you — vision-guided, dry-run by default, with a per-action approval gate. Free, bring-your-own-key.",
  alternates: { canonical },
  openGraph: {
    title: "Autonomous Desktop Agent — Free macOS Automation App | MixedMakerShop",
    description:
      "Describe a goal in plain English and it drives your apps for you — vision-guided, dry-run by default, with a per-action approval gate. Free, bring-your-own-key.",
    url: canonical,
  },
};

const FEATURES: readonly { title: string; body: string }[] = [
  {
    title: "Plain-English goals",
    body: "Type what you want done — \"move the customer list from App X to App Y\" — and the agent plans and performs the steps.",
  },
  {
    title: "Vision-guided",
    body: "It screenshots the screen, asks a vision model where the buttons and fields are, then decides the next click or keystroke.",
  },
  {
    title: "You approve every action",
    body: "It ships dry-run by default and gates each real action behind an explicit Allow / Skip / Abort — nothing happens without you.",
  },
  {
    title: "Local-first & private",
    body: "No backend. The app runs on your Mac and talks directly to Anthropic with your own API key. We never receive your screen or key.",
  },
];

export default function AutonomousDesktopAgentPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(publicShellClass, mmsSectionY, "pb-24 md:pb-32")}>
            {/* Hero / download */}
            <header className="public-glass-box public-glass-box--pad mx-auto max-w-3xl text-center">
              <p className={mmsSectionEyebrowOnGlass}>MixedMakerShop Labs · Free for macOS</p>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.5rem] md:leading-[1.1]">
                Autonomous Desktop Agent
              </h1>
              <p className={cn("mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                A desktop automation engine that turns any Mac app into a programmable surface. Describe a goal in plain
                English and it drives your apps for you — screenshotting the screen, finding the controls with a vision
                model, and simulating the clicks and keystrokes. You approve every action.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <a
                  href={DMG_HREF}
                  download
                  className="inline-flex items-center justify-center rounded-full bg-[rgba(232,149,92,0.95)] px-8 py-3.5 text-base font-semibold text-[#10171b] shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:bg-[rgba(232,149,92,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Download for macOS
                </a>
                <p className={cn("text-sm", mmsOnGlassMuted)}>
                  Version {APP_VERSION} · Apple Silicon (M-series) · signed &amp; notarized · ~37 MB
                </p>
              </div>
            </header>

            {/* What it does */}
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="public-glass-box public-glass-box--pad">
                  <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                  <p className={cn("mt-2.5 text-sm leading-relaxed", mmsOnGlassSecondary)}>{feature.body}</p>
                </div>
              ))}
            </div>

            {/* Requirements / BYOK */}
            <section className="public-glass-box public-glass-box--pad mx-auto mt-10 max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Before you start</p>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-white">Requirements</h2>
              <ul className={cn("mt-4 list-disc space-y-2.5 pl-6 text-sm leading-relaxed", mmsOnGlassSecondary)}>
                <li>macOS on Apple Silicon (M1 or newer).</li>
                <li>
                  Your own <strong>Anthropic API key</strong> (BYOK). The app is free; you pay Anthropic directly for
                  usage. Add your key in Settings.
                </li>
                <li>
                  On first live run, macOS will ask for <strong>Screen Recording</strong> and{" "}
                  <strong>Accessibility</strong> permissions — required to see the screen and move the mouse/keyboard.
                </li>
              </ul>
              <p className={cn("mt-5 text-sm leading-relaxed", mmsOnGlassMuted)}>
                Installing: open the downloaded <code>.dmg</code> and drag the app to Applications. The build is signed
                with a Developer ID and notarized by Apple, so it opens without a Gatekeeper warning. An offline demo
                runs with no key.
              </p>
            </section>

            {/* Legal links */}
            <p className={cn("mx-auto mt-10 max-w-3xl text-center text-sm", mmsOnGlassMuted)}>
              By installing you agree to the{" "}
              <Link href="/autonomous-desktop-agent/eula" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                EULA
              </Link>{" "}
              and{" "}
              <Link href="/autonomous-desktop-agent/privacy" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                Privacy Policy
              </Link>
              . Questions? Email{" "}
              <a href="mailto:topher@mixedmakershop.com" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                topher@mixedmakershop.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
