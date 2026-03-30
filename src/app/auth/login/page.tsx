import type { Metadata } from "next";
import { AuthLoginPanel } from "@/components";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return <AuthLoginPanel />;
}
