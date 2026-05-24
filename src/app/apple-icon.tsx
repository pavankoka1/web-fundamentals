import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#08080F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
        }}
      >
        <svg viewBox="0 0 32 32" width="120" height="120" fill="none">
          <circle cx="16" cy="16" r="15" stroke="#7DD3FC" strokeWidth="1.4" />
          <path d="M 12 9 L 12 23" stroke="#7DD3FC" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 12 16 L 20 9" stroke="#7DD3FC" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 12 16 L 20 23" stroke="#7DD3FC" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
