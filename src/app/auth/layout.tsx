import type { ReactNode } from "react";
import { AuthLayoutTemplate } from "@/components";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getServerLocale } from "@/i18n/server";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <LocaleProvider initialLocale={locale}>
      <AuthLayoutTemplate>{children}</AuthLayoutTemplate>
    </LocaleProvider>
  );
}
