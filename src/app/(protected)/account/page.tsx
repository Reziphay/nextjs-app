import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { UserProfilePanel } from "@/components/organisms";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { getApiBaseUrl } from "@/lib/api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import type {
  ApiSuccessResponse,
  PublicUserProfile,
  UserProfile,
} from "@/types";

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

async function fetchUserProfileById(
  userId: string,
  accessToken: string,
): Promise<PublicUserProfile | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/users/${encodeURIComponent(userId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (response.status === 401) {
      redirect("/auth/login");
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const payload: ApiSuccessResponse<{ user: Partial<UserProfile> }> =
      await response.json();
    const targetUser = payload.data?.user;

    if (!targetUser?.id) {
      return null;
    }

    return {
      id: targetUser.id,
      first_name: targetUser.first_name ?? "",
      last_name: targetUser.last_name ?? "",
      email: targetUser.email ?? "",
      type: targetUser.type ?? "ucr",
      created_at: String(targetUser.created_at ?? ""),
      updated_at: String(targetUser.updated_at ?? ""),
    };
  } catch {
    return null;
  }
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

  return <UserProfilePanel user={targetUser} />;
}
