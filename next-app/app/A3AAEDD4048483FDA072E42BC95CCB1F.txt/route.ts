const INDEXNOW_KEY = "A3AAEDD4048483FDA072E42BC95CCB1F";

export const dynamic = "force-static";

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
