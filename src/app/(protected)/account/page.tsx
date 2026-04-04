import { ProtectedComingSoonRoute } from "@/components/organisms/protected-coming-soon-route";

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function AccountPage({ searchParams }: AccountPageProps) {
  return <ProtectedComingSoonRoute path="/account" searchParams={searchParams} />;
}
