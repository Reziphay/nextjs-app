import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UcrFavoritesPage } from "@/components/organisms/ucr-favorites-page";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { fetchFavorites } from "@/lib/favorites-api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { fetchUserProfileById } from "@/lib/users-api";
import type { Brand, PublicUserProfile } from "@/types";
import type { Service } from "@/types/service";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.dashboard.favorites,
  };
}

type FavoritesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function fetchOwnersById(
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

  const entries = await Promise.all(
    ownerIds.map(async (ownerId) => {
      const owner = await fetchUserProfileById(ownerId, accessToken);
      return owner ? ([ownerId, owner] as const) : null;
    }),
  );

  return Object.fromEntries(
    entries.filter(
      (entry): entry is readonly [string, PublicUserProfile] => entry !== null,
    ),
  );
}

export const dynamic = "force-dynamic";

export default async function FavoritesPage({ searchParams }: FavoritesPageProps) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const user = await requireProtectedRouteAccess("/favorites", resolvedParams);

  if (user.type !== "ucr") {
    redirect("/home");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";
  const favorites = await fetchFavorites(accessToken).catch(() => ({
    brands: [],
    services: [],
    service_brands: [],
    brand_ids: [],
    service_ids: [],
  }));
  const ownersById = await fetchOwnersById(
    [...favorites.brands, ...favorites.service_brands],
    favorites.services,
    accessToken,
  );

  return (
    <UcrFavoritesPage
      user={user}
      accessToken={accessToken}
      services={favorites.services}
      brands={favorites.brands}
      serviceBrands={favorites.service_brands}
      ownersById={ownersById}
    />
  );
}
