import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "miggydev.log — dev log & experiments";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Inter Bold from fontsource on jsdelivr (TTF, Satori-compatible).
  const interBold = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
  ).then((res) => res.arrayBuffer());

  const logoBytes = fs.readFileSync(
    path.join(process.cwd(), "public/miggydev-mark.png"),
  );
  const logoSrc = `data:image/png;base64,${Buffer.from(logoBytes).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "#09090b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          padding: 96,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={320} height={320} alt="" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              color: "#facc15",
              fontFamily: "Inter",
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            miggydev.log
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#fafafa",
              fontFamily: "Inter",
              opacity: 0.7,
              letterSpacing: -0.5,
            }}
          >
            dev log &amp; experiments
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Inter", data: interBold, weight: 700, style: "normal" }],
    },
  );
}
