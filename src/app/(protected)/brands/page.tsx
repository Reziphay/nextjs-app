import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AccountBrandsSection } from "@/components/organisms/account-brands-section/account-brands-section";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import {
  fetchMyBrands,
  fetchBrandById,
  fetchActiveBrands,
  fetchAccountBrands,
  fetchBrandCategories,
} from "@/lib/brands-api";
import { BrandsUsoPage } from "@/components/organisms/brands-uso-page";
import { BrandsUcrPage } from "@/components/organisms/brands-ucr-page";
import { BrandDetail } from "@/components/organisms/brand-detail";
import { BrandForm } from "@/components/organisms/brand-form";
import { fetchUserProfileById } from "@/lib/users-api";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";

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
  const accountUserId = getStringParam(resolvedParams, "account");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  if (accountUserId && accountUserId !== user.id && !progress && !brandId) {
    const [targetUser, brands, locale] = await Promise.all([
      fetchUserProfileById(accountUserId, accessToken),
      fetchAccountBrands(accountUserId, accessToken).catch(() => []),
      getServerLocale(),
    ]);

    if (!targetUser) {
      return notFound();
    }

    const messages = getMessages(locale);
    const fullName = `${targetUser.first_name} ${targetUser.last_name}`.trim();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--app-border-soft)",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "var(--app-text-strong)",
              fontSize: "var(--font-size-large)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
            }}
          >
            {fullName}
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--app-text-muted)",
              fontSize: "var(--font-size-small)",
              lineHeight: 1.6,
            }}
          >
            {messages.profile.brandsSectionDescription}
          </p>
        </div>

        <AccountBrandsSection
          brands={brands}
          owner={targetUser}
          title={messages.profile.brandsSectionTitle}
          emptyTitle={messages.profile.brandsEmptyTitle}
          emptyDescription={messages.profile.brandsEmptyDescription}
        />
      </div>
    );
  }

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

  // ── Create brand form (?progress=create) — USO only ──────────────────────
  if (progress === "create") {
    if (user.type !== "uso") return notFound();
    const categories = await fetchBrandCategories(accessToken).catch(() => []);
    return (
      <BrandForm
        mode="create"
        categories={categories}
        emailVerified={user.email_verified}
        phoneVerified={user.phone_verified}
      />
    );
  }

  // ── Edit brand form (?progress=edit&id=<id>) — USO owner only ────────────
  if (progress === "edit" && brandId) {
    if (user.type !== "uso") return notFound();

    const [brand, categories] = await Promise.all([
      fetchBrandById(brandId, accessToken).catch(() => null),
      fetchBrandCategories(accessToken).catch(() => []),
    ]);

    if (!brand) return notFound();
    if (brand.owner_id !== user.id) return notFound();

    return (
      <BrandForm
        mode="edit"
        brand={brand}
        categories={categories}
        emailVerified={user.email_verified}
        phoneVerified={user.phone_verified}
      />
    );
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
