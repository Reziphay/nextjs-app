"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Button } from "@/components/atoms";
import { Icon } from "@/components/icon";
import { ServiceReadOnlyDetailView } from "@/components/organisms/services-uso-page/services-uso-page";
import { BookingModal } from "@/components/organisms/booking-modal";
import { ServiceReservationsTable } from "@/components/molecules/service-reservations-table/service-reservations-table";
import { useLocale } from "@/components/providers/locale-provider";
import { submitServiceRating } from "@/lib/services-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import type { Brand } from "@/types";
import type { Service } from "@/types/service";
import type { Reservation } from "@/types/reservation";
import type { AuthenticatedUser } from "@/types/user_types";
import styles from "./public-service-detail.module.css";

type PublicServiceDetailProps = {
  service: Service;
  brands: Brand[];
  user: AuthenticatedUser;
  accessToken: string;
  reservations?: Reservation[];
};

function ServiceRatingCard({ service, accessToken }: { service: Service; accessToken: string }) {
  const { messages } = useLocale();
  const p = messages.profile;
  const [myRating, setMyRating] = useState<number | null>(service.my_rating);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function rate(value: number) {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const previous = myRating;
    setMyRating(value);
    try {
      await submitServiceRating(service.id, value, accessToken);
      setMsg(p.ratingSaved);
    } catch (err) {
      setMyRating(previous);
      const apiMessage = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setMsg(translateBackendErrorMessage(apiMessage, messages.backendErrors) ?? p.ratingError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.ratingCard}>
      <span className={styles.ratingLead}>
        {myRating ? `${p.yourRating}: ${myRating}/5` : messages.brands.rateServicePrompt}
      </span>
      <div className={styles.starRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            className={styles.starButton}
            onClick={() => rate(v)}
            disabled={busy}
            aria-label={`${v}/5`}
          >
            <Icon icon="star" size={26} className={v <= (myRating ?? 0) ? styles.starActive : styles.starInactive} />
          </button>
        ))}
      </div>
      {msg ? <p className={styles.ratingMsg}>{msg}</p> : null}
    </div>
  );
}

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
          <>
            {service.can_rate ? <ServiceRatingCard service={service} accessToken={accessToken} /> : null}
            {reservations.length > 0 ? (
              <ServiceReservationsTable reservations={reservations} mode="customer" />
            ) : null}
          </>
        }
      />
      <BookingModal
        serviceId={service.id}
        serviceTitle={service.title}
        serviceDuration={service.duration}
        isBrandService={Boolean(service.brand_id)}
        providers={service.providers ?? []}
        accessToken={accessToken}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        onBooked={() => router.push("/rezervations")}
      />
    </>
  );
}
