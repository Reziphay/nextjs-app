"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import styles from "./user-avatar.module.css";

type UserAvatarSize = "sm" | "md" | "lg" | "xl";

type UserAvatarProps = {
  initials: string;
  src?: string | null;
  alt?: string;
  size?: UserAvatarSize;
  editable?: boolean;
  isUploading?: boolean;
  editLabel?: string;
  className?: string;
  onEditClick?: () => void;
};

function getFallbackLabel(initials: string) {
  const normalizedInitials = initials.trim();
  return normalizedInitials || "?";
}

function resolveAvatarSource(src?: string | null) {
  const normalizedSource = src?.trim();

  if (!normalizedSource) {
    return null;
  }

  if (
    normalizedSource.startsWith("blob:") ||
    normalizedSource.startsWith("data:") ||
    normalizedSource.startsWith("/")
  ) {
    return normalizedSource;
  }

  try {
    const parsedSource = new URL(normalizedSource);

    if (parsedSource.pathname === "/api/media/avatar") {
      return normalizedSource;
    }

    if (
      parsedSource.protocol === "http:" ||
      parsedSource.protocol === "https:"
    ) {
      return `/api/media/avatar?url=${encodeURIComponent(normalizedSource)}`;
    }
  } catch {
    return normalizedSource;
  }

  return normalizedSource;
}

function renderEditIcon(isUploading: boolean): ReactNode {
  return (
    <Icon
      icon={isUploading ? "progress_activity" : "edit"}
      size={18}
      color="current"
      className={isUploading ? styles.uploading : undefined}
    />
  );
}

export function UserAvatar({
  initials,
  src,
  alt = "Profile photo",
  size = "md",
  editable = false,
  isUploading = false,
  editLabel = "Upload profile photo",
  className,
  onEditClick,
}: UserAvatarProps) {
  const fallbackLabel = getFallbackLabel(initials);
  const avatarSource = resolveAvatarSource(src);

  return (
    <div
      className={`${styles.root} ${styles[size]}${className ? ` ${className}` : ""}`}
    >
      <span className={styles.surface}>
        {avatarSource ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.image}
            src={avatarSource}
            alt={alt}
          />
        ) : (
          <span className={styles.fallback}>{fallbackLabel}</span>
        )}
      </span>

      {editable ? (
        <button
          type="button"
          className={styles.editButton}
          aria-label={editLabel}
          disabled={isUploading}
          onClick={onEditClick}
        >
          {renderEditIcon(isUploading)}
        </button>
      ) : null}
    </div>
  );
}
