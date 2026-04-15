import type { Metadata, Viewport } from "next";
import { getLocaleDirection, getMessages } from "@/i18n/config";
import { StoreProvider } from "@/components/providers/store-provider";
import { getServerLocale } from "@/i18n/server";
import { lightThemeStyle } from "@/theme/light-theme";
import { fontLinks, typographyStyle } from "@/theme/typography";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const FAVICON_URL = "/reziphay-logo-default.svg";
const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    applicationName: "Reziphay Next App",
    title: {
      default: "Reziphay Next App",
      template: "%s | Reziphay Next App",
    },
    description: messages.metadata.description,
    authors: [{ name: "Vugar Safarzada" }],
    icons: {
      icon: [{ url: FAVICON_URL, type: "image/svg+xml", sizes: "any" }],
      shortcut: FAVICON_URL,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
      data-theme="light"
      style={{ ...lightThemeStyle, ...typographyStyle }}
      suppressHydrationWarning className={cn("font-sans", geist.variable)}
    >
      <head>
        {fontLinks.map((link) => (
          <link
            key={`${link.rel}-${link.href}`}
            rel={link.rel}
            href={link.href}
            crossOrigin={link.crossOrigin}
          />
        ))}
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
