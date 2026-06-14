import type { Metadata } from "next";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { AdminModerationWorkspace } from "@/components/organisms/admin-moderation-workspace";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.dashboard.moderation,
  };
}

export default async function ModerationPage() {
  await requireProtectedRouteAccess("/moderation");

  return <AdminModerationWorkspace />;
}
