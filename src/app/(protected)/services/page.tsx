import { ProtectedComingSoonRoute } from "@/components/organisms/protected-coming-soon-route";

type ServicesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function ServicesPage({ searchParams }: ServicesPageProps) {
  return <ProtectedComingSoonRoute path="/services" searchParams={searchParams} />;
}
