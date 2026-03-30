import type { Metadata } from "next";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { lightThemeStyle } from "@/theme/light-theme";
import "./globals.css";

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
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      data-theme="light"
      style={lightThemeStyle}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
