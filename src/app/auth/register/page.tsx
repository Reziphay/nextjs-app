import type { Metadata } from "next";
import { AuthRegisterPanel } from "@/components";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return <AuthRegisterPanel />;
}
