import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rail Sangwari (रेल संगवारी) — SECR Licensed Sahayak Porter Booking",
    short_name: "Rail Sangwari",
    description:
      "Book licensed railway porters with official brass billa badges at Bilaspur Jn, Raipur Jn, and Durg Jn. Transparent government rates, live coach doorstep pickup.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5F7",
    theme_color: "#0B2545",
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
        name: "Book Sahayak",
        short_name: "Book",
        description: "Book a porter for your upcoming train journey",
        url: "/?action=book",
        icons: [{ src: "/icon.png", sizes: "96x96" }],
      },
      {
        name: "Verify Brass Billa",
        short_name: "Verify",
        description: "Verify coolie license and SECR approved rate card",
        url: "/verify-billa",
        icons: [{ src: "/icon.png", sizes: "96x96" }],
      },
      {
        name: "Sahayak Portal",
        short_name: "Sahayak Login",
        description: "For registered railway porters & station munshis",
        url: "/sahayak",
        icons: [{ src: "/icon.png", sizes: "96x96" }],
      },
    ],
  };
}
