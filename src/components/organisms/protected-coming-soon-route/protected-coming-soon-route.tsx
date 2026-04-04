import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { getProtectedRouteLabel, type ProtectedAppPath } from "@/lib/app-routes";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { ComingSoonPanel } from "@/components/organisms/coming-soon-panel";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type ProtectedComingSoonRouteProps = {
  path: ProtectedAppPath;
  searchParams?: SearchParamsRecord | Promise<SearchParamsRecord>;
};

export async function ProtectedComingSoonRoute({
  path,
  searchParams,
}: ProtectedComingSoonRouteProps) {
  await requireProtectedRouteAccess(path, searchParams);

  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return (
    <>
      {/* #TODO: Build this page */}
      <ComingSoonPanel
        title={getProtectedRouteLabel(messages, path)}
        badge={messages.comingSoon.badge}
        description={messages.comingSoon.description}
      />
    </>
  );
}
