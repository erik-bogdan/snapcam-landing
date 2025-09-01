import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GoogleTagManager } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { Analytics } from "@vercel/analytics/next"

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
  manifest: "/images/favico/site.webmanifest",
  icons: {
    icon: [
      { url: "/images/favico/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favico/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    apple: [
      { url: "/images/favico/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: [
      { url: "/favicon.ico" }
    ]
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://snapcam.hu"),
  openGraph: {
    title: "SnapCam - Forradalmi Képmegosztás",
    description:
      "Magyarország első interaktív platformja, ahol az emlékek élnek",
    url: "/",
    siteName: "SnapCam",
    type: "website",
    locale: "hu_HU",
    images: [
      {
        url: "/ogimg.png",
        width: 1200,
        height: 630,
        alt: "SnapCam - Forradalmi Képmegosztás",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapCam - Forradalmi Képmegosztás",
    description:
      "Magyarország első interaktív platformja, ahol az emlékek élnek",
    images: ["/ogimg.png"],
  },
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
        <Analytics/>
      </body>
    </html>
  );
}
