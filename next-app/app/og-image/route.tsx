import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a, #020617)",
          color: "white",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* TOP BAR */}
        <div style={{ fontSize: 28, opacity: 0.7 }}>MixedMakerShop.com</div>

        {/* MAIN HEADLINE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
            Your Website Should
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#22c55e",
              lineHeight: 1.1,
            }}
          >
            Be Bringing You Clients
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div style={{ fontSize: 32, opacity: 0.85 }}>
          Free Mockup • No Risk • Built For Conversions
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
