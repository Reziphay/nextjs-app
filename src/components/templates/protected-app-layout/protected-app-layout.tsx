import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { DashboardLayoutTemplate } from "@/components/templates/dashboard-layout";

type ProtectedAppLayoutTemplateProps = {
  children: ReactNode;
  locale: Locale;
};

export function ProtectedAppLayoutTemplate({
  children,
  locale,
}: ProtectedAppLayoutTemplateProps) {
  return (
    <LocaleProvider initialLocale={locale}>
      <DashboardLayoutTemplate>{children}</DashboardLayoutTemplate>
    </LocaleProvider>
  );
}
