import { NextResponse } from "next/server";

/** Canonical mark until a dedicated `.ico` is added to `public/`. */
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/m3-brand.png", request.url), 308);
}
