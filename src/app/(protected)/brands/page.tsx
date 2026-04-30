import type { Metadata } from "next";
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
import { fetchPublicServices } from "@/lib/services-api";
import { fetchBrandForReview } from "@/lib/moderation-api";
import { BrandsUsoPage } from "@/components/organisms/brands-uso-page";
import { BrandsUcrPage } from "@/components/organisms/brands-ucr-page";
import { BrandDetail } from "@/components/organisms/brand-detail";
import { BrandForm } from "@/components/organisms/brand-form";
import { BrandTeamWorkspace } from "@/components/organisms/brand-team-workspace";
import { fetchUserProfileById } from "@/lib/users-api";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { buildPageTitle } from "@/lib/page-metadata";
import type { Brand, BrandStatus, PublicUserProfile } from "@/types";
import type { ModerationBrandDetail } from "@/types/moderation";

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

function mapModerationBrandToBrand(brand: ModerationBrandDetail): Brand {
  return {
    id: brand.id,
    name: brand.name,
    description: brand.description ?? undefined,
    status: brand.status as BrandStatus,
    owner_id: brand.owner.id,
    logo_url: brand.logo_url ?? undefined,
    gallery: (brand.gallery ?? []).map((item, index) => ({
      id: `${brand.id}-gallery-${index}`,
      media_id: `${brand.id}-gallery-media-${index}`,
      url: item.url,
      order: item.order ?? index,
    })),
    branches: (brand.branches ?? []).map((branch) => ({
      id: branch.id,
      brand_id: brand.id,
      name: branch.name,
      description: branch.description ?? undefined,
      address1: branch.address1,
      address2: branch.address2 ?? undefined,
      phone: branch.phone ?? undefined,
      email: branch.email ?? undefined,
      is_24_7: branch.is_24_7 ?? false,
      opening: branch.opening ?? undefined,
      closing: branch.closing ?? undefined,
      breaks: [],
      cover_url: branch.cover_url ?? undefined,
    })),
    categories: brand.categories ?? [],
    rating: null,
    rating_count: 0,
    my_rating: null,
    created_at: brand.created_at,
    updated_at: brand.updated_at ?? brand.created_at,
  };
}

function mapModerationBrandOwnerToProfile(brand: ModerationBrandDetail): PublicUserProfile {
  return {
    id: brand.owner.id,
    first_name: brand.owner.first_name,
    last_name: brand.owner.last_name,
    email: brand.owner.email,
    type: "uso",
    avatar_url: brand.owner.avatar_url ?? null,
    created_at: brand.owner.created_at ?? brand.created_at,
    updated_at: brand.owner.created_at ?? brand.created_at,
  };
}

export async function generateMetadata({
  searchParams,
}: BrandsPageProps): Promise<Metadata> {
  const [locale, resolvedParams, cookieStore] = await Promise.all([
    getServerLocale(),
    searchParams ?? Promise.resolve({}),
    cookies(),
  ]);
  const messages = getMessages(locale);
  const progress = getStringParam(resolvedParams, "progress");
  const brandId = getStringParam(resolvedParams, "id");
  const accountUserId = getStringParam(resolvedParams, "account");
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  if (accountUserId && !progress && !brandId) {
    const targetUser = await fetchUserProfileById(accountUserId, accessToken).catch(() => null);
    const fullName = targetUser
      ? `${targetUser.first_name} ${targetUser.last_name}`.trim()
      : null;

    return {
      title: buildPageTitle(messages.profile.brandsSectionTitle, fullName),
    };
  }

  if (progress === "create") {
    return {
      title: buildPageTitle(messages.dashboard.brands, messages.brands.createBrand),
    };
  }

  if (brandId) {
    const brand = await fetchBrandById(brandId, accessToken).catch(() => null);

    if (progress === "edit") {
      return {
        title: buildPageTitle(messages.brands.editBrand, brand?.name),
      };
    }

    if (progress === "team") {
      return {
        title: buildPageTitle(messages.brands.teamWorkspace, brand?.name),
      };
    }

    return {
      title: buildPageTitle(messages.brands.detailTitle, brand?.name),
    };
  }

  return {
    title: messages.dashboard.brands,
  };
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
    if (user.type === "admin") {
      const moderationBrand = await fetchBrandForReview(brandId, accessToken).catch(() => null);

      if (!moderationBrand) {
        return (
          <div style={{ padding: "2rem", color: "var(--app-text-muted)", fontSize: "var(--font-size-small)" }}>
            Brand not found.
          </div>
        );
      }

      return (
        <BrandDetail
          brand={mapModerationBrandToBrand(moderationBrand)}
          currentUserId={user.id}
          owner={mapModerationBrandOwnerToProfile(moderationBrand)}
        />
      );
    }

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
  const [brands, featuredServices] = await Promise.all([
    fetchActiveBrands(accessToken).catch(() => []),
    fetchPublicServices({}, accessToken).catch(() => []),
  ]);
  const ownersById = await fetchBrandOwnersById(brands, accessToken);
  const activeServices = featuredServices.filter((s) => s.status === "ACTIVE");

  return <BrandsUcrPage brands={brands} ownersById={ownersById} featuredServices={activeServices} />;
}
