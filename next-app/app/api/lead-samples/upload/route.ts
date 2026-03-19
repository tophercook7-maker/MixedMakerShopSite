import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const BUCKET = "lead-sample-images";

function looksLikeImageContentType(contentType: string): boolean {
  return String(contentType || "").toLowerCase().startsWith("image/");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const leadId = String(form?.get("lead_id") || "").trim() || "sample";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }
  if (!looksLikeImageContentType(file.type)) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const objectPath = `${user.id}/${leadId}/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  try {
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (!uploadError) {
      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      const publicUrl = String(publicData?.publicUrl || "").trim();
      if (publicUrl) {
        return NextResponse.json({ url: publicUrl, mode: "managed_storage", path: objectPath });
      }
    }

    const base64 = Buffer.from(bytes).toString("base64");
    const fallbackDataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
    return NextResponse.json({ url: fallbackDataUrl, mode: "local_data_url" });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not process upload.",
      },
      { status: 500 }
    );
  }
}
