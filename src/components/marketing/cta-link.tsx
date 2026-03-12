"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import type { AnalyticsEventDescriptor } from "@/features/analytics/events";
import { trackDescriptor } from "@/features/analytics/track";
import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

interface CtaLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "className">,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  className?: string;
  analyticsEvent?: AnalyticsEventDescriptor;
}

export function CtaLink({
  children,
  className,
  analyticsEvent,
  size,
  variant,
  ...props
}: CtaLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ className, size, variant }))}
      onClick={() => {
        if (analyticsEvent) {
          trackDescriptor(analyticsEvent);
        }
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
