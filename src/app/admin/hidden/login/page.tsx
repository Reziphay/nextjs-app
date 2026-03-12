import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Admin gateway",
  description:
    "A hidden admin-route foundation for future internal tooling and operational access.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteConfig.url}/admin/hidden/login`,
  },
};

export default function HiddenAdminLoginPage() {
  return (
    <div className="container-shell py-10">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-border/80 bg-card p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
          Hidden admin gateway
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Internal access foundation
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          This route exists as a placeholder for future internal authentication and
          operations tooling. It is intentionally separate from the public
          marketing experience.
        </p>

        <form className="mt-8 grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="admin-email">
              Work email
            </label>
            <Input id="admin-email" placeholder="ops@reziphay.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="admin-password">
              Password
            </label>
            <Input id="admin-password" placeholder="Connect internal auth next" type="password" />
          </div>
          <Button disabled type="button">
            Connect internal auth provider
          </Button>
        </form>
      </div>
    </div>
  );
}

