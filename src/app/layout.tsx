import type { Metadata, Viewport } from "next";
import { Fraunces, Sora } from "next/font/google";

import { siteConfig } from "@/config/site";

import { AnalyticsProvider } from "@/components/providers/analytics-provider";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans-family",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f3efe6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${sora.variable} ${fraunces.variable}`} lang="en">
      <body className="bg-background text-foreground antialiased">
        <a
          className="sr-only absolute left-4 top-4 z-50 rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground focus:not-sr-only"
          href="#main-content"
        >
          Skip to content
        </a>
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
