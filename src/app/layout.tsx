import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GoogleTagManager } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/ui/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapCam - Forradalmi Képmegosztás",
  description: "Magyarország első interaktív platformja, ahol az emlékek élnek",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const consentRaw = cookieStore.get("cookie-consent")?.value;
  let analyticsEnabled = false;
  if (consentRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(consentRaw));
      analyticsEnabled = Boolean(parsed?.analytics);
    } catch {
      analyticsEnabled = false;
    }
  }

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-XYZ";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {analyticsEnabled && gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
