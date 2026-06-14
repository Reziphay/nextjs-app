import type { Metadata } from "next";
import { AuthRegisterPanel } from "@/components";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { redirectAuthenticatedUserFromAuthRoute } from "@/lib/protected-route";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.auth.register.title,
  };
}

export default async function RegisterPage() {
  await redirectAuthenticatedUserFromAuthRoute();

  return <AuthRegisterPanel />;
}
