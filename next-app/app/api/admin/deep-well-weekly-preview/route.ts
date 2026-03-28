import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildDeepWellWeeklyEmail } from "@/lib/worldWatch/email-pipeline";
import { chicagoYmd } from "@/lib/worldWatch/chicago-week";

export const dynamic = "force-dynamic";

/**
 * Authenticated preview of the weekly digest (no send, no DB write).
 * GET — returns JSON with subject, preview text, html, text.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const built = await buildDeepWellWeeklyEmail(now);
  const format = new URL(request.url).searchParams.get("format");

  if (format === "html") {
    return new NextResponse(built.html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json({
    ok: true,
    week_key: chicagoYmd(now),
    subject: built.draft.subject,
    preview_text: built.draft.previewText,
    html: built.html,
    text: built.text,
  });
}
