import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Premium share card at `/og-image` (iMessage, Facebook, Messenger, etc.). */
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
          background: "linear-gradient(135deg, #03120f 0%, #071f19 45%, #0b2b21 100%)",
          color: "#f5f5f4",
          padding: "56px 64px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at top right, rgba(245, 158, 11, 0.18), transparent 35%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              border: "2px solid rgba(245, 158, 11, 0.75)",
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#f59e0b",
            }}
          >
            M
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#f59e0b",
              }}
            >
              MixedMakerShop
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Web Design • 3D Printing • Custom Builds
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 900,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            Build bold.
            <br />
            Print custom.
            <br />
            Grow local.
          </div>

          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Premium websites, standout prints, and creative solutions for local businesses.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 22, color: "#f59e0b" }}>mixedmakershop.com</div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.65)" }}>
            Custom work that actually gets noticed
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
