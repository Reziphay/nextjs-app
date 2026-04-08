"use client";

import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import styles from "./BrandCard.module.css";

type BrandCardMedia = { src: string; alt: string };

type BrandCardProps = {
  logo: BrandCardMedia;
  backgroundImage?: BrandCardMedia;
  title: string;
  description: string;
  category?: string;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  badgePlacement?: "header-end" | "below-title";
  author: {
    name: string;
    avatar: string;
    label?: string;
    subtitle?: string;
  };
  rating: number | null;
  ratingCount?: number;
  maxRating?: number;
  onClick?: () => void;
};

function StarRating({ rating, max }: { rating: number; max: number }) {
  return (
    <span
      className={styles.stars}
      aria-label={`Rating: ${rating} out of ${max}`}
      role="img"
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = rating - i;
        const isHalf = filled > 0 && filled < 1;
        const isFull = filled >= 1;
        const id = `half-${i}`;

        return (
          <svg
            key={i}
            className={styles.star}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {isHalf && (
              <defs>
                <linearGradient id={id}>
                  <stop offset="50%" stopColor="var(--app-warning, #f59e0b)" />
                  <stop offset="50%" stopColor="var(--app-border-strong, #d1d5db)" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={
                isFull
                  ? "var(--app-warning, #f59e0b)"
                  : isHalf
                    ? `url(#${id})`
                    : "var(--app-border-strong, #d1d5db)"
              }
            />
          </svg>
        );
      })}
    </span>
  );
}

export function BrandCard({
  logo,
  backgroundImage,
  title,
  description,
  category,
  badgeText,
  badgeVariant = "default",
  badgePlacement = "header-end",
  author,
  rating,
  ratingCount = 0,
  maxRating = 5,
  onClick,
}: BrandCardProps) {
  const { messages } = useLocale();
  const t = messages.brands;
  const isClickable = !!onClick;
  const hasDescription = description.trim().length > 0;
  const backdrop = backgroundImage ?? logo;
  const ownerLabel = author.label ?? t.brandCardOwnerLabel;
  const normalizedRating = typeof rating === "number" ? rating : 0;
  const badgeVariantClassName =
    badgeVariant === "secondary"
      ? styles.badgeSecondary
      : badgeVariant === "destructive"
        ? styles.badgeDestructive
        : badgeVariant === "outline"
          ? styles.badgeOutline
          : styles.badgeDefault;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className={`${styles.card} ${isClickable ? styles.clickable : ""}`}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? title : undefined}
    >
      <div className={styles.visualPane}>
        <div className={styles.visualBackdrop}>
          <Image
            src={backdrop.src}
            alt=""
            fill
            aria-hidden="true"
            className={styles.backdropImage}
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>

        {category && (
          <div className={styles.categoryCard}>
            <span className={styles.categoryLabel}>{t.brandCardCategoryLabel}</span>
            <span className={styles.categoryValue}>{category}</span>
          </div>
        )}

        <div className={styles.visualStage}>
          <div className={styles.visualFrame}>
            <div className={styles.logoOrb}>
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className={styles.stageImage}
                sizes="(max-width: 767px) 100vw, 34vw"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <span className={styles.label}>{t.brandCardBrandLabel}</span>
          {badgeText && badgePlacement === "header-end" ? (
            <span className={`${styles.badge} ${badgeVariantClassName}`}>
              {badgeText}
            </span>
          ) : null}
        </div>
        <h3 className={styles.title}>{title}</h3>
        {badgeText && badgePlacement === "below-title" ? (
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${badgeVariantClassName}`}>
              {badgeText}
            </span>
          </div>
        ) : null}

        <div className={styles.ratingRow}>
          <StarRating rating={normalizedRating} max={maxRating} />
          <span className={styles.ratingValue}>{normalizedRating.toFixed(1)}</span>
          {ratingCount > 0 ? (
            <span className={styles.ratingCount}>({ratingCount})</span>
          ) : null}
        </div>

        {hasDescription && (
          <div className={styles.descriptionBlock}>
            <span className={styles.sectionLabel}>{t.brandCardDescriptionLabel}</span>
            <p className={styles.description}>{description}</p>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.author}>
            <Image
              src={author.avatar}
              alt={author.name}
              width={32}
              height={32}
              className={styles.avatar}
            />
            <div className={styles.authorMeta}>
              {ownerLabel ? (
                <span className={styles.authorLabel}>{ownerLabel}</span>
              ) : null}
              <span className={styles.authorName}>{author.name}</span>
              {author.subtitle ? (
                <span className={styles.authorSubtitle}>{author.subtitle}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
