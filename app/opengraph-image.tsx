import { ImageResponse } from "next/og";

export const alt = "Júlio César Guedes — Senior Frontend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          color: "#171717",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 600 }}>Júlio César Guedes</div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            color: "#52525b",
          }}
        >
          Senior Frontend Engineer — React · TypeScript · AI
        </div>
      </div>
    ),
    { ...size }
  );
}
