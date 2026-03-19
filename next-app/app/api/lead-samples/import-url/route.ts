import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const BUCKET = "lead-sample-images";

function looksLikeImageUrl(url: string): boolean {
  const value = String(url || "").trim();
  if (!/^https?:\/\//i.test(value)) return false;
  return (
    /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value) ||
    value.includes("images.unsplash.com") ||
    value.includes("fbcdn.net")
  );
}

function extensionFromContentType(contentType: string): string {
  const lower = String(contentType || "").toLowerCase();
  if (lower.includes("png")) return "png";
  if (lower.includes("webp")) return "webp";
  if (lower.includes("gif")) return "gif";
  if (lower.includes("svg")) return "svg";
  if (lower.includes("avif")) return "avif";
  return "jpg";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { url?: string; lead_id?: string };
  const rawUrl = String(body.url || "").trim();
  const leadId = String(body.lead_id || "").trim() || "sample";
  if (!rawUrl) return NextResponse.json({ error: "url is required" }, { status: 400 });
  if (!looksLikeImageUrl(rawUrl)) {
    return NextResponse.json({ error: "URL does not look like an image." }, { status: 400 });
  }

  try {
    const remote = await fetch(rawUrl);
    if (!remote.ok) {
      return NextResponse.json({ url: rawUrl, mode: "external_url_fallback" });
    }
    const contentType = String(remote.headers.get("content-type") || "").toLowerCase();
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ url: rawUrl, mode: "external_url_fallback" });
    }
    const arrayBuffer = await remote.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    try {
      const supabase = await createClient();
      const ext = extensionFromContentType(contentType);
      const objectPath = `${user.id}/${leadId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, bytes, {
          contentType,
          upsert: false,
        });
      if (!uploadError) {
        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
        const publicUrl = String(publicData?.publicUrl || "").trim();
        if (publicUrl) {
          return NextResponse.json({ url: publicUrl, mode: "managed_storage", path: objectPath });
        }
      }
    } catch {
      // fallback below
    }

    return NextResponse.json({ url: rawUrl, mode: "external_url_fallback" });
  } catch {
    return NextResponse.json({ url: rawUrl, mode: "external_url_fallback" });
  }
}
