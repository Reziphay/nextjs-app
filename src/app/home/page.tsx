import type { Metadata } from "next";
import { HomeDashboardPanel } from "@/components/organisms/home-dashboard-panel";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  return { title: messages.dashboard.home };
}

export default async function HomeDashboardPage() {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return <HomeDashboardPanel messages={messages} />;
}
