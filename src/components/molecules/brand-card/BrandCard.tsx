import Image from "next/image";
import styles from "./BrandCard.module.css";

type BrandCardProps = {
  image: { src: string; alt: string };
  title: string;
  description: string;
  author: { name: string; avatar: string };
  rating: number;
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
  image,
  title,
  description,
  author,
  rating,
  maxRating = 5,
  onClick,
}: BrandCardProps) {
  const isClickable = !!onClick;

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
      <div className={styles.imageWrapper}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className={styles.image}
          sizes="(max-width: 420px) 100vw, 420px"
        />
      </div>

      <div className={styles.content}>
        <span className={styles.label}>BRAND</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.footer}>
          <div className={styles.author}>
            <Image
              src={author.avatar}
              alt={author.name}
              width={32}
              height={32}
              className={styles.avatar}
            />
            <span className={styles.authorName}>{author.name}</span>
          </div>
          <div className={styles.rating}>
            <span className={styles.ratingText}>{rating}/{maxRating}</span>
            <StarRating rating={rating} max={maxRating} />
          </div>
        </div>
      </div>
    </article>
  );
}
