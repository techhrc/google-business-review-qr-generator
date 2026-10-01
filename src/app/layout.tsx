import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex, Roboto, Roboto_Mono } from "next/font/google";
import { CornersInit } from "@/components/Squircle";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://googlereviewqr.vercel.app";
const SITE_NAME = "Google Review QR";

const googleSans = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans",
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Free Google Review QR Code Generator | No Sign-Up",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Create a free QR code for your Google reviews in seconds. Search your business by name or paste your Google Maps link — no sign-up, no cost, no watermark. Includes print-ready review templates.",
  keywords: [
    "google review qr code generator",
    "free google review qr code",
    "qr code for google reviews",
    "google business review qr code",
    "create qr code for google reviews",
    "google review link qr code",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: "Free Google Review QR Code Generator | No Sign-Up",
    description:
      "Find your business by name or paste your Google Maps link — get a free QR code for your Google reviews plus print-ready templates. No account needed.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Google Review QR Code Generator | No Sign-Up",
    description:
      "Create a free QR code for your Google reviews in seconds. No sign-up, no cost, print-ready templates included.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${roboto.variable} ${robotoMono.variable}`}
    >
      <body className="bg-white font-sans text-ink antialiased">
        <CornersInit />
        {children}
      </body>
    </html>
  );
}
