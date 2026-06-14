import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  NotificationTransferPage,
  type TeamInvitationDetail,
} from "@/components/organisms/notification-transfer-page/notification-transfer-page";
import { fetchBrandById, fetchNotificationFeed } from "@/lib/brands-api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.dashboard.notifications,
  };
}

async function buildTeamInvitationDetails(
  initialFeed: Awaited<ReturnType<typeof fetchNotificationFeed>>,
  accessToken: string,
): Promise<Record<string, TeamInvitationDetail>> {
  const invitationItems = initialFeed.items.filter(
    (item): item is Extract<(typeof initialFeed.items)[number], { type: "team_invitation" }> =>
      item.type === "team_invitation",
  );

  if (invitationItems.length === 0) {
    return {};
  }

  const uniqueBrandIds = [...new Set(invitationItems.map((item) => item.data.brand_id))];
  const brands = await Promise.all(
    uniqueBrandIds.map(async (brandId) => [
      brandId,
      await fetchBrandById(brandId, accessToken).catch(() => null),
    ] as const),
  );
  const brandsById = new Map(brands);

  return Object.fromEntries(
    invitationItems.map((item) => {
      const brand = brandsById.get(item.data.brand_id);
      const branch = brand?.branches?.find((entry) => entry.id === item.data.branch_id);

      return [
        item.feed_id,
        {
          brand_name: brand?.name ?? item.data.brand_name,
          brand_logo_url: brand?.logo_url ?? null,
          brand_gallery_url: brand?.gallery?.[0]?.url ?? null,
          brand_categories: brand?.categories?.map((category) => category.key) ?? [],
          brand_description: brand?.description ?? null,
          branch_name: branch?.name ?? item.data.branch_name,
          branch_cover_url: branch?.cover_url ?? null,
          branch_description: branch?.description ?? null,
          branch_address: [branch?.address1, branch?.address2]
            .filter(Boolean)
            .join(", "),
          branch_availability: branch
            ? branch.is_24_7
              ? "24/7"
              : branch.opening && branch.closing
                ? `${branch.opening} - ${branch.closing}`
                : null
            : null,
        },
      ];
    }),
  );
}

export default async function NotificationPage() {
  await requireProtectedRouteAccess("/notification");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";
  const initialFeed = await fetchNotificationFeed(accessToken).catch(() => ({
    items: [],
    meta: {
      total_count: 0,
      unread_count: 0,
    },
  }));
  const teamInvitationDetails = await buildTeamInvitationDetails(
    initialFeed,
    accessToken,
  ).catch(() => ({}));

  return (
    <NotificationTransferPage
      initialFeed={initialFeed}
      teamInvitationDetails={teamInvitationDetails}
    />
  );
}
