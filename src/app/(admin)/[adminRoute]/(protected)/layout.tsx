import type { ReactNode } from "react";

import { notFound, redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/features/admin-auth/logout-button";
import {
  buildAdminPath,
  isValidAdminSession,
  resolveAdminGuard,
  readAdminSession,
} from "@/lib/auth/admin-auth";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
  params: Promise<{
    adminRoute: string;
  }>;
};

export default async function ProtectedAdminLayout({
  children,
  params,
}: ProtectedAdminLayoutProps) {
  const { adminRoute } = await params;
  const session = await readAdminSession();
  const result = resolveAdminGuard({
    adminRoute,
    isAuthenticated: isValidAdminSession(session),
    pathname: buildAdminPath("/", adminRoute),
  });

  if (!result.allowed) {
    if (result.reason === "not-found") {
      notFound();
    }

    redirect(result.redirectTo ?? `/${adminRoute}/login`);
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute right-[-10rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[var(--color-primary-soft)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-9rem] bottom-[-7rem] h-[26rem] w-[26rem] rounded-full bg-[var(--color-secondary-soft)] blur-3xl" />
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[280px_1fr] xl:px-8">
        <AdminSidebar adminRoute={adminRoute} />
        <div className="space-y-6">
          <div className="flex justify-end">
            <LogoutButton redirectTo={`/${adminRoute}/login`} />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
