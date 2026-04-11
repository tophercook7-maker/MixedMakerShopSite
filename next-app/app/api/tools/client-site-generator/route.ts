import { NextResponse } from "next/server";
import type { NicheKey } from "@astro-niche-pack/types/niche";
import type { ClientIntake } from "@/lib/client-site-generator/intake-schema";
import {
  buildIntakeFromNicheDefaults,
  buildClientConfigFromIntake,
  formatClientConfigTsFile,
  validateFullIntake,
} from "@/lib/client-site-generator/generate-client-config";

export const runtime = "nodejs";

/**
 * POST JSON body: `Partial<ClientIntake> & { nicheKey: NicheKey }` (same shape as CLI intake.json).
 * Returns generated TS, slugs, previews, or validation errors.
 */
export async function POST(req: Request) {
  try {
    const raw = (await req.json()) as Partial<ClientIntake> & { nicheKey: NicheKey };
    if (!raw.nicheKey) {
      return NextResponse.json({ ok: false, error: "nicheKey is required" }, { status: 400 });
    }
    const intake = buildIntakeFromNicheDefaults(raw);
    const issues = validateFullIntake(intake);
    if (issues.length) {
      return NextResponse.json({ ok: false, issues }, { status: 400 });
    }
    const result = buildClientConfigFromIntake(intake);
    const ts = formatClientConfigTsFile(intake, result);
    return NextResponse.json({
      ok: true,
      ts,
      intake,
      localPageSlugs: result.localPageSlugs,
      homepagePreview: result.homepagePreview,
      selectedServicesResolved: result.selectedServicesResolved,
      checklist: result.checklist,
      registerClientSnippet: result.registerClientSnippet,
      clientKey: intake.clientKey,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
