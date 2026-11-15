import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SECR Supervisor & DRM Portal — Rail Sangwari",
  description:
    "Official station audit, porter deployment, and tariff ledger portal for South East Central Railway (Bilaspur, Raipur, Durg).",
};

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
