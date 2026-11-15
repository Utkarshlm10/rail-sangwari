import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SECR Central Database & System Manager — Rail Sangwari",
  description: "Official administrative data dashboard to manage bookings, coolie roster, and PNR registry.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
