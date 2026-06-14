import type { Metadata } from "next";
import { ProtectedComingSoonRoute } from "@/components/organisms/protected-coming-soon-route";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.dashboard.reservations,
  };
}

export default function RezervationsPage() {
  return <ProtectedComingSoonRoute path="/rezervations" />;
}
