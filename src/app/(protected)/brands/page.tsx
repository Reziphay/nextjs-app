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
  fetchBrandTeamWorkspace,
} from "@/lib/brands-api";
import { BrandsUsoPage } from "@/components/organisms/brands-uso-page";
import { BrandsUcrPage } from "@/components/organisms/brands-ucr-page";
import { BrandDetail } from "@/components/organisms/brand-detail";
import { BrandForm } from "@/components/organisms/brand-form";
import { BrandTeamWorkspace } from "@/components/organisms/brand-team-workspace";
import { fetchUserProfileById } from "@/lib/users-api";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import type { Brand, PublicUserProfile } from "@/types";

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

async function fetchBrandOwnersById(
  brands: Brand[],
  accessToken: string,
): Promise<Record<string, PublicUserProfile>> {
  const ownerIds = [...new Set(brands.map((brand) => brand.owner_id).filter(Boolean))];

  if (ownerIds.length === 0) {
    return {};
  }

  const ownerEntries = await Promise.all(
    ownerIds.map(async (ownerId) => {
      const owner = await fetchUserProfileById(ownerId, accessToken);
      return owner ? ([ownerId, owner] as const) : null;
    }),
  );

  return Object.fromEntries(
    ownerEntries.filter(
      (
        entry,
      ): entry is readonly [string, PublicUserProfile] => entry !== null,
    ),
  );
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

    const owner = await fetchUserProfileById(brand.owner_id, accessToken);

    return <BrandDetail brand={brand} currentUserId={user.id} owner={owner} />;
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

  // ── Team workspace (?progress=team&id=<id>) — USO owner only ─────────────
  if (progress === "team" && brandId) {
    if (user.type !== "uso") return notFound();

    const [brand, workspace] = await Promise.all([
      fetchBrandById(brandId, accessToken).catch(() => null),
      fetchBrandTeamWorkspace(brandId, accessToken).catch(() => null),
    ]);

    if (!brand) return notFound();
    if (brand.owner_id !== user.id) return notFound();

    return (
      <BrandTeamWorkspace
        key={brand.id}
        brand={brand}
        initialWorkspace={workspace}
        currentUser={{
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar_url: user.avatar_url ?? null,
        }}
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
  const ownersById = await fetchBrandOwnersById(brands, accessToken);

  return <BrandsUcrPage brands={brands} ownersById={ownersById} />;
}
