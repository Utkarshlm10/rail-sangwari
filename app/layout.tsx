import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { BookingProvider } from "@/context/BookingContext";
import { AuthProvider } from "@/context/AuthContext";
import { ClientAppShell } from "@/components/ClientAppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://railsangwari.in"),
  title: "Rail Sangwari (रेल संगवारी) — SECR Licensed Sahayak Porter Booking",
  description:
    "Book verified SECR railway porters (Sahayaks/Coolies) with official brass billa badges at Bilaspur Jn, Raipur Jn, and Durg Jn. Transparent government rates, live coach doorstep pickup.",
  applicationName: "Rail Sangwari",
  authors: [{ name: "Rail Sangwari Team" }],
  keywords: [
    "Rail Sangwari",
    "रेल संगवारी",
    "Coolie Booking",
    "Sahayak Booking",
    "Bilaspur Railway Station",
    "Raipur Railway Station",
    "Durg Railway Station",
    "SECR Porter",
    "Brass Billa",
    "Indian Railways Coolie",
  ],
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/icon.png", sizes: "192x192" },
    ],
    apple: [{ url: "/logo.png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rail Sangwari",
  },
  openGraph: {
    title: "Rail Sangwari (रेल संगवारी) — SECR Licensed Porter Booking",
    description:
      "Travel Light. Meet your licensed Sahayak right at your coach door across Bilaspur, Raipur, and Durg stations.",
    url: "https://railsangwari.in",
    siteName: "Rail Sangwari",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Rail Sangwari Brand Icon",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B2545",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-screen bg-[#F5F5F7] dark:bg-[#070E1A] text-[#1D1D1F] dark:text-[#F8FAFC] flex flex-col antialiased selection:bg-amber-200 dark:selection:bg-amber-500/30 selection:text-[#0B2545] dark:selection:text-amber-200">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <BookingProvider>
                <ClientAppShell>
                  {children}
                </ClientAppShell>
              </BookingProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
