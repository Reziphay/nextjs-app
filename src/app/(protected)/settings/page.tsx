import type { Metadata } from "next";
import { AuthSecuritySettingsPanel } from "@/components/organisms/auth-security-settings-panel/auth-security-settings-panel";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { requireProtectedRouteAccess } from "@/lib/protected-route";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.dashboard.settings,
  };
}

export default async function SettingsPage() {
  await requireProtectedRouteAccess("/settings");

  return <AuthSecuritySettingsPanel />;
}
