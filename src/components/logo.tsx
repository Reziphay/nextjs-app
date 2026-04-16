"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const DEFAULT_LOGO_SRC = "/reziphay-logo-default.svg";
const HOVER_LOGO_SRC = "/reziphay-logo-hover.svg";

type LogoProps = {
  size?: number;
  priority?: boolean;
};

export function Logo({ size = 56, priority = false }: LogoProps) {
  const router = useRouter();
  const defaultLoading = priority ? "eager" : "lazy";

  return (
    <button
      type="button"
      className="logoButton"
      aria-label="Go to home page"
      onClick={() => router.push("/")}
    >
      <span className="logoSwap" style={{ width: size, height: size }}>
        <Image
          src={DEFAULT_LOGO_SRC}
          alt=""
          aria-hidden
          width={size}
          height={size}
          priority={priority}
          loading={defaultLoading}
          sizes={`${size}px`}
          className="logoSwapImage logoSwapImageDefault"
        />
        <Image
          src={HOVER_LOGO_SRC}
          alt=""
          aria-hidden
          width={size}
          height={size}
          loading="lazy"
          sizes={`${size}px`}
          className="logoSwapImage logoSwapImageHover"
        />
      </span>
    </button>
  );
}
