import { HomePage } from "@/components/home/home-page";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getServerLocale } from "@/i18n/server";
import { getApiBaseUrl } from "@/lib/api";

export default async function Page() {
  const locale = await getServerLocale();
  const apiBaseUrl = getApiBaseUrl();

  return (
    <LocaleProvider initialLocale={locale}>
      <HomePage apiBaseUrl={apiBaseUrl} />
    </LocaleProvider>
  );
}
