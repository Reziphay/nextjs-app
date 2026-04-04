import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HomePage } from "@/components/home/home-page";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { getDefaultAppRouteForUserType } from "@/lib/app-routes";
import { getApiBaseUrl } from "@/lib/api";
import { getServerAuthenticatedUser } from "@/lib/protected-route";

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value;

  if (accessToken) {
    const user = await getServerAuthenticatedUser();

    if (user) {
      redirect(getDefaultAppRouteForUserType(user.type));
    }
  }

  const locale = await getServerLocale();
  const apiBaseUrl = getApiBaseUrl();
  const messages = getMessages(locale);

  return (
    <LocaleProvider initialLocale={locale}>
      <HomePage apiBaseUrl={apiBaseUrl} messages={messages} />
    </LocaleProvider>
  );
}
