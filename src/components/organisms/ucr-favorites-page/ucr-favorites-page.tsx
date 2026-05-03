"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms";
import { Icon } from "@/components/icon";
import { UserAvatar } from "@/components/molecules/user-avatar/user-avatar";
import { ServiceCard } from "@/components/organisms/services-uso-page/services-uso-page";
import { useLocale } from "@/components/providers/locale-provider";
import {
  removeFavoriteBrand,
  removeFavoriteService,
} from "@/lib/favorites-api";
import { proxyMediaUrl } from "@/lib/media";
import type { Brand, Branch, PublicUserProfile } from "@/types";
import type { Service } from "@/types/service";
import type { UserProfile } from "@/types/user_types";
import styles from "./ucr-favorites-page.module.css";

type UcrFavoritesPageProps = {
  user: UserProfile;
  accessToken: string;
  services: Service[];
  brands: Brand[];
  serviceBrands: Brand[];
  ownersById: Record<string, PublicUserProfile>;
};

type ServiceWithContext = {
  service: Service;
  owner?: PublicUserProfile;
};

const PLACEHOLDER_IMAGE = "/banner1.jpg";
const PLACEHOLDER_LOGO = "/reziphay-logo.png";

function branchLookup(brands: Brand[]) {
  const map = new Map<string, { brand: Brand; branch: Branch }>();

  for (const brand of brands) {
    for (const branch of brand.branches ?? []) {
      map.set(branch.id, { brand, branch });
    }
  }

  return map;
}

function imageForBrand(brand: Brand) {
  return (
    proxyMediaUrl(brand.gallery?.[0]?.url) ??
    proxyMediaUrl(brand.logo_url) ??
    PLACEHOLDER_IMAGE
  );
}

function logoForBrand(brand: Brand) {
  return proxyMediaUrl(brand.logo_url) ?? PLACEHOLDER_LOGO;
}

function getProfileName(owner?: PublicUserProfile) {
  return `${owner?.first_name ?? ""} ${owner?.last_name ?? ""}`.trim();
}

function getProfileInitials(owner?: PublicUserProfile) {
  return `${owner?.first_name?.[0] ?? ""}${owner?.last_name?.[0] ?? ""}`.toUpperCase() || "?";
}

function FavoriteRemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="unstyled"
      type="button"
      className={styles.favoriteButton}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon icon="favorite" size={15} color="current" fill />
    </Button>
  );
}

function BrandFavoriteCard({
  brand,
  owner,
  onRemove,
}: {
  brand: Brand;
  owner?: PublicUserProfile;
  onRemove: () => void;
}) {
  const { messages } = useLocale();
  const ownerName = getProfileName(owner);

  return (
    <article className={styles.brandCard}>
      <Link href={`/brands?id=${brand.id}`} className={styles.cardOverlay} aria-label={brand.name} />
      <div className={styles.cardAction}>
        <FavoriteRemoveButton label={messages.marketplace.removeFavorite} onClick={onRemove} />
      </div>
      <div className={styles.brandCover}>
        <Image src={imageForBrand(brand)} alt={brand.name} fill className={styles.brandImage} sizes="280px" />
        {brand.categories[0] ? (
          <span className={styles.brandBadge}>
            {messages.categories[brand.categories[0].key as keyof typeof messages.categories] ?? brand.categories[0].key}
          </span>
        ) : null}
      </div>
      <div className={styles.brandBody}>
        <Image src={logoForBrand(brand)} alt="" width={42} height={42} className={styles.brandLogo} />
        <div className={styles.brandInfo}>
          <h3>{brand.name}</h3>
          <p>{brand.rating ? `${brand.rating.toFixed(1)} · ${brand.rating_count}` : messages.marketplace.newBrand}</p>
          {owner ? (
            <Link href={`/account?id=${owner.id}`} className={styles.ownerLink}>
              <UserAvatar
                initials={getProfileInitials(owner)}
                src={owner.avatar_url}
                size="sm"
                className={styles.ownerAvatar}
              />
              <span>{ownerName || owner.email}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function UcrFavoritesPage({
  user,
  accessToken,
  services,
  brands,
  serviceBrands,
  ownersById,
}: UcrFavoritesPageProps) {
  const { messages } = useLocale();
  const t = messages.marketplace;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"services" | "brands">("services");
  const [serviceItems, setServiceItems] = useState(services);
  const [brandItems, setBrandItems] = useState(brands);
  const allKnownBrands = useMemo(() => {
    const map = new Map<string, Brand>();
    [...brands, ...serviceBrands].forEach((brand) => map.set(brand.id, brand));
    return [...map.values()];
  }, [brands, serviceBrands]);
  const branchMap = useMemo(() => branchLookup(allKnownBrands), [allKnownBrands]);
  const servicesWithContext = useMemo<ServiceWithContext[]>(
    () =>
      serviceItems.map((service) => {
        const branchContext = service.branch_id ? branchMap.get(service.branch_id) : undefined;
        return {
          service,
          owner: ownersById[service.owner_id] ?? ownersById[branchContext?.brand.owner_id ?? ""],
        };
      }),
    [branchMap, ownersById, serviceItems],
  );

  function ownerAsCardUser(item: ServiceWithContext) {
    const owner = item.owner;
    return {
      id: owner?.id ?? item.service.owner_id,
      email: owner?.email ?? "",
      type: "uso" as const,
      first_name: owner?.first_name ?? "",
      last_name: owner?.last_name ?? "",
      email_verified: false,
      avatar_url: owner?.avatar_url ?? null,
    };
  }

  function removeService(serviceId: string) {
    setServiceItems((current) => current.filter((service) => service.id !== serviceId));
    void removeFavoriteService(serviceId, accessToken);
  }

  function removeBrand(brandId: string) {
    setBrandItems((current) => current.filter((brand) => brand.id !== brandId));
    void removeFavoriteBrand(brandId, accessToken);
  }

  const empty = activeTab === "services" ? serviceItems.length === 0 : brandItems.length === 0;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>{user.first_name}</span>
          <h1>{t.myFavorites}</h1>
          <p>{t.noFavoritesDescription}</p>
        </div>
        <div className={styles.tabs} role="tablist" aria-label={t.myFavorites}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "services"}
            data-active={activeTab === "services"}
            onClick={() => setActiveTab("services")}
          >
            {t.favoriteServices}
            <span>{serviceItems.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "brands"}
            data-active={activeTab === "brands"}
            onClick={() => setActiveTab("brands")}
          >
            {t.favoriteBrands}
            <span>{brandItems.length}</span>
          </button>
        </div>
      </header>

      {empty ? (
        <section className={styles.emptyState}>
          <h2>{t.noFavoritesTitle}</h2>
          <p>{t.noFavoritesDescription}</p>
          <Link href="/home">
            {t.seeAll}
            <Icon icon="arrow_forward" size={14} color="current" />
          </Link>
        </section>
      ) : activeTab === "services" ? (
        <section className={styles.serviceGrid}>
          {servicesWithContext.map((item) => (
            <ServiceCard
              key={item.service.id}
              service={item.service}
              copy={messages.services}
              brands={allKnownBrands}
              user={ownerAsCardUser(item)}
              showStatus={false}
              favoriteSlot={(
                <FavoriteRemoveButton
                  label={t.removeFavorite}
                  onClick={() => removeService(item.service.id)}
                />
              )}
              onClick={() => router.push(`/services?id=${item.service.id}`)}
            />
          ))}
        </section>
      ) : (
        <section className={styles.brandGrid}>
          {brandItems.map((brand) => (
            <BrandFavoriteCard
              key={brand.id}
              brand={brand}
              owner={ownersById[brand.owner_id]}
              onRemove={() => removeBrand(brand.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
