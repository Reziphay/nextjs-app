"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atoms";
import { Icon } from "@/components/icon";
import styles from "./feedback-popup.module.css";

type FeedbackPopupVariant = "success" | "destructive" | "warning";

type FeedbackPopupProps = {
  title: string;
  description: string;
  variant: FeedbackPopupVariant;
  icon?: string;
  closeLabel: string;
  onClose: () => void;
  autoHideMs?: number;
};

const defaultIconsByVariant: Record<FeedbackPopupVariant, string> = {
  success: "check_circle",
  destructive: "error",
  warning: "warning",
};

export function FeedbackPopup({
  title,
  description,
  variant,
  icon,
  closeLabel,
  onClose,
  autoHideMs = 4200,
}: FeedbackPopupProps) {
  const resolvedIcon = useMemo(
    () => icon ?? defaultIconsByVariant[variant],
    [icon, variant],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose();
    }, autoHideMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoHideMs, description, onClose, title, variant]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`${styles.popup} ${styles[variant]}`}
      role={variant === "success" ? "status" : "alert"}
      aria-live={variant === "success" ? "polite" : "assertive"}
      style={{ ["--feedback-duration" as string]: `${autoHideMs}ms` }}
    >
      <div className={styles.iconWrap} aria-hidden="true">
        <Icon icon={resolvedIcon} size={20} color="current" />
      </div>

      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>

      <Button
        type="button"
        variant="icon"
        size="small"
        icon="close"
        className={styles.closeButton}
        aria-label={closeLabel}
        onClick={onClose}
      />
    </div>,
    document.body,
  );
}
