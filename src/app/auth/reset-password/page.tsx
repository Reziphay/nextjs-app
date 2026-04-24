import type { Metadata } from "next";
import { AuthResetPasswordPanel } from "@/components/organisms/auth-reset-password-panel/auth-reset-password-panel";

type ResetPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Reset Password",
};

function getToken(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <AuthResetPasswordPanel initialToken={getToken(resolvedSearchParams.token)} />
  );
}
