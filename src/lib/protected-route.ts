import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";
import type { ApiSuccessResponse, UserProfile } from "@/types";
import {
  canAccessProtectedRoute,
  type ProtectedAppPath,
} from "./app-routes";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function normalizeSearchParams(input?: URLSearchParams | SearchParamsRecord) {
  if (!input) {
    return new URLSearchParams();
  }

  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input.toString());
  }

  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry) {
          nextParams.append(key, entry);
        }
      }
      continue;
    }

    if (typeof value === "string" && value) {
      nextParams.set(key, value);
    }
  }

  return nextParams;
}

async function fetchServerAuthenticatedUser(accessToken: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload: ApiSuccessResponse<{ user: UserProfile }> =
      await response.json();

    return payload.data?.user ?? null;
  } catch {
    return null;
  }
}

export async function getServerAuthenticatedUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value;

  if (!accessToken) {
    return null;
  }

  return fetchServerAuthenticatedUser(accessToken);
}

export async function requireProtectedRouteAccess(
  pathname: ProtectedAppPath,
  searchParamsInput?: URLSearchParams | SearchParamsRecord | Promise<SearchParamsRecord>,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value;

  if (!accessToken) {
    redirect("/auth/login");
  }

  const user = await fetchServerAuthenticatedUser(accessToken);

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = searchParamsInput
    ? await searchParamsInput
    : undefined;
  const searchParams = normalizeSearchParams(resolvedSearchParams);

  if (
    !canAccessProtectedRoute({
      pathname,
      userType: user.type,
      searchParams,
    })
  ) {
    notFound();
  }

  return user;
}
