import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { UserActionForm } from "@/features/admin-users/user-action-form";
import type { UserRecord } from "@/lib/types/admin";

type UserDetailProps =
  | { state: "loading" | "error" }
  | { state: "ready"; user: UserRecord };

export function UserDetailState(props: UserDetailProps) {
  if (props.state === "loading") {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded-full bg-[var(--color-surface-strong)]" />
          <div className="h-24 rounded-[20px] bg-[var(--color-surface-strong)]" />
        </div>
      </Card>
    );
  }

  if (props.state === "error") {
    return (
      <EmptyState
        title="User data could not be loaded"
        description="This placeholder admin foundation expects a typed backend endpoint next."
      />
    );
  }

  if (props.state !== "ready") {
    return null;
  }

  const { user } = props;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
              {user.name}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{user.id}</p>
          </div>
          <StatusPill
            label={user.state}
            tone={
              user.state === "active"
                ? "success"
                : user.state === "suspended"
                  ? "warning"
                  : "danger"
            }
          />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Roles</p>
            <p className="mt-2 font-medium text-[var(--color-ink)]">
              {user.roles.join(", ")}
            </p>
          </div>
          <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Penalty points</p>
            <p className="mt-2 font-medium text-[var(--color-ink)]">
              {user.penaltyPoints}
            </p>
          </div>
          <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Brands / services</p>
            <p className="mt-2 font-medium text-[var(--color-ink)]">
              {user.brands} / {user.services}
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-[var(--color-ink)]">
          Admin actions
        </h3>
        <UserActionForm />
      </Card>
    </div>
  );
}
