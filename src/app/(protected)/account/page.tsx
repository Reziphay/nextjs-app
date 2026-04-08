import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { UserProfilePanel } from "@/components/organisms";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { fetchAccountBrands } from "@/lib/brands-api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

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

  const brands = await fetchAccountBrands(requestedUserId, accessToken).catch(() => []);

  return <UserProfilePanel user={targetUser} brands={brands} />;
}
