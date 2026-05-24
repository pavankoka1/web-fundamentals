import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#08080F",
          color: "#F4F4F8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            letterSpacing: "0.2em",
            color: "#7DD3FC",
            marginBottom: 24,
          }}
        >
          WEB-INTERNALS · TUTORIAL
        </div>
        <div style={{ fontSize: 76, lineHeight: 1, fontWeight: 400 }}>From URL to pixels.</div>
        <div style={{ fontSize: 76, lineHeight: 1, fontWeight: 400, marginTop: 8 }}>
          In seven steps.
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 18,
            color: "rgba(244, 244, 248, 0.7)",
            maxWidth: 720,
            textAlign: "center",
          }}
        >
          The browser&apos;s journey, from the moment you press Enter to the moment pixels appear.
        </div>
      </div>
    ),
    size,
  );
}
