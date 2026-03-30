import { notFound, redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin-auth/login-form";
import {
  getAdminRoute,
  isValidAdminSession,
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

  if (isValidAdminSession(session)) {
    redirect(nextPath);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute right-[-8rem] top-[-5rem] h-[22rem] w-[22rem] rounded-full bg-[var(--color-primary-soft)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-8rem] bottom-[-5rem] h-[24rem] w-[24rem] rounded-full bg-[var(--color-secondary-soft)] blur-3xl" />
      <AdminLoginForm adminRoute={adminRoute} nextPath={nextPath} />
    </main>
  );
}
