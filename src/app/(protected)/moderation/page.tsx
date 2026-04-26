import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { AdminModerationWorkspace } from "@/components/organisms/admin-moderation-workspace";

export default async function ModerationPage() {
  await requireProtectedRouteAccess("/moderation");

  return <AdminModerationWorkspace />;
}
