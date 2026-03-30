import type { ReactNode } from "react";

import { AppProviders } from "@/components/app/providers";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppProviders>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[var(--color-primary-soft)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-8rem] top-40 -z-10 h-[26rem] w-[26rem] rounded-full bg-[var(--color-secondary-soft)] blur-3xl" />
        <SiteHeader />
        <div className="relative z-10">{children}</div>
        <SiteFooter />
      </div>
    </AppProviders>
  );
}
