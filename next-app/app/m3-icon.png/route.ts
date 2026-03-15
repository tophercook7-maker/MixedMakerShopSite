import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/m3-icon.svg", request.url), 308);
}
