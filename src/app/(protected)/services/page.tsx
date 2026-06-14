import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { buildPageTitle } from "@/lib/page-metadata";
import { fetchMyServices, fetchPublicServicesPage, fetchServiceById, fetchServiceCategories } from "@/lib/services-api";
import { fetchMyBrands, fetchBrandById, fetchActiveBrands } from "@/lib/brands-api";
import { fetchMarketplaceFacets } from "@/lib/marketplace-api";
import { fetchUserProfileById } from "@/lib/users-api";
import { ServicesUsoPage } from "@/components/organisms/services-uso-page";
import { UcrServicesPage } from "@/components/organisms/ucr-services-page";
import { PublicServiceDetail } from "@/components/organisms/public-service-detail";
import { requireProtectedRouteAccess } from "@/lib/protected-route";

type ServicesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

async function fetchDetailedBrandsForServices(
  serviceOwnerId: string,
  accessToken: string,
): Promise<Awaited<ReturnType<typeof fetchActiveBrands>>> {
  const brands = await fetchActiveBrands(accessToken).catch(() => []);
  const relevantBrands = brands.filter((brand) => brand.owner_id === serviceOwnerId);

  return Promise.all(
    relevantBrands.map(async (brand) => {
      const detailed = await fetchBrandById(brand.id, accessToken).catch(() => null);
      return detailed ?? brand;
    }),
  );
}

async function fetchServiceOwnersById(
  services: Awaited<ReturnType<typeof fetchPublicServicesPage>>["services"],
  accessToken: string,
) {
  const ownerIds = [...new Set(services.map((service) => service.owner_id).filter(Boolean))];
  const ownerEntries = await Promise.all(
    ownerIds.map(async (ownerId) => {
      const owner = await fetchUserProfileById(ownerId, accessToken);
      return owner ? ([ownerId, owner] as const) : null;
    }),
  );

  return Object.fromEntries(ownerEntries.filter((entry): entry is NonNullable<typeof entry> => entry !== null));
}

export async function generateMetadata({
  searchParams,
}: ServicesPageProps): Promise<Metadata> {
  const [locale, resolvedParams, cookieStore] = await Promise.all([
    getServerLocale(),
    searchParams ?? Promise.resolve({}),
    cookies(),
  ]);
  const messages = getMessages(locale);
  const serviceId = getStringParam(resolvedParams, "id");

  if (serviceId) {
    const accessToken = cookieStore.get("rzp_at")?.value;
    const service = await fetchServiceById(serviceId, accessToken).catch(() => null);

    return {
      title: buildPageTitle(messages.dashboard.services, service?.title),
    };
  }

  return {
    title: messages.dashboard.services,
  };
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const user = await requireProtectedRouteAccess("/services", resolvedParams);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  if (user.type === "ucr") {
    const serviceId = getStringParam(resolvedParams, "id");
    const activeServiceCategoryId =
      getStringParam(resolvedParams, "category") ??
      getStringParam(resolvedParams, "service_category_id");

    if (!serviceId) {
      const [servicesPage, brands, marketplaceFacets] = await Promise.all([
        fetchPublicServicesPage(
          {
            page: 1,
            limit: 24,
            ...(activeServiceCategoryId && { service_category_id: activeServiceCategoryId }),
          },
          accessToken,
        ).catch(() => ({
          services: [],
          meta: { page: 1, limit: 24, total_count: 0, has_more: false },
        })),
        fetchActiveBrands(accessToken).catch(() => []),
        fetchMarketplaceFacets(accessToken).catch(() => ({
          service_categories: [],
          brand_categories: [],
        })),
      ]);
      const ownersById = await fetchServiceOwnersById(servicesPage.services, accessToken);

      return (
        <UcrServicesPage
          key={activeServiceCategoryId ?? "all"}
          accessToken={accessToken}
          initialServices={servicesPage.services}
          initialMeta={servicesPage.meta}
          brands={brands}
          ownersById={ownersById}
          serviceCategories={marketplaceFacets.service_categories}
          activeServiceCategoryId={activeServiceCategoryId}
        />
      );
    }

    const service = await fetchServiceById(serviceId, accessToken).catch(() => null);

    if (!service || service.status !== "ACTIVE") {
      redirect("/home");
    }

    const [brands, owner] = await Promise.all([
      fetchDetailedBrandsForServices(service.owner_id, accessToken),
      fetchUserProfileById(service.owner_id, accessToken),
    ]);

    if (!owner) {
      redirect("/home");
    }

    return (
      <PublicServiceDetail
        service={service}
        brands={brands}
        user={{
          id: owner.id,
          email: owner.email,
          type: owner.type,
          first_name: owner.first_name,
          last_name: owner.last_name,
          email_verified: false,
          avatar_url: owner.avatar_url ?? null,
        }}
      />
    );
  }

  if (user.type !== "uso") {
    redirect("/brands");
  }

  const serviceId = getStringParam(resolvedParams, "id");

  const [myServices, serviceFromUrl, brands, serviceCategories] = await Promise.all([
    fetchMyServices(accessToken).catch(() => []),
    serviceId ? fetchServiceById(serviceId, accessToken).catch(() => null) : null,
    fetchMyBrands(accessToken).catch(() => []),
    fetchServiceCategories(accessToken).catch(() => []),
  ]);

  const services =
    serviceFromUrl && !myServices.some((service) => service.id === serviceFromUrl.id)
      ? [serviceFromUrl, ...myServices]
      : myServices;

  // Fetch detailed brand info (with branches) for the service form branch selector
  const detailedBrands = await Promise.all(
    brands.map(async (brand) => {
      const detailed = await fetchBrandById(brand.id, accessToken).catch(() => null);
      return detailed ?? brand;
    }),
  );

  return (
    <ServicesUsoPage
      services={services}
      brands={detailedBrands}
      accessToken={accessToken}
      serviceCategories={serviceCategories}
      user={user}
    />
  );
}
