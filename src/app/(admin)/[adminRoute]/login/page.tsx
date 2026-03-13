import { notFound, redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin-auth/login-form";
import {
  getAdminRoute,
  readAdminSession,
  sanitizeNextPath,
} from "@/lib/auth/admin-auth";

type AdminLoginPageProps = {
  params: Promise<{
    adminRoute: string;
  }>;
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AdminLoginPage({
  params,
  searchParams,
}: AdminLoginPageProps) {
  const { adminRoute } = await params;
  const { next } = await searchParams;

  if (adminRoute !== getAdminRoute()) {
    notFound();
  }

  const nextPath = sanitizeNextPath(next, `/${adminRoute}`);
  const session = await readAdminSession();

  if (session) {
    redirect(nextPath);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <AdminLoginForm adminRoute={adminRoute} nextPath={nextPath} />
    </main>
  );
}
