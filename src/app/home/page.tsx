import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { fetchMyServices } from "@/lib/services-api";
import { fetchMyBrands } from "@/lib/brands-api";
import { UsoCalendarPage } from "@/components/organisms/uso-calendar-page";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomeDashboardPage({ searchParams }: HomePageProps) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const user = await requireProtectedRouteAccess("/home", resolvedParams);

  if (user.type !== "uso") {
    redirect("/brands");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  const [services, brands] = await Promise.all([
    fetchMyServices(accessToken).catch(() => []),
    fetchMyBrands(accessToken).catch(() => []),
  ]);

  return (
    <UsoCalendarPage
      services={services}
      brands={brands}
    />
  );
}
