import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  buildAdminQuickMockupDraft,
  type AdminStoredGeneratedMockup,
} from "@/lib/admin-mockup-quick-generate";
import { generateMockupHtmlFromSampleDraft } from "@/lib/generate-mockup-html-document";
import { normalizeLeadSampleRecord } from "@/lib/lead-samples";
import { createClient } from "@/lib/supabase/server";

const MOCKUP_SUBMISSIONS = "mockup_submissions";
const LEAD_SAMPLES = "lead_samples";
const CRM_MOCKUPS = "crm_mockups";

const LEAD_SAMPLE_FIELDS = [
  "id",
  "lead_id",
  "template_key",
  "business_name",
  "business_type",
  "site_goal",
  "headline_style",
  "cta_style",
  "visual_theme",
  "template_type",
  "suggested_image_category",
  "hero_headline",
  "hero_subheadline",
  "cta_text",
  "intro_text",
  "services",
  "image_urls",
  "additional_image_urls",
  "primary_image_url",
  "gallery_image_urls",
  "accent_mode",
  "preview_slug",
  "status",
  "created_at",
  "updated_at",
  "owner_id",
] as const;

function buildSafeSamplePayload(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([key, value]) => (LEAD_SAMPLE_FIELDS as readonly string[]).includes(key) && value !== undefined
    )
  );
}

function parseSubmissionPayload(row: Record<string, unknown>) {
  const mockupData = (row.mockup_data as Record<string, unknown> | null) || {};
  const snap =
    mockupData.snapshot && typeof mockupData.snapshot === "object" && !Array.isArray(mockupData.snapshot)
      ? (mockupData.snapshot as Record<string, unknown>)
      : {};
  const leadId = String(mockupData.lead_id || "").trim();
  return {
    business_name: String(snap.business_name || "").trim(),
    category: String(snap.category || "").trim(),
    city: String(snap.city || "").trim(),
    top_services_text: String(row.top_services_to_feature || snap.top_services_to_feature || "").trim(),
    legacy_services_text: String(snap.services_text || "").trim(),
    selected_template_key: String(row.selected_template_key || snap.selected_template_key || "clean-professional").trim(),
    what_makes_you_different: String(row.what_makes_you_different || snap.what_makes_you_different || "").trim(),
    special_offer_or_guarantee: String(
      row.special_offer_or_guarantee || snap.special_offer_or_guarantee || ""
    ).trim(),
    lead_id: leadId,
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const submissionId = String(id || "").trim();
  if (!submissionId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const supabase = await createClient();
  const { data: row, error: fetchErr } = await supabase
    .from(MOCKUP_SUBMISSIONS)
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: fetchErr?.message || "Not found" }, { status: fetchErr ? 500 : 404 });
  }

  const r = row as unknown as Record<string, unknown>;
  const input = parseSubmissionPayload(r);

  if (!input.business_name) {
    return NextResponse.json({ error: "Submission is missing business name." }, { status: 400 });
  }
  if (!input.city) {
    return NextResponse.json({ error: "Submission is missing city / service area." }, { status: 400 });
  }
  if (!input.top_services_text && !input.legacy_services_text) {
    return NextResponse.json({ error: "Submission is missing services to feature." }, { status: 400 });
  }

  const generatorInput = {
    ...input,
    lead_id: input.lead_id || "admin-preview-local",
  };
  const built = buildAdminQuickMockupDraft(generatorInput);

  const now = new Date().toISOString();
  let leadSampleId: string | null = null;

  if (input.lead_id) {
    const normalized = normalizeLeadSampleRecord({
      ...built.leadSample,
      lead_id: input.lead_id,
      id: crypto.randomUUID(),
      source: "server",
      isLocalOnly: false,
      updated_at: now,
      created_at: now,
    });

    const samplePayload = buildSafeSamplePayload({
      ...normalized,
      owner_id: user.id,
    });

    const { data: sampleRow, error: sampleErr } = await supabase
      .from(LEAD_SAMPLES)
      .upsert(samplePayload, { onConflict: "id" })
      .select("id")
      .single();

    if (sampleErr || !sampleRow?.id) {
      console.error("[generated-mockup] lead_samples upsert failed", sampleErr?.message);
      return NextResponse.json(
        { error: sampleErr?.message || "Could not save lead sample.", reason: "lead_sample_failed" },
        { status: 500 }
      );
    }
    leadSampleId = String(sampleRow.id);
  }

  const stored: AdminStoredGeneratedMockup = {
    generated_at: now,
    template_key: built.template_key,
    selected_template_key: input.selected_template_key,
    structured: built.structured,
    sampleDraft: built.draft,
    stylePreset: built.stylePreset,
    colorPreset: built.colorPreset,
    imageCategoryKey: built.imageCategoryKey,
    lead_sample_id: leadSampleId,
  };

  const { data: crmRow } = input.lead_id
    ? await supabase
        .from(CRM_MOCKUPS)
        .select("id, raw_payload")
        .eq("lead_id", input.lead_id)
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null };

  let crmUpdated = false;
  if (crmRow && "id" in crmRow && crmRow.id) {
    const prevRaw =
      crmRow.raw_payload && typeof crmRow.raw_payload === "object" && !Array.isArray(crmRow.raw_payload)
        ? (crmRow.raw_payload as Record<string, unknown>)
        : {};
    const nextRaw = {
      ...prevRaw,
      services: built.structured.services,
      style_preset: built.stylePreset,
      color_preset: built.colorPreset,
    };

    let generated_html: string | null = null;
    let html_generated_at: string | null = null;
    try {
      generated_html = await generateMockupHtmlFromSampleDraft(built.draft, {
        businessName: input.business_name,
        stylePreset: built.stylePreset,
        colorPreset: built.colorPreset,
        imageCategoryKey: built.imageCategoryKey,
        templateKey: built.template_key,
      });
      html_generated_at = now;
    } catch (e) {
      console.error("[generated-mockup] HTML export failed", e);
    }

    const { error: crmErr } = await supabase
      .from(CRM_MOCKUPS)
      .update({
        headline: built.structured.hero.headline,
        subheadline: built.structured.hero.subheadline,
        cta_text: built.structured.hero.cta,
        raw_payload: nextRaw,
        ...(generated_html ? { generated_html, html_generated_at } : {}),
        updated_at: now,
      })
      .eq("id", crmRow.id)
      .eq("owner_id", user.id);

    if (!crmErr) crmUpdated = true;
    else console.error("[generated-mockup] crm_mockups update failed", crmErr.message);
  }

  const { error: upErr } = await supabase
    .from(MOCKUP_SUBMISSIONS)
    .update({ admin_generated_mockup: stored as unknown as Record<string, unknown> })
    .eq("id", submissionId);

  if (upErr) {
    console.error("[generated-mockup] mockup_submissions update failed", upErr.message);
    return NextResponse.json({ error: "Could not save generated mockup on submission." }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const previewPath = leadSampleId ? `/samples/${encodeURIComponent(leadSampleId)}` : null;

  return NextResponse.json({
    ok: true,
    admin_generated: stored,
    lead_sample_id: leadSampleId,
    previewPath,
    previewUrl: previewPath && origin ? `${origin}${previewPath}` : previewPath,
    crm_mockup_updated: crmUpdated,
    lead_sample_saved: Boolean(leadSampleId),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const submissionId = String(id || "").trim();
  if (!submissionId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!isRecord(body) || !isRecord(body.sampleDraft)) {
    return NextResponse.json({ error: "Expected { sampleDraft: object }" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: row, error: fetchErr } = await supabase
    .from(MOCKUP_SUBMISSIONS)
    .select("admin_generated_mockup")
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prev = row.admin_generated_mockup;
  if (!isRecord(prev)) {
    return NextResponse.json({ error: "Generate a mockup first." }, { status: 400 });
  }

  const prevGen = prev as unknown as AdminStoredGeneratedMockup;
  const nextDraft = body.sampleDraft as AdminStoredGeneratedMockup["sampleDraft"];
  const merged: AdminStoredGeneratedMockup = {
    ...prevGen,
    sampleDraft: nextDraft,
    generated_at: new Date().toISOString(),
    structured: {
      ...prevGen.structured,
      hero: {
        headline: nextDraft.heroHeadline,
        subheadline: nextDraft.heroSub,
        cta: nextDraft.heroPrimaryCta,
      },
      why_choose_us: Array.isArray(nextDraft.whyChooseBullets) ? nextDraft.whyChooseBullets : prevGen.structured.why_choose_us,
      about: nextDraft.aboutText || prevGen.structured.about,
      cta_section: {
        title: nextDraft.finalTitle,
        sub: nextDraft.finalSub,
        cta: nextDraft.finalCta,
      },
      services: nextDraft.offerings?.map((o) => o.name).filter(Boolean).length
        ? (nextDraft.offerings!.map((o) => o.name) as string[])
        : prevGen.structured.services,
    },
  };

  const { error: upErr } = await supabase
    .from(MOCKUP_SUBMISSIONS)
    .update({ admin_generated_mockup: merged as unknown as Record<string, unknown> })
    .eq("id", submissionId);

  if (upErr) {
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, admin_generated: merged });
}
