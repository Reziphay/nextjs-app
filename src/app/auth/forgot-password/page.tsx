import type { Metadata } from "next";
import { AuthForgotPasswordPanel } from "@/components/organisms/auth-forgot-password-panel/auth-forgot-password-panel";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return <AuthForgotPasswordPanel />;
}
