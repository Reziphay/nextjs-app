import { ProtectedComingSoonRoute } from "@/components/organisms/protected-coming-soon-route";

type BrandsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function BrandsPage({ searchParams }: BrandsPageProps) {
  return <ProtectedComingSoonRoute path="/brands" searchParams={searchParams} />;
}
