"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import { trackEvent, type EventProperties } from "@/features/analytics/track";
import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

interface CtaLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "className">,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  className?: string;
  eventName?: string;
  eventProperties?: EventProperties;
}

export function CtaLink({
  children,
  className,
  eventName,
  eventProperties,
  size,
  variant,
  ...props
}: CtaLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ className, size, variant }))}
      onClick={() => {
        if (eventName) {
          trackEvent(eventName, eventProperties);
        }
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

