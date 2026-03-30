import { LocaleProvider } from "@/components/providers/locale-provider";
import { notFound } from "next/navigation";
import { ComponentLibraryPage } from "@/components";
import { getServerLocale } from "@/i18n/server";

export default async function LibPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const locale = await getServerLocale();

  return (
    <LocaleProvider initialLocale={locale}>
      <ComponentLibraryPage />
    </LocaleProvider>
  );
}
