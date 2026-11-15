import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "संगवारी साथी — SECR Sahayak Partner App",
  description: "Official Porter & Sahayak duty portal for SECR Bilaspur, Raipur, and Durg Junction.",
  manifest: "/manifest-sahayak.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "संगवारी साथी",
  },
};

export default function SahayakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
