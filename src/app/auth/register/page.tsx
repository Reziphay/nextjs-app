import type { Metadata } from "next";
import { AuthRegisterPanel } from "@/components";
import { redirectAuthenticatedUserFromAuthRoute } from "@/lib/protected-route";

export const metadata: Metadata = {
  title: "Register",
};

export default async function RegisterPage() {
  await redirectAuthenticatedUserFromAuthRoute();

  return <AuthRegisterPanel />;
}
