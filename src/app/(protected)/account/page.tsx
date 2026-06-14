import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { UserProfilePanel } from "@/components/organisms";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { fetchAccountBrands } from "@/lib/brands-api";
import { buildPageTitle } from "@/lib/page-metadata";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { fetchPublicServices } from "@/lib/services-api";
import { fetchUserProfileById } from "@/lib/users-api";

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function generateMetadata({
  searchParams,
}: AccountPageProps): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedUserId = getSearchParamValue(resolvedSearchParams.id)?.trim();

  if (requestedUserId) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("rzp_at")?.value;
    const targetUser = accessToken
      ? await fetchUserProfileById(requestedUserId, accessToken).catch(() => null)
      : null;
    const fullName = targetUser
      ? `${targetUser.first_name} ${targetUser.last_name}`.trim()
      : null;

    return {
      title: buildPageTitle(messages.dashboard.profile, fullName),
    };
  }

  return {
    title: messages.dashboard.account,
  };
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await requireProtectedRouteAccess("/account", searchParams);
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedUserId = getSearchParamValue(resolvedSearchParams.id)?.trim();

  if (!requestedUserId || requestedUserId === user.id) {
    return <UserProfilePanel user={user} canEdit />;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value;

  if (!accessToken) {
    redirect("/auth/login");
  }

  const targetUser = await fetchUserProfileById(requestedUserId, accessToken);

  if (!targetUser) {
    notFound();
  }

  const [brands, services] = await Promise.all([
    fetchAccountBrands(requestedUserId, accessToken).catch(() => []),
    fetchPublicServices(
      { owner_id: requestedUserId, direct_only: true },
      accessToken,
    ).catch(() => []),
  ]);

  return <UserProfilePanel user={targetUser} brands={brands} services={services} />;
}
