import Analytics from "@/components/Analytics";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iftar Countdown",
  description: "Know exactly when to break your fast based on your location",
  metadataBase: new URL("https://iftar.mustafagomaa.com"),
  authors: [{ name: "Iftar Countdown App" }],
  keywords: ["iftar", "ramadan", "countdown", "prayer times", "fasting"],
  openGraph: {
    title: "Iftar Countdown",
    description: "Know exactly when to break your fast based on your location",
    url: "https://iftar.mustafagomaa.com",
    siteName: "Iftar Countdown",
    images: [
      {
        url: "https://iftar.mustafagomaa.com/og-image-simple.jpg",
        width: 1200,
        height: 630,
        alt: "Iftar Countdown App Preview",
        type: "image/jpeg",
      },
      {
        url: "https://iftar.mustafagomaa.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Iftar Countdown App Preview",
        type: "image/jpeg",
      },
      {
        url: "https://iftar.mustafagomaa.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Iftar Countdown App Preview",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Iftar Countdown",
    description: "Know exactly when to break your fast based on your location",
    images: ["https://iftar.mustafagomaa.com/og-image-simple.jpg"],
    creator: "@iftarcountdown",
    site: "@iftarcountdown",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  other: {
    "facebook-domain-verification": "your-verification-code",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          property="og:image"
          content="https://iftar.mustafagomaa.com/og-image-simple.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta
          name="twitter:image"
          content="https://iftar.mustafagomaa.com/og-image-simple.jpg"
        />
        <meta name="twitter:image:alt" content="Iftar Countdown App Preview" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
