import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.titleLine}`;
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
        <div style={{ fontSize: 56, fontWeight: 600 }}>{site.name}</div>
        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            color: "#44403c",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {site.role}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 18,
            color: "#78716c",
          }}
        >
          {site.subtitleLine}
        </div>
      </div>
    ),
    { ...size }
  );
}
