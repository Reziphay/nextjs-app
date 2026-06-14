import type { Metadata } from "next";
import { cookies } from "next/headers";
import { UcrSearchPage } from "@/components/organisms/ucr-search-page";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { fetchMarketplaceFacets } from "@/lib/marketplace-api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.dashboard.search,
  };
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  await requireProtectedRouteAccess("/search", resolvedParams);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";
  const facets = await fetchMarketplaceFacets(accessToken).catch(() => ({
    service_categories: [],
    brand_categories: [],
  }));

  return (
    <UcrSearchPage
      accessToken={accessToken}
      initialQuery={getStringParam(resolvedParams, "query") ?? getStringParam(resolvedParams, "queary") ?? ""}
      facets={facets}
    />
  );
}
