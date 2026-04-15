import { cookies } from "next/headers";
import { ServicesStrategyPage } from "@/components/organisms/services-strategy-page";
import { fetchBrandById, fetchMyBrands } from "@/lib/brands-api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";

type ServicesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  await requireProtectedRouteAccess("/services", searchParams);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";
  const brands = await fetchMyBrands(accessToken).catch(() => []);
  const detailedBrands = await Promise.all(
    brands.map(async (brand) => {
      const detailedBrand = await fetchBrandById(brand.id, accessToken).catch(
        () => null,
      );
      return detailedBrand ?? brand;
    }),
  );

  return <ServicesStrategyPage brands={detailedBrands} />;
}
