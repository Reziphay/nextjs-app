import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getMessages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { requireProtectedRouteAccess } from "@/lib/protected-route";
import { fetchMyReservations } from "@/lib/reservations-api";
import { UsoCalendarPage } from "@/components/organisms/uso-calendar-page";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    title: messages.dashboard.reservations,
  };
}

export default async function RezervationsPage() {
  await requireProtectedRouteAccess("/rezervations", {});

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rzp_at")?.value ?? "";

  const reservations = await fetchMyReservations("customer", accessToken).catch(() => []);

  return (
    <UsoCalendarPage
      mode="customer"
      services={[]}
      brands={[]}
      reservations={reservations}
      accessToken={accessToken}
    />
  );
}
