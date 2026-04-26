import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { fetchMyServices, fetchServiceCategories } from "@/lib/services-api";
import { fetchMyBrands, fetchBrandById } from "@/lib/brands-api";
import { ServicesUsoPage } from "@/components/organisms/services-uso-page";
import { requireProtectedRouteAccess } from "@/lib/protected-route";

type ServicesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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
    />
  );
}
