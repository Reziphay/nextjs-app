import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <AdminTopbar
        title="Settings"
        description="Basic operational profile, auth, and documentation entry points."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Admin account
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Keep account updates, credential rotation, and access policy references here.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Documentation links
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Add moderation playbooks, analytics definitions, and visibility campaign notes as backend tooling matures.
          </p>
        </Card>
      </div>
    </>
  );
}
