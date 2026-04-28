import type { Metadata } from "next";
import { AuthLayoutTemplate, ComingSoonPanel } from "@/components";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.navigation.aboutUs,
  };
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return (
    <LocaleProvider initialLocale={locale}>
      <AuthLayoutTemplate>
        <ComingSoonPanel
          badge={messages.comingSoon.badge}
          description={messages.comingSoon.description}
          title={messages.navigation.aboutUs}
        />
      </AuthLayoutTemplate>
    </LocaleProvider>
  );
}
