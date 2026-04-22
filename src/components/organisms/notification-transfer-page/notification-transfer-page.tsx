"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { isAxiosError } from "axios";
import { Button } from "@/components/atoms/button";
import { useLocale } from "@/components/providers/locale-provider";
import {
  acceptTransfer,
  cancelTransfer,
  rejectTransfer,
  type AppNotification,
  type BrandTransferListItem,
} from "@/lib/brands-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { UserType } from "@/types";
import styles from "./notification-transfer-page.module.css";

type NotificationTransferPageProps = {
  initialIncomingTransfers: BrandTransferListItem[];
  initialOutgoingTransfers: BrandTransferListItem[];
  initialNotifications: AppNotification[];
  userType: UserType;
};

function formatTransferDate(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(locale === "az" ? "az-Latn-AZ" : locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPersonLabel(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export function NotificationTransferPage({
  initialIncomingTransfers,
  initialOutgoingTransfers,
  initialNotifications,
  userType,
}: NotificationTransferPageProps) {
  const { locale, messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const [incomingTransfers, setIncomingTransfers] = useState(initialIncomingTransfers);
  const [outgoingTransfers, setOutgoingTransfers] = useState(initialOutgoingTransfers);
  const [notifications] = useState<AppNotification[]>(initialNotifications);
  const [loadingTransferId, setLoadingTransferId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showTransferSections = userType === "uso";

  const requestedDateLabel = useMemo(
    () => (value: string) => formatTransferDate(value, locale),
    [locale],
  );

  async function runTransferAction(
    transferId: string,
    action: "accept" | "reject" | "cancel",
  ) {
    const accessToken = session.accessToken;
    if (!accessToken) {
      setFeedback(t.loginRequired);
      return;
    }

    setLoadingTransferId(transferId);
    setFeedback(null);

    try {
      if (action === "accept") {
        await acceptTransfer(transferId, accessToken);
        setIncomingTransfers((prev) => prev.filter((transfer) => transfer.id !== transferId));
        setFeedback(t.transferAcceptedDescription);
      } else if (action === "reject") {
        await rejectTransfer(transferId, accessToken);
        setIncomingTransfers((prev) => prev.filter((transfer) => transfer.id !== transferId));
        setFeedback(t.transferRejectedDescription);
      } else {
        await cancelTransfer(transferId, accessToken);
        setOutgoingTransfers((prev) => prev.filter((transfer) => transfer.id !== transferId));
        setFeedback(t.transferCancelledDescription);
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined;
      const translatedMessage = translateBackendErrorMessage(
        message,
        messages.backendErrors,
      );

      if (message === "brand.transfer_not_found") {
        setFeedback(t.notFoundDescription);
      } else if (message === "brand.transfer_not_pending") {
        setFeedback(t.errorDescription);
      } else if (message === "errors.forbidden") {
        setFeedback(t.forbiddenDescription);
      } else {
        setFeedback(translatedMessage ?? t.errorGeneric);
      }
    } finally {
      setLoadingTransferId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{messages.dashboard.notifications}</h1>
      </div>

      {feedback && (
        <div className={styles.feedback}>
          {feedback}
        </div>
      )}

      {showTransferSections && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t.incomingTransfersTitle}</h2>
              <p className={styles.sectionDescription}>{t.incomingTransfersDescription}</p>
            </div>

            {incomingTransfers.length === 0 ? (
              <div className={styles.emptyState}>{t.noIncomingTransfers}</div>
            ) : (
              <div className={styles.list}>
                {incomingTransfers.map((transfer) => {
                  const senderName = getPersonLabel(
                    transfer.from_user.first_name,
                    transfer.from_user.last_name,
                  );

                  return (
                    <article key={transfer.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        <div className={styles.brandLogoWrap}>
                          <Image
                            src={proxyMediaUrl(transfer.brand.logo_url) ?? "/reziphay-logo.png"}
                            alt={transfer.brand.name}
                            fill
                            sizes="56px"
                            className={styles.brandLogo}
                          />
                        </div>

                        <div className={styles.cardContent}>
                          <h3 className={styles.cardTitle}>{transfer.brand.name}</h3>
                          <p className={styles.cardMeta}>
                            {t.transferRequestedAt}: {requestedDateLabel(transfer.created_at)}
                          </p>

                          <div className={styles.personRow}>
                            <div className={styles.personAvatarWrap}>
                              <Image
                                src={proxyMediaUrl(transfer.from_user.avatar_url) ?? "/reziphay-logo.png"}
                                alt={senderName}
                                fill
                                sizes="36px"
                                className={styles.personAvatar}
                              />
                            </div>
                            <div className={styles.personContent}>
                              <span className={styles.personLabel}>{t.transferFrom}</span>
                              <span className={styles.personName}>{senderName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <Button
                          variant="outline"
                          onClick={() => runTransferAction(transfer.id, "reject")}
                          disabled={loadingTransferId === transfer.id}
                        >
                          {t.rejectTransfer}
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => runTransferAction(transfer.id, "accept")}
                          isLoading={loadingTransferId === transfer.id}
                        >
                          {t.acceptTransfer}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t.outgoingTransfersTitle}</h2>
              <p className={styles.sectionDescription}>{t.outgoingTransfersDescription}</p>
            </div>

            {outgoingTransfers.length === 0 ? (
              <div className={styles.emptyState}>{t.noOutgoingTransfers}</div>
            ) : (
              <div className={styles.list}>
                {outgoingTransfers.map((transfer) => {
                  const recipientName = getPersonLabel(
                    transfer.to_user.first_name,
                    transfer.to_user.last_name,
                  );
                  const isPending = transfer.status === "PENDING";
                  const statusLabel =
                    transfer.status === "ACCEPTED"
                      ? t.transferStatusAccepted
                      : transfer.status === "REJECTED"
                        ? t.transferStatusRejected
                        : t.transferStatusPending;

                  return (
                    <article key={transfer.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        <div className={styles.brandLogoWrap}>
                          <Image
                            src={proxyMediaUrl(transfer.brand.logo_url) ?? "/reziphay-logo.png"}
                            alt={transfer.brand.name}
                            fill
                            sizes="56px"
                            className={styles.brandLogo}
                          />
                        </div>

                        <div className={styles.cardContent}>
                          <div className={styles.cardTitleRow}>
                            <h3 className={styles.cardTitle}>{transfer.brand.name}</h3>
                            <span
                              className={[
                                styles.statusBadge,
                                transfer.status === "ACCEPTED"
                                  ? styles.statusAccepted
                                  : transfer.status === "REJECTED"
                                    ? styles.statusRejected
                                    : styles.statusPending,
                              ].join(" ")}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <p className={styles.cardMeta}>
                            {t.transferRequestedAt}: {requestedDateLabel(transfer.created_at)}
                          </p>

                          <div className={styles.personRow}>
                            <div className={styles.personAvatarWrap}>
                              <Image
                                src={proxyMediaUrl(transfer.to_user.avatar_url) ?? "/reziphay-logo.png"}
                                alt={recipientName}
                                fill
                                sizes="36px"
                                className={styles.personAvatar}
                              />
                            </div>
                            <div className={styles.personContent}>
                              <span className={styles.personLabel}>{t.transferTo}</span>
                              <span className={styles.personName}>{recipientName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isPending && (
                        <div className={styles.actions}>
                          <Button
                            variant="outline"
                            onClick={() => runTransferAction(transfer.id, "cancel")}
                            isLoading={loadingTransferId === transfer.id}
                          >
                            {t.cancelTransfer}
                          </Button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {notifications.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.notificationsSection}</h2>
          </div>

          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={[
                  styles.notificationItem,
                  !notification.read ? styles.notificationUnread : "",
                ].join(" ")}
              >
                <div className={styles.notificationDot} aria-hidden />
                <div className={styles.notificationBody}>
                  <p className={styles.notificationTitle}>{notification.title}</p>
                  <p className={styles.notificationText}>{notification.body}</p>
                  <p className={styles.notificationDate}>
                    {requestedDateLabel(notification.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {notifications.length === 0 && !showTransferSections && (
        <div className={styles.emptyState}>{t.notificationsEmpty}</div>
      )}
    </div>
  );
}
