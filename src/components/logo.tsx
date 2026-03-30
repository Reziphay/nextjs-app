"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type LogoProps = {
  size?: number;
  priority?: boolean;
};

export function Logo({ size = 56, priority = false }: LogoProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="logoButton"
      aria-label="Go to home page"
      onClick={() => router.push("/")}
    >
      <Image
        src="/reziphay-logo.png"
        alt="Reziphay logo"
        width={size}
        height={size}
        priority={priority}
      />
    </button>
  );
}
