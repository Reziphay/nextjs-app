import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { DashboardLayoutTemplate } from "@/components/templates/dashboard-layout";
import type { ContentVariant } from "@/components/templates/dashboard-layout/dashboard-shell";

type ProtectedAppLayoutTemplateProps = {
  children: ReactNode;
  locale: Locale;
  contentVariant?: ContentVariant;
};

export function ProtectedAppLayoutTemplate({
  children,
  locale,
  contentVariant,
}: ProtectedAppLayoutTemplateProps) {
  return (
    <LocaleProvider initialLocale={locale}>
      <DashboardLayoutTemplate contentVariant={contentVariant}>{children}</DashboardLayoutTemplate>
    </LocaleProvider>
  );
}
