import { ImageResponse } from "next/og";

export const alt = "Julio Cesar Guedes — Senior Frontend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#fafaf9",
          color: "#1c1917",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 600 }}>Julio Cesar Guedes</div>
        <div
          style={{
            marginTop: 16,
            fontSize: 26,
            color: "#44403c",
          }}
        >
          Senior Frontend | React, TypeScript, Node.js, AWS
        </div>
      </div>
    ),
    { ...size }
  );
}
