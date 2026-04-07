import { cookies } from "next/headers";
import { NotificationTransferPage } from "@/components/organisms/notification-transfer-page/notification-transfer-page";
import {
  fetchIncomingTransfers,
  fetchOutgoingTransfers,
} from "@/lib/brands-api";
import { requireProtectedRouteAccess } from "@/lib/protected-route";

export default async function NotificationPage() {
  const user = await requireProtectedRouteAccess("/notification");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  const [incomingTransfers, outgoingTransfers] =
    user.type === "uso"
      ? await Promise.all([
          fetchIncomingTransfers(accessToken).catch(() => []),
          fetchOutgoingTransfers(accessToken).catch(() => []),
        ])
      : [[], []];

  return (
    <NotificationTransferPage
      initialIncomingTransfers={incomingTransfers}
      initialOutgoingTransfers={outgoingTransfers}
      userType={user.type}
    />
  );
}
