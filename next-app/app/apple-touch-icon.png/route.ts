import { NextResponse } from "next/server";

/** Apple touch icon → brand mark until `public/apple-touch-icon.png` exists. */
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/m3-brand.png", request.url), 308);
}
