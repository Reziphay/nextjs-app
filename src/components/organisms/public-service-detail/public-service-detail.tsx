"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { ServiceReadOnlyDetailView } from "@/components/organisms/services-uso-page/services-uso-page";
import { useLocale } from "@/components/providers/locale-provider";
import type { Brand } from "@/types";
import type { Service } from "@/types/service";
import type { AuthenticatedUser } from "@/types/user_types";

type PublicServiceDetailProps = {
  service: Service;
  brands: Brand[];
  user: AuthenticatedUser;
};

export function PublicServiceDetail({ service, brands, user }: PublicServiceDetailProps) {
  const router = useRouter();
  const { messages } = useLocale();

  return (
    <ServiceReadOnlyDetailView
      service={service}
      brands={brands}
      user={user}
      onBack={() => router.push("/home")}
      showStatus={false}
      actionSlot={
        <Button variant="primary" icon="event_available" disabled>
          {messages.dashboard.reservations}
        </Button>
      }
    />
  );
}
