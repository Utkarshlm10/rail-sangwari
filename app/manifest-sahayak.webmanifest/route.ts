import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    name: "संगवारी साथी (Sangwari Sahayak Partner)",
    short_name: "संगवारी साथी",
    description: "Official SECR Licensed Sahayak Duty Portal for Bilaspur, Raipur, and Durg Junction.",
    start_url: "/sahayak",
    scope: "/sahayak",
    display: "standalone",
    background_color: "#071322",
    theme_color: "#F59E0B",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "ड्यूटी शुरू करें (Start Duty)",
        short_name: "ड्यूटी",
        url: "/sahayak",
      },
      {
        name: "आज की कमाई (Daily Earnings)",
        short_name: "कमाई",
        url: "/sahayak#earnings",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
