import { NextResponse } from "next/server";
import type { NicheKey } from "@astro-niche-pack/types/niche";
import { buildIntakeFromNicheDefaults } from "@/lib/client-site-generator/generate-client-config";

export const runtime = "nodejs";

/** POST `{ nicheKey }` — returns CTA/hero/service defaults for that niche (for the generator form). */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { nicheKey?: NicheKey };
    const nicheKey = body.nicheKey;
    if (!nicheKey) {
      return NextResponse.json({ ok: false, error: "nicheKey is required" }, { status: 400 });
    }
    const intake = buildIntakeFromNicheDefaults({ nicheKey });
    return NextResponse.json({
      ok: true,
      defaults: {
        primaryCtaLabel: intake.primaryCtaLabel,
        primaryCtaHref: intake.primaryCtaHref,
        heroHeadline: intake.heroHeadline,
        heroSubheadline: intake.heroSubheadline,
        offerText: intake.offerText,
        reviewPrompt: intake.reviewPrompt,
        selectedServices: intake.selectedServices,
        featuredServices: intake.featuredServices,
        trustPoints: intake.trustPoints,
        pricingStyle: intake.pricingStyle,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
