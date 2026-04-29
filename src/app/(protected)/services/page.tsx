import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { buildPageTitle } from "@/lib/page-metadata";
import { fetchMyServices, fetchServiceById, fetchServiceCategories } from "@/lib/services-api";
import { fetchMyBrands, fetchBrandById } from "@/lib/brands-api";
import { ServicesUsoPage } from "@/components/organisms/services-uso-page";
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

  if (user.type !== "uso") {
    redirect("/brands");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  const [services, brands, serviceCategories] = await Promise.all([
    fetchMyServices(accessToken).catch(() => []),
    fetchMyBrands(accessToken).catch(() => []),
    fetchServiceCategories(accessToken).catch(() => []),
  ]);

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
