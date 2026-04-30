"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { UserAvatar } from "@/components/molecules/user-avatar/user-avatar";
import { proxyMediaUrl } from "@/lib/media";
import styles from "./owner-card.module.css";

type OwnerCardProps = {
  roleLabel: string;
  name: string;
  href?: string;
  // Brand variant
  logoUrl?: string | null;
  rating?: number | null;
  ratingCount?: number;
  // User variant
  avatarUrl?: string | null;
  initials?: string;
  subtitle?: string;
  compact?: boolean;
  disabled?: boolean;
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className={styles.rating}>
      <Icon icon="star" size={13} color="current" className={styles.starIcon} />
      <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
      {count > 0 && (
        <span className={styles.ratingCount}>({count})</span>
      )}
    </span>
  );
}

export function OwnerCard({
  roleLabel,
  name,
  href,
  logoUrl,
  rating,
  ratingCount,
  avatarUrl,
  initials = "?",
  subtitle,
  compact = false,
  disabled = false,
}: OwnerCardProps) {
  const proxiedLogo = proxyMediaUrl(logoUrl ?? undefined);
  const hasBrandLogo = !!proxiedLogo;
  const hasRating = typeof rating === "number" && rating > 0;
  const className = [
    styles.card,
    compact ? styles.compact : "",
    disabled ? styles.disabled : "",
  ].filter(Boolean).join(" ");

  const content: ReactNode = (
    <>
      <div className={styles.avatar}>
        {hasBrandLogo ? (
          <div className={styles.logoWrap}>
            <Image
              src={proxiedLogo!}
              alt={name}
              fill
              className={styles.logoImage}
              sizes="56px"
            />
          </div>
        ) : (
          <UserAvatar
            initials={initials}
            src={avatarUrl}
            size={compact ? "sm" : "md"}
            className={styles.userAvatar}
          />
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.roleLabel}>{roleLabel}</span>
        <span className={styles.name}>{name}</span>
        {hasRating && (
          <StarRating rating={rating!} count={ratingCount ?? 0} />
        )}
        {!hasRating && subtitle && (
          <span className={styles.subtitle}>{subtitle}</span>
        )}
      </div>

      <Icon icon="chevron_right" size={16} color="current" className={styles.chevron} />
    </>
  );

  if (disabled || !href) {
    return (
      <div className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
