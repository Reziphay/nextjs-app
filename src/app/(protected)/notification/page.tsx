import { cookies } from "next/headers";
import { NotificationTransferPage } from "@/components/organisms/notification-transfer-page/notification-transfer-page";
import { fetchNotificationFeed } from "@/lib/brands-api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";

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

  return (
    <NotificationTransferPage
      initialFeed={initialFeed}
    />
  );
}
