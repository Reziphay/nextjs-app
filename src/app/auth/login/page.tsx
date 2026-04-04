import type { Metadata } from "next";
import { AuthLoginPanel } from "@/components";
import { redirectAuthenticatedUserFromAuthRoute } from "@/lib/protected-route";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  await redirectAuthenticatedUserFromAuthRoute();

  return <AuthLoginPanel />;
}
