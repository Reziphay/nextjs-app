"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isAxiosError } from "axios";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/icon";
import { ProfileBox } from "@/components/molecules";
import { StatusBanner } from "@/components/molecules/status-banner";
import { useLocale } from "@/components/providers/locale-provider";
import {
  acceptTeamInvitation,
  acceptTransfer,
  cancelTransfer,
  clearNotificationFeed,
  dismissNotificationFeedItem,
  rejectTeamInvitation,
  rejectTransfer,
  type NotificationFeed,
  type NotificationFeedItem,
  type NotificationFeedPerson,
} from "@/lib/brands-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import styles from "./notification-transfer-page.module.css";

type NotificationTransferPageProps = {
  initialFeed: NotificationFeed;
  teamInvitationDetails?: Record<string, TeamInvitationDetail>;
};

export type TeamInvitationDetail = {
  brand_name: string;
  brand_logo_url?: string | null;
  brand_gallery_url?: string | null;
  brand_categories?: string[];
  brand_description?: string | null;
  branch_name: string;
  branch_cover_url?: string | null;
  branch_description?: string | null;
  branch_address?: string | null;
  branch_availability?: string | null;
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

function getPersonLabel(person?: NotificationFeedPerson | null) {
  if (!person) {
    return "";
  }

  return `${person.first_name} ${person.last_name}`.trim();
}

function getKindBadgeClassName(item: NotificationFeedItem) {
  switch (item.type) {
    case "team_invitation":
      return styles.kindInvite;
    case "incoming_transfer":
      return styles.kindIncoming;
    case "outgoing_transfer":
      return styles.kindOutgoing;
    default:
      return styles.kindSystem;
  }
}

function getKindLabel(
  item: NotificationFeedItem,
  t: { notifCenterTeamInvitationLabel: string; notifCenterIncomingTransferLabel: string; notifCenterOutgoingTransferLabel: string; notifCenterSystemNotificationLabel: string },
) {
  switch (item.type) {
    case "team_invitation":
      return t.notifCenterTeamInvitationLabel;
    case "incoming_transfer":
      return t.notifCenterIncomingTransferLabel;
    case "outgoing_transfer":
      return t.notifCenterOutgoingTransferLabel;
    default:
      return t.notifCenterSystemNotificationLabel;
  }
}

function getFeedImageUrl(item: NotificationFeedItem) {
  switch (item.type) {
    case "team_invitation":
      return proxyMediaUrl(item.data.invited_by?.avatar_url ?? null);
    case "incoming_transfer":
      return proxyMediaUrl(item.data.from_user?.avatar_url ?? null);
    case "outgoing_transfer":
      return proxyMediaUrl(item.data.to_user?.avatar_url ?? null);
    default:
      return null;
  }
}

export function NotificationTransferPage({
  initialFeed,
  teamInvitationDetails = {},
}: NotificationTransferPageProps) {
  const { locale, messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const [feedItems, setFeedItems] = useState(initialFeed.items);
  const [loadingTransferId, setLoadingTransferId] = useState<string | null>(null);
  const [loadingInvitationId, setLoadingInvitationId] = useState<string | null>(null);
  const [clearingItemId, setClearingItemId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const requestedDateLabel = useMemo(
    () => (value: string) => formatTransferDate(value, locale),
    [locale],
  );

  async function runTransferAction(
    item: Extract<
      NotificationFeedItem,
      { type: "incoming_transfer" | "outgoing_transfer" }
    >,
    action: "accept" | "reject" | "cancel",
  ) {
    const accessToken = session.accessToken;
    if (!accessToken) {
      setFeedback(t.loginRequired);
      return;
    }

    setLoadingTransferId(item.source_id);
    setFeedback(null);

    try {
      if (action === "accept") {
        await acceptTransfer(item.data.transfer_id, accessToken);
        setFeedItems((prev) =>
          prev.filter((feedItem) => feedItem.feed_id !== item.feed_id),
        );
        setFeedback(t.transferAcceptedDescription);
      } else if (action === "reject") {
        await rejectTransfer(item.data.transfer_id, accessToken);
        setFeedItems((prev) =>
          prev.filter((feedItem) => feedItem.feed_id !== item.feed_id),
        );
        setFeedback(t.transferRejectedDescription);
      } else {
        await cancelTransfer(item.data.transfer_id, accessToken);
        setFeedItems((prev) =>
          prev.filter((feedItem) => feedItem.feed_id !== item.feed_id),
        );
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

  async function runInvitationAction(
    item: Extract<NotificationFeedItem, { type: "team_invitation" }>,
    action: "accept" | "reject",
  ) {
    const accessToken = session.accessToken;
    if (!accessToken) {
      setFeedback(t.loginRequired);
      return;
    }

    setLoadingInvitationId(item.source_id);
    setFeedback(null);

    try {
      if (action === "accept") {
        await acceptTeamInvitation(item.data.team_member_id, accessToken);
        setFeedItems((prev) =>
          prev.filter((feedItem) => feedItem.feed_id !== item.feed_id),
        );
        setFeedback(t.teamInviteAcceptedDescription);
      } else {
        await rejectTeamInvitation(item.data.team_member_id, accessToken);
        setFeedItems((prev) =>
          prev.filter((feedItem) => feedItem.feed_id !== item.feed_id),
        );
        setFeedback(t.teamInviteRejectedDescription);
      }
    } catch (error) {
      const translatedMessage = isAxiosError(error)
        ? translateBackendErrorMessage(error.response?.data?.message, messages.backendErrors)
        : undefined;

      setFeedback(translatedMessage ?? t.errorGeneric);
    } finally {
      setLoadingInvitationId(null);
    }
  }

  async function handleDismiss(item: NotificationFeedItem) {
    const accessToken = session.accessToken;

    if (!accessToken) {
      setFeedback(t.loginRequired);
      return;
    }

    setClearingItemId(item.feed_id);
    setFeedback(null);

    try {
      await dismissNotificationFeedItem(item.type, item.source_id, accessToken);
      setFeedItems((prev) =>
        prev.filter((feedItem) => feedItem.feed_id !== item.feed_id),
      );
      setFeedback(t.notifCenterClearOneDescription);
    } catch (error) {
      const translatedMessage = isAxiosError(error)
        ? translateBackendErrorMessage(error.response?.data?.message, messages.backendErrors)
        : undefined;

      setFeedback(translatedMessage ?? t.errorGeneric);
    } finally {
      setClearingItemId(null);
    }
  }

  async function handleClearAll() {
    const accessToken = session.accessToken;

    if (!accessToken) {
      setFeedback(t.loginRequired);
      return;
    }

    setClearingAll(true);
    setFeedback(null);

    try {
      await clearNotificationFeed(accessToken);
      setFeedItems([]);
      setFeedback(t.notifCenterClearAllDescription);
    } catch (error) {
      const translatedMessage = isAxiosError(error)
        ? translateBackendErrorMessage(error.response?.data?.message, messages.backendErrors)
        : undefined;

      setFeedback(translatedMessage ?? t.errorGeneric);
    } finally {
      setClearingAll(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{messages.dashboard.notifications}</h1>
        <p className={styles.pageDescription}>{t.notifCenterStreamDescription}</p>
      </div>

      {feedback ? <StatusBanner variant="info">{feedback}</StatusBanner> : null}

      <div className={styles.streamToolbar}>
        <div className={styles.streamMeta}>
          <span className={styles.streamCount}>{feedItems.length}</span>
          <span className={styles.streamCountLabel}>{t.notificationsSection}</span>
        </div>

        {feedItems.length > 0 ? (
          <Button
            variant="outline"
            icon="delete"
            onClick={() => void handleClearAll()}
            isLoading={clearingAll}
          >
            {t.notifCenterClearAllAction}
          </Button>
        ) : null}
      </div>

      {feedItems.length === 0 ? (
        <div className={styles.emptyState}>{t.notificationsEmpty}</div>
      ) : (
        <div className={styles.streamList}>
          {feedItems.map((item) => {
            const person =
              item.type === "team_invitation"
                ? item.data.invited_by
                : item.type === "incoming_transfer"
                  ? item.data.from_user
                  : item.type === "outgoing_transfer"
                    ? item.data.to_user
                    : null;
            const personName = getPersonLabel(person);
            const imageUrl = getFeedImageUrl(item);
            const teamInvitationBrandHref =
              item.type === "team_invitation"
                ? `/brands?id=${item.data.brand_id}`
                : null;
            const teamInvitationInviterHref =
              item.type === "team_invitation" && item.data.invited_by?.id
                ? `/account?id=${item.data.invited_by.id}`
                : null;
            const invitationDetail =
              item.type === "team_invitation"
                ? teamInvitationDetails[item.feed_id]
                : undefined;
            const brandPreviewUrl =
              item.type === "team_invitation"
                ? proxyMediaUrl(
                    invitationDetail?.brand_logo_url ??
                      invitationDetail?.brand_gallery_url ??
                      null,
                  )
                : undefined;
            const branchPreviewUrl =
              item.type === "team_invitation"
                ? proxyMediaUrl(
                    invitationDetail?.branch_cover_url ??
                      invitationDetail?.brand_gallery_url ??
                      invitationDetail?.brand_logo_url ??
                      null,
                  )
                : undefined;
            const brandSummary =
              invitationDetail?.brand_categories
                ?.filter(Boolean)
                .map((key) => messages.categories[key as keyof typeof messages.categories] ?? key)
                .join(" · ") ||
              invitationDetail?.brand_description ||
              null;
            const branchSummary =
              invitationDetail?.branch_address ||
              invitationDetail?.branch_description ||
              null;

            return (
              <article
                key={item.feed_id}
                className={`${styles.streamCard} ${item.type === "notification" && item.data.read === false ? styles.streamCardUnread : ""}`}
              >
                <div className={styles.streamCardTop}>
                  {item.type !== "team_invitation" ? (
                    <div
                      className={`${styles.streamMedia} ${!imageUrl ? styles.streamMediaNeutral : ""}`}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={personName || item.title}
                          fill
                          sizes="64px"
                          className={styles.streamMediaImage}
                        />
                      ) : (
                        <Icon
                          icon={item.type === "notification" ? "notifications" : "sell"}
                          size={20}
                          color="current"
                          className={styles.streamMediaIcon}
                        />
                      )}
                    </div>
                  ) : null}

                  <div className={styles.streamContent}>
                    <div className={styles.streamMetaRow}>
                      <span
                        className={`${styles.kindBadge} ${getKindBadgeClassName(item)}`}
                      >
                        {getKindLabel(item, t)}
                      </span>
                      {item.type === "team_invitation" ? (
                        <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                          {t.teamInvitePendingLabel}
                        </span>
                      ) : null}
                      <span className={styles.dateLabel}>
                        {requestedDateLabel(item.created_at)}
                      </span>
                    </div>

                    <div className={styles.streamTitleRow}>
                      <h2 className={styles.streamTitle}>{item.title}</h2>
                      <Button
                        variant="icon"
                        size="small"
                        icon="delete"
                        aria-label={t.notifCenterClearOneAction}
                        className={styles.dismissButton}
                        isLoading={clearingItemId === item.feed_id}
                        onClick={() => void handleDismiss(item)}
                      />
                    </div>

                    <p className={styles.streamBody}>{item.body}</p>

                    {item.type === "team_invitation" ? (
                      <div className={styles.detailGrid}>
                        <div className={styles.detailBlock}>
                          {teamInvitationInviterHref && personName ? (
                            <ProfileBox
                              userId={item.data.invited_by?.id}
                              name={personName}
                              avatar={imageUrl ?? "/reziphay-logo.png"}
                              label={t.notifCenterInviterLabel}
                              className={styles.detailProfileBox}
                            />
                          ) : personName ? (
                            <ProfileBox
                              name={personName}
                              avatar={imageUrl ?? "/reziphay-logo.png"}
                              label={t.notifCenterInviterLabel}
                              className={styles.detailProfileBox}
                            />
                          ) : null}
                        </div>

                        <div className={styles.detailBlock}>
                          <span className={styles.detailLabel}>
                            {t.notifCenterBrandLabel}
                          </span>
                          {teamInvitationBrandHref ? (
                            <Link
                              href={teamInvitationBrandHref}
                              className={styles.detailPreviewCard}
                            >
                              <div
                                className={`${styles.detailPreviewMedia} ${!brandPreviewUrl ? styles.detailPreviewMediaNeutral : ""}`}
                              >
                                {brandPreviewUrl ? (
                                  <Image
                                    src={brandPreviewUrl}
                                    alt={invitationDetail?.brand_name ?? item.data.brand_name}
                                    fill
                                    sizes="88px"
                                    className={styles.detailPreviewImage}
                                  />
                                ) : (
                                  <Icon
                                    icon="storefront"
                                    size={22}
                                    color="current"
                                    className={styles.detailPreviewIcon}
                                  />
                                )}
                              </div>
                              <div className={styles.detailPreviewContent}>
                                <span className={styles.detailLink}>
                                  {invitationDetail?.brand_name ?? item.data.brand_name}
                                </span>
                                {brandSummary ? (
                                  <span className={styles.detailSubline}>
                                    {brandSummary}
                                  </span>
                                ) : null}
                              </div>
                            </Link>
                          ) : (
                            <div className={styles.detailPreviewCard}>
                              <div
                                className={`${styles.detailPreviewMedia} ${!brandPreviewUrl ? styles.detailPreviewMediaNeutral : ""}`}
                              >
                                {brandPreviewUrl ? (
                                  <Image
                                    src={brandPreviewUrl}
                                    alt={invitationDetail?.brand_name ?? item.data.brand_name}
                                    fill
                                    sizes="88px"
                                    className={styles.detailPreviewImage}
                                  />
                                ) : (
                                  <Icon
                                    icon="storefront"
                                    size={22}
                                    color="current"
                                    className={styles.detailPreviewIcon}
                                  />
                                )}
                              </div>
                              <div className={styles.detailPreviewContent}>
                                <span className={styles.detailValue}>
                                  {invitationDetail?.brand_name ?? item.data.brand_name}
                                </span>
                                {brandSummary ? (
                                  <span className={styles.detailSubline}>
                                    {brandSummary}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={styles.detailBlock}>
                          <span className={styles.detailLabel}>
                            {t.notifCenterBranchLabel}
                          </span>
                          <div className={styles.detailPreviewCard}>
                            <div
                              className={`${styles.detailPreviewMedia} ${!branchPreviewUrl ? styles.detailPreviewMediaNeutral : ""}`}
                            >
                              {branchPreviewUrl ? (
                                <Image
                                  src={branchPreviewUrl}
                                  alt={invitationDetail?.branch_name ?? item.data.branch_name}
                                  fill
                                  sizes="88px"
                                  className={styles.detailPreviewImage}
                                />
                              ) : (
                                <Icon
                                  icon="home_work"
                                  size={22}
                                  color="current"
                                  className={styles.detailPreviewIcon}
                                />
                              )}
                            </div>
                            <div className={styles.detailPreviewContent}>
                              <span className={styles.detailValue}>
                                {invitationDetail?.branch_name ?? item.data.branch_name}
                              </span>
                              {branchSummary ? (
                                <span className={styles.detailSubline}>
                                  {branchSummary}
                                </span>
                              ) : null}
                              {invitationDetail?.branch_availability ? (
                                <span className={styles.detailHint}>
                                  {invitationDetail.branch_availability}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {item.type === "incoming_transfer" && personName ? (
                      <div className={styles.personRow}>
                        <div className={styles.personAvatarWrap}>
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={personName}
                              fill
                              sizes="40px"
                              className={styles.personAvatar}
                            />
                          ) : (
                            <Icon
                              icon="person"
                              size={18}
                              color="current"
                              className={styles.personAvatarFallback}
                            />
                          )}
                        </div>
                        <div className={styles.personContent}>
                          <span className={styles.personLabel}>
                            {t.notifCenterTransferFromLabel}
                          </span>
                          <span className={styles.personName}>{personName}</span>
                        </div>
                      </div>
                    ) : null}

                    {item.type === "outgoing_transfer" && personName ? (
                      <div className={styles.personRow}>
                        <div className={styles.personAvatarWrap}>
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={personName}
                              fill
                              sizes="40px"
                              className={styles.personAvatar}
                            />
                          ) : (
                            <Icon
                              icon="person"
                              size={18}
                              color="current"
                              className={styles.personAvatarFallback}
                            />
                          )}
                        </div>
                        <div className={styles.personContent}>
                          <span className={styles.personLabel}>
                            {t.notifCenterTransferToLabel}
                          </span>
                          <span className={styles.personName}>{personName}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {item.type === "team_invitation" ? (
                  <div className={styles.actions}>
                    <Button
                      variant="outline"
                      onClick={() => void runInvitationAction(item, "reject")}
                      disabled={loadingInvitationId === item.source_id}
                    >
                      {t.teamInviteRejectAction}
                    </Button>
                    <Button
                      variant="primary"
                      isLoading={loadingInvitationId === item.source_id}
                      onClick={() => void runInvitationAction(item, "accept")}
                    >
                      {t.teamInviteAcceptAction}
                    </Button>
                  </div>
                ) : null}

                {item.type === "incoming_transfer" ? (
                  <div className={styles.actions}>
                    <Button
                      variant="outline"
                      onClick={() => void runTransferAction(item, "reject")}
                      disabled={loadingTransferId === item.source_id}
                    >
                      {t.rejectTransfer}
                    </Button>
                    <Button
                      variant="primary"
                      isLoading={loadingTransferId === item.source_id}
                      onClick={() => void runTransferAction(item, "accept")}
                    >
                      {t.acceptTransfer}
                    </Button>
                  </div>
                ) : null}

                {item.type === "outgoing_transfer" ? (
                  <div className={styles.actions}>
                    <Button
                      variant="outline"
                      isLoading={loadingTransferId === item.source_id}
                      onClick={() => void runTransferAction(item, "cancel")}
                    >
                      {t.cancelTransfer}
                    </Button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
