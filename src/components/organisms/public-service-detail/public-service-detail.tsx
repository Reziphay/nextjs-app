"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { ServiceReadOnlyDetailView } from "@/components/organisms/services-uso-page/services-uso-page";
import { BookingModal } from "@/components/organisms/booking-modal";
import { ServiceReservationsTable } from "@/components/molecules/service-reservations-table/service-reservations-table";
import { useLocale } from "@/components/providers/locale-provider";
import type { Brand } from "@/types";
import type { Service } from "@/types/service";
import type { Reservation } from "@/types/reservation";
import type { AuthenticatedUser } from "@/types/user_types";

type PublicServiceDetailProps = {
  service: Service;
  brands: Brand[];
  user: AuthenticatedUser;
  accessToken: string;
  reservations?: Reservation[];
};

export function PublicServiceDetail({ service, brands, user, accessToken, reservations = [] }: PublicServiceDetailProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const [bookingOpen, setBookingOpen] = useState(false);

  const canBook = Boolean(service.duration && service.duration > 0);

  return (
    <>
      <ServiceReadOnlyDetailView
        service={service}
        brands={brands}
        user={user}
        onBack={() => router.push("/home")}
        showStatus={false}
        actionSlot={
          <Button
            variant="primary"
            icon="event_available"
            disabled={!canBook}
            onClick={() => setBookingOpen(true)}
          >
            {messages.reservations.book}
          </Button>
        }
        extraContent={
          reservations.length > 0 ? (
            <ServiceReservationsTable reservations={reservations} mode="customer" />
          ) : null
        }
      />
      <BookingModal
        serviceId={service.id}
        serviceTitle={service.title}
        serviceDuration={service.duration}
        accessToken={accessToken}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        onBooked={() => router.push("/rezervations")}
      />
    </>
  );
}
