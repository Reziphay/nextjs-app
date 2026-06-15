"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Button } from "@/components/atoms";
import { Icon } from "@/components/icon";
import { ServiceReadOnlyDetailView } from "@/components/organisms/services-uso-page/services-uso-page";
import { BookingModal } from "@/components/organisms/booking-modal";
import { ServiceReservationsTable } from "@/components/molecules/service-reservations-table/service-reservations-table";
import { RatingInput } from "@/components/molecules/rating-input";
import { useLocale } from "@/components/providers/locale-provider";
import { submitServiceRating } from "@/lib/services-api";
import { addFavoriteService, removeFavoriteService } from "@/lib/favorites-api";
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
  isFavorited?: boolean;
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
      <h2 className={styles.ratingTitle}>{messages.brands.rateServicePrompt}</h2>
      <RatingInput currentRating={myRating} isLoading={busy} onSelect={rate} />
      {myRating ? <p className={styles.ratingLead}>{`${p.yourRating}: ${myRating}/5`}</p> : null}
      {msg ? <p className={styles.ratingMsg}>{msg}</p> : null}
    </div>
  );
}

export function PublicServiceDetail({ service, brands, user, accessToken, reservations = [], isFavorited = false }: PublicServiceDetailProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);
  const [favBusy, setFavBusy] = useState(false);

  const canBook = Boolean(service.duration && service.duration > 0);

  async function toggleFavorite() {
    if (favBusy) return;
    setFavBusy(true);
    const next = !favorited;
    setFavorited(next);
    try {
      if (next) await addFavoriteService(service.id, accessToken);
      else await removeFavoriteService(service.id, accessToken);
    } catch {
      setFavorited(!next);
    } finally {
      setFavBusy(false);
    }
  }

  return (
    <>
      <ServiceReadOnlyDetailView
        service={service}
        brands={brands}
        user={user}
        onBack={() => router.push("/home")}
        showStatus={false}
        actionSlot={
          <div className={styles.actionRow}>
            <Button
              variant="primary"
              icon="event_available"
              disabled={!canBook}
              onClick={() => setBookingOpen(true)}
              className={styles.bookButton}
            >
              {messages.reservations.book}
            </Button>
            <Button
              variant="unstyled"
              type="button"
              className={styles.favoriteButton}
              data-active={favorited}
              aria-label={favorited ? messages.marketplace.removeFavorite : messages.marketplace.addFavorite}
              title={favorited ? messages.marketplace.removeFavorite : messages.marketplace.addFavorite}
              onClick={toggleFavorite}
            >
              <Icon icon="favorite" size={20} color="current" fill={favorited} />
            </Button>
          </div>
        }
        sidebarExtra={
          service.can_rate ? <ServiceRatingCard service={service} accessToken={accessToken} /> : null
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
