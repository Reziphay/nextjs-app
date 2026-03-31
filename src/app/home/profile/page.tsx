import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserProfilePanel } from "@/components/organisms/user-profile-panel";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { getApiBaseUrl } from "@/lib/api";
import type { ApiSuccessResponse, UserProfile } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  return { title: messages.profile.title };
}

async function fetchUserProfile(accessToken: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json: ApiSuccessResponse<{ user: UserProfile }> = await res.json();
    return json.data?.user ?? null;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value;

  if (!accessToken) {
    redirect("/auth/login");
  }

  const user = await fetchUserProfile(accessToken);

  if (!user) {
    redirect("/auth/login");
  }

  return <UserProfilePanel user={user} />;
}
