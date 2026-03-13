import { AdminTopbar } from "@/components/admin/admin-topbar";
import { BackendReadiness } from "@/features/admin-settings/backend-readiness";
import { IntegrationSettings } from "@/features/admin-settings/integration-settings";
import { readAdminSession } from "@/lib/auth/admin-auth";
import { getAdminIntegrationSnapshot } from "@/lib/config/admin-integration";
import { getAdminBackendReadiness } from "@/lib/config/admin-readiness";

export default async function SettingsPage() {
  const session = await readAdminSession();
  const snapshot = getAdminIntegrationSnapshot(session);
  const readiness = await getAdminBackendReadiness(session);

  return (
    <>
      <AdminTopbar
        title="Settings"
        description="Runtime integration posture, backend contract paths, and cutover warnings for the hidden admin."
      />
      <div className="grid gap-6">
        <BackendReadiness readiness={readiness} />
        <IntegrationSettings snapshot={snapshot} />
      </div>
    </>
  );
}
