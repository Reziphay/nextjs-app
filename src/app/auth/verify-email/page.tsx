import type { Metadata } from "next";
import { AuthEmailVerificationPanel } from "@/components/organisms/auth-email-verification-panel/auth-email-verification-panel";

type VerifyEmailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Verify Email",
};

function getToken(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <AuthEmailVerificationPanel initialToken={getToken(resolvedSearchParams.token)} />
  );
}
