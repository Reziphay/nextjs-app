import type { ReactNode } from "react";

import { notFound, redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/features/admin-auth/logout-button";
import { buildAdminPath, resolveAdminGuard, readAdminSession } from "@/lib/auth/admin-auth";

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
  const isAuthenticated = await readAdminSession();
  const result = resolveAdminGuard({
    adminRoute,
    isAuthenticated,
    pathname: buildAdminPath("/", adminRoute),
  });

  if (!result.allowed) {
    if (result.reason === "not-found") {
      notFound();
    }

    redirect(result.redirectTo ?? `/${adminRoute}/login`);
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[280px_1fr] xl:px-8">
      <AdminSidebar adminRoute={adminRoute} />
      <div className="space-y-6">
        <div className="flex justify-end">
          <LogoutButton redirectTo={`/${adminRoute}/login`} />
        </div>
        {children}
      </div>
    </main>
  );
}
