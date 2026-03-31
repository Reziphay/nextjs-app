import type { ReactNode } from "react";
import { DashboardLayoutTemplate } from "@/components/templates";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getServerLocale } from "@/i18n/server";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <LocaleProvider initialLocale={locale}>
      <DashboardLayoutTemplate>{children}</DashboardLayoutTemplate>
    </LocaleProvider>
  );
}
