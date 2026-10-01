import { ImageResponse } from "next/og";

export const alt = "Free Google Review QR Code Generator — no sign-up";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#ffffff",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            backgroundImage:
              "linear-gradient(90deg, #ea4335 0 25%, #4285f4 25% 50%, #fbbc05 50% 75%, #34a853 75% 100%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="72" height="72" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <div style={{ fontSize: 30, color: "#202124", fontWeight: 700, marginLeft: 20 }}>
            Google Review QR
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 32 }}>
          <div style={{ fontSize: 84, fontWeight: 800, color: "#202124", lineHeight: 1.05 }}>
            Free Google Review
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, color: "#202124", lineHeight: 1.05 }}>
            QR Code Generator
          </div>
        </div>
        <div style={{ fontSize: 32, color: "#5f6368", marginTop: 28 }}>
          No sign-up · No cost · Print-ready templates
        </div>
      </div>
    ),
    { ...size }
  );
}
