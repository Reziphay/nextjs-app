"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/icon";
import { ServiceCard } from "@/components/organisms/services-uso-page/services-uso-page";
import { useLocale } from "@/components/providers/locale-provider";
import type { AccountUserProfile, AuthenticatedUser } from "@/types/user_types";
import type { Brand } from "@/types/brand";
import type { Service } from "@/types/service";
import styles from "./account-services-section.module.css";

type AccountServicesOwner = Pick<
  AccountUserProfile,
  "id" | "first_name" | "last_name" | "email" | "avatar_url" | "type"
>;

type AccountServicesSectionProps = {
  services: Service[];
  owner: AccountServicesOwner;
  brands?: Brand[];
  title: string;
  description?: string;
  emptyTitle: string;
  emptyDescription: string;
  viewMoreHref?: string;
  maxItems?: number;
};

function sortVisibleServices(services: Service[]) {
  return [...services].sort((a, b) => {
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function ownerAsAuthenticatedUser(owner: AccountServicesOwner): AuthenticatedUser {
  return {
    id: owner.id,
    email: owner.email,
    type: owner.type,
    first_name: owner.first_name,
    last_name: owner.last_name,
    email_verified: false,
    avatar_url: owner.avatar_url,
  };
}

export function AccountServicesSection({
  services,
  owner,
  brands = [],
  title,
  description,
  emptyTitle,
  emptyDescription,
  viewMoreHref,
  maxItems,
}: AccountServicesSectionProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const visibleServices = useMemo(
    () => sortVisibleServices(services.filter((service) => service.status === "ACTIVE" && service.brand_id === null)),
    [services],
  );
  const displayedServices =
    typeof maxItems === "number" ? visibleServices.slice(0, maxItems) : visibleServices;
  const hasMore =
    typeof maxItems === "number" &&
    visibleServices.length > maxItems &&
    Boolean(viewMoreHref);
  const cardUser = ownerAsAuthenticatedUser(owner);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {hasMore && viewMoreHref ? (
          <Button variant="outline" onClick={() => router.push(viewMoreHref)}>
            {messages.profile.viewMoreServices}
          </Button>
        ) : null}
      </div>

      {displayedServices.length === 0 ? (
        <div className={styles.empty}>
          <Icon icon="design_services" size={32} color="current" className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{emptyTitle}</p>
          <p className={styles.emptyDescription}>{emptyDescription}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              copy={messages.services}
              brands={brands}
              user={cardUser}
              showStatus={false}
              onClick={() => router.push(`/services?id=${service.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
