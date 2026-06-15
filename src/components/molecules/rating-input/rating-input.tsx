"use client";

import { Button } from "@/components/atoms/button";
import styles from "./rating-input.module.css";

type RatingInputProps = {
  currentRating: number | null;
  isLoading?: boolean;
  onSelect: (value: number) => void;
};

/** Shared 5-star rating picker (filled stars use the warning color). */
export function RatingInput({ currentRating, isLoading = false, onSelect }: RatingInputProps) {
  return (
    <div className={styles.ratingButtons}>
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const isActive = value <= (currentRating ?? 0);

        return (
          <Button
            variant="unstyled"
            key={value}
            type="button"
            className={`${styles.ratingButton} ${isActive ? styles.ratingButtonActive : ""}`}
            onClick={() => onSelect(value)}
            disabled={isLoading}
            aria-label={`Rate ${value} out of 5`}
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className={styles.ratingButtonIcon}
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={isActive ? "var(--brand-warning)" : "var(--brand-border-strong)"}
              />
            </svg>
          </Button>
        );
      })}
    </div>
  );
}
