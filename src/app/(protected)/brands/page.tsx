import { cookies } from "next/headers";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import {
  fetchMyBrands,
  fetchBrandById,
  fetchActiveBrands,
  fetchBrandCategories,
} from "@/lib/brands-api";
import { BrandsUsoPage } from "@/components/organisms/brands-uso-page";
import { BrandsUcrPage } from "@/components/organisms/brands-ucr-page";
import { BrandDetail } from "@/components/organisms/brand-detail";
import { BrandForm } from "@/components/organisms/brand-form";

type BrandsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const user = await requireProtectedRouteAccess("/brands", resolvedParams);

  const progress = getStringParam(resolvedParams, "progress");
  const brandId = getStringParam(resolvedParams, "id");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  // ── Brand detail view (?id=<brand_id>) ────────────────────────────────────
  if (brandId && !progress) {
    const brand = await fetchBrandById(brandId, accessToken).catch(() => null);

    if (!brand) {
      return (
        <div style={{ padding: "2rem", color: "var(--app-text-muted)", fontSize: "var(--font-size-small)" }}>
          Brand not found.
        </div>
      );
    }

    return <BrandDetail brand={brand} currentUserId={user.id} />;
  }

  // ── Create brand form (?progress=create) ──────────────────────────────────
  if (progress === "create") {
    const categories = await fetchBrandCategories(accessToken).catch(() => []);
    return <BrandForm mode="create" categories={categories} />;
  }

  // ── Edit brand form (?progress=edit&id=<id>) ──────────────────────────────
  if (progress === "edit" && brandId) {
    const [brand, categories] = await Promise.all([
      fetchBrandById(brandId, accessToken).catch(() => null),
      fetchBrandCategories(accessToken).catch(() => []),
    ]);

    if (!brand) {
      return (
        <div style={{ padding: "2rem", color: "var(--app-text-muted)", fontSize: "var(--font-size-small)" }}>
          Brand not found.
        </div>
      );
    }

    return <BrandForm mode="edit" brand={brand} categories={categories} />;
  }

  // ── USO default view: my brands ───────────────────────────────────────────
  if (user.type === "uso") {
    const brands = await fetchMyBrands(accessToken).catch(() => []);
    return <BrandsUsoPage brands={brands} currentUserId={user.id} />;
  }

  // ── UCR default view (should only land here with ?id, handled above) ───────
  // Fallback: show the active brands gallery
  const brands = await fetchActiveBrands(accessToken).catch(() => []);
  return <BrandsUcrPage brands={brands} />;
}
