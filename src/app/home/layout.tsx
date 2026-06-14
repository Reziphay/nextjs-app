import type { ReactNode } from "react";
import { ProtectedAppLayoutTemplate } from "@/components/templates/protected-app-layout/protected-app-layout";
import { getServerLocale } from "@/i18n/server";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <ProtectedAppLayoutTemplate locale={locale} contentVariant="full">
      {children}
    </ProtectedAppLayoutTemplate>
  );
}
