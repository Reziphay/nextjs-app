"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/icon";
import styles from "./image-carousel.module.css";

type ImageCarouselProps = {
  images: { id: string; url: string }[];
  alt: string;
  autoplay?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
};

export function ImageCarousel({
  images,
  alt,
  autoplay = true,
  prevLabel = "Previous",
  nextLabel = "Next",
  className,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;
  // Derive a safe index instead of clamping via an effect (avoids cascading renders).
  const current = count > 0 ? index % count : 0;

  useEffect(() => {
    if (count <= 1 || paused || !autoplay) return undefined;
    const id = window.setInterval(() => setIndex((c) => (c + 1) % count), 4200);
    return () => window.clearInterval(id);
  }, [count, paused, autoplay]);

  if (count === 0) return null;

  const next = () => setIndex((c) => (c + 1) % count);
  const prev = () => setIndex((c) => (c - 1 + count) % count);

  return (
    <div
      className={`${styles.carousel} ${className ?? ""}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.stage}>
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`${styles.slide} ${i === current ? styles.slideActive : ""}`}
            aria-hidden={i === current ? undefined : true}
          >
            <Image
              src={img.url}
              alt={alt}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 60vw"
              priority={i === current}
            />
          </div>
        ))}

        {count > 1 ? (
          <>
            <span className={styles.counter}>
              {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className={styles.controls}>
              <Button
                variant="unstyled"
                type="button"
                className={styles.nav}
                onClick={prev}
                aria-label={prevLabel}
              >
                <Icon icon="arrow_back" size={18} color="current" />
              </Button>
              <div className={styles.dots}>
                {images.map((img, i) => (
                  <Button
                    variant="unstyled"
                    key={img.id}
                    type="button"
                    className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                    onClick={() => setIndex(i)}
                    aria-label={`${i + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="unstyled"
                type="button"
                className={styles.nav}
                onClick={next}
                aria-label={nextLabel}
              >
                <Icon icon="arrow_forward" size={18} color="current" />
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
