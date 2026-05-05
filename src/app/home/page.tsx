import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import {
  fetchMyServices,
  fetchPublicServices,
} from "@/lib/services-api";
import { fetchActiveBrands, fetchMyBrands } from "@/lib/brands-api";
import { emptyFavorites, fetchFavorites } from "@/lib/favorites-api";
import { EMPTY_MARKETPLACE_HOME, fetchMarketplaceFacets, fetchMarketplaceHome } from "@/lib/marketplace-api";
import { fetchUserProfileById } from "@/lib/users-api";
import { UsoCalendarPage } from "@/components/organisms/uso-calendar-page";
import { UcrMarketplacePage } from "@/components/organisms/ucr-marketplace-page";
import type { Brand, PublicUserProfile } from "@/types";
import type { Service } from "@/types/service";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

async function fetchMarketplaceOwnersById(
  brands: Brand[],
  services: Service[],
  accessToken: string,
): Promise<Record<string, PublicUserProfile>> {
  const ownerIds = [
    ...new Set(
      [
        ...brands.map((brand) => brand.owner_id),
        ...services.map((service) => service.owner_id),
      ].filter(Boolean),
    ),
  ];

  if (ownerIds.length === 0) return {};

  const ownerEntries = await Promise.all(
    ownerIds.map(async (ownerId) => {
      const owner = await fetchUserProfileById(ownerId, accessToken);
      return owner ? ([ownerId, owner] as const) : null;
    }),
  );

  return Object.fromEntries(
    ownerEntries.filter(
      (entry): entry is readonly [string, PublicUserProfile] => entry !== null,
    ),
  );
}

export default async function HomeDashboardPage({ searchParams }: HomePageProps) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const user = await requireProtectedRouteAccess("/home", resolvedParams);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  if (user.type === "ucr") {
    const activeServiceCategoryId = getSingleParam(resolvedParams, "service_category_id");
    const activeBrandCategoryId = getSingleParam(resolvedParams, "brand_category_id");
    const serviceFilters = activeServiceCategoryId
      ? { service_category_id: activeServiceCategoryId, limit: 120 }
      : { limit: 120 };
    const brandFilters = activeBrandCategoryId
      ? { brand_category_id: activeBrandCategoryId }
      : {};

    const [marketplaceHome, marketplaceFacets, favorites] = await Promise.all([
      fetchMarketplaceHome(accessToken).catch(() => EMPTY_MARKETPLACE_HOME),
      fetchMarketplaceFacets(accessToken).catch(() => ({
        service_categories: [],
        brand_categories: [],
      })),
      fetchFavorites(accessToken).catch(() => emptyFavorites()),
    ]);
    const services = activeServiceCategoryId
      ? await fetchPublicServices(serviceFilters, accessToken).catch(() => [])
      : marketplaceHome.random_services;
    const brands = activeBrandCategoryId
      ? await fetchActiveBrands(accessToken, brandFilters).catch(() => [])
      : marketplaceHome.recent_brands;
    const ownersById = await fetchMarketplaceOwnersById(
      [
        ...brands,
        ...marketplaceHome.recent_brands,
        ...marketplaceHome.recommended_brands,
        ...marketplaceHome.top_rated_brands,
        ...favorites.brands,
        ...favorites.service_brands,
      ],
      [
        ...services,
        ...marketplaceHome.random_services,
        ...marketplaceHome.smart_services,
        ...marketplaceHome.recent_services,
        ...marketplaceHome.recommended_services,
        ...marketplaceHome.top_rated_services,
        ...favorites.services,
      ],
      accessToken,
    );

    return (
      <UcrMarketplacePage
        user={user}
        accessToken={accessToken}
        services={services}
        brands={brands}
        marketplaceHome={marketplaceHome}
        favoriteServices={favorites.services}
        favoriteBrands={favorites.brands}
        favoriteServiceBrands={favorites.service_brands}
        favoriteServiceIds={favorites.service_ids}
        favoriteBrandIds={favorites.brand_ids}
        serviceCategories={marketplaceFacets.service_categories}
        brandCategories={marketplaceFacets.brand_categories}
        ownersById={ownersById}
        activeServiceCategoryId={activeServiceCategoryId}
        activeBrandCategoryId={activeBrandCategoryId}
      />
    );
  }

  if (user.type !== "uso") {
    redirect("/dashboard");
  }

  const [services, brands] = await Promise.all([
    fetchMyServices(accessToken).catch(() => []),
    fetchMyBrands(accessToken).catch(() => []),
  ]);

  return (
    <UsoCalendarPage
      services={services}
      brands={brands}
    />
  );
}
