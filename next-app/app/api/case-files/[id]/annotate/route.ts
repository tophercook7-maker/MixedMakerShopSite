import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, Number(n || 0)));
}

function buildAnnotatedSvgDataUrl(baseScreenshotUrl: string, rect: Rect): string {
  const x = clampPercent(rect.x);
  const y = clampPercent(rect.y);
  const w = clampPercent(rect.w);
  const h = clampPercent(rect.h);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <image href="${baseScreenshotUrl}" x="0" y="0" width="1200" height="675" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${(x / 100) * 1200}" y="${(y / 100) * 675}" width="${(w / 100) * 1200}" height="${(h / 100) * 675}"
        fill="none" stroke="#ef4444" stroke-width="8"/>
  <rect x="${(x / 100) * 1200}" y="${Math.max(0, (y / 100) * 675 - 42)}" width="220" height="36" fill="#ef4444" opacity="0.92"/>
  <text x="${(x / 100) * 1200 + 10}" y="${Math.max(24, (y / 100) * 675 - 18)}" fill="#ffffff" font-family="Arial, sans-serif" font-size="20">
    issue highlight
  </text>
</svg>`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    base_screenshot_url?: string;
    rect?: Rect;
  };
  const baseScreenshotUrl = String(body.base_screenshot_url || "").trim();
  const rect = body.rect;

  if (!id) {
    return NextResponse.json({ error: "Missing case id." }, { status: 400 });
  }
  if (!baseScreenshotUrl || !rect) {
    return NextResponse.json({ error: "Missing image URL or annotation rectangle." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const annotatedUrl = buildAnnotatedSvgDataUrl(baseScreenshotUrl, rect);
  const annotationPayload = {
    base_screenshot_url: baseScreenshotUrl,
    rect: {
      x: clampPercent(rect.x),
      y: clampPercent(rect.y),
      w: clampPercent(rect.w),
      h: clampPercent(rect.h),
    },
    annotated_screenshot_url: annotatedUrl,
    updated_at: new Date().toISOString(),
  };

  const primary = await supabase
    .from("case_files")
    .update({
      annotated_screenshot_url: annotatedUrl,
      annotation_payload: annotationPayload,
    })
    .eq("id", id)
    .select("id,annotated_screenshot_url")
    .limit(1);

  if (!primary.error) {
    return NextResponse.json({
      ok: true,
      case_id: id,
      annotated_screenshot_url: annotatedUrl,
    });
  }

  // Schema fallback: persist annotation payload into notes if dedicated columns are missing.
  const fallbackNotes = `[annotated_screenshot] ${JSON.stringify(annotationPayload)}`;
  const fallback = await supabase
    .from("case_files")
    .update({
      notes: fallbackNotes,
    })
    .eq("id", id)
    .select("id")
    .limit(1);

  if (fallback.error) {
    return NextResponse.json(
      { error: primary.error.message || fallback.error.message || "Could not save annotation." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    case_id: id,
    annotated_screenshot_url: annotatedUrl,
    fallback: "notes",
  });
}

