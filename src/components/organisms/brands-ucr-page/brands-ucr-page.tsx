"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BrandCard } from "@/components/molecules/brand-card";
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/atoms";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { proxyMediaUrl } from "@/lib/media";
import type { Brand } from "@/types/brand";
import type { PublicUserProfile } from "@/types";
import type { Service } from "@/types/service";
import styles from "./brands-ucr-page.module.css";

type BrandsUcrPageProps = {
  brands: Brand[];
  ownersById: Record<string, PublicUserProfile>;
  featuredServices?: Service[];
};

type BrandSection = {
  key: string;
  title: string;
  icon: string;
  brands: Brand[];
};

const PLACEHOLDER_IMAGE = "/banner1.jpg";
const PLACEHOLDER_AVATAR = "/reziphay-logo.png";

function getOwnerDisplayName(owner?: PublicUserProfile) {
  if (!owner) return "";

  const fullName = `${owner.first_name} ${owner.last_name}`.trim();
  return fullName || owner.email || "";
}

function BrandGrid({
  brands,
  ownersById,
  emptyLabel,
  reviewsSuffix,
  onSelect,
}: {
  brands: Brand[];
  ownersById: Record<string, PublicUserProfile>;
  emptyLabel: string;
  reviewsSuffix: string;
  onSelect: (id: string) => void;
}) {
  if (brands.length === 0) {
    return <div className={styles.empty}>{emptyLabel}</div>;
  }

  return (
    <div className={styles.grid}>
      {brands.map((brand) => {
        const owner = ownersById[brand.owner_id];
        const ownerName = getOwnerDisplayName(owner);

        return (
          <BrandCard
            key={brand.id}
            logo={{
              src:
                proxyMediaUrl(brand.logo_url) ??
                proxyMediaUrl(brand.gallery?.[0]?.url) ??
                PLACEHOLDER_IMAGE,
              alt: brand.name,
            }}
            backgroundImage={{
              src:
                proxyMediaUrl(brand.gallery?.[0]?.url ?? brand.logo_url) ??
                PLACEHOLDER_IMAGE,
              alt: brand.name,
            }}
            title={brand.name}
            description={brand.description ?? ""}
            category={brand.categories[0]?.name}
            badgeText={
              brand.rating_count > 0
                ? `${brand.rating_count} ${reviewsSuffix}`
                : undefined
            }
            author={{
              userId: owner?.id,
              name: ownerName || brand.name,
              avatar: proxyMediaUrl(owner?.avatar_url) ?? PLACEHOLDER_AVATAR,
              subtitle: owner?.email,
            }}
            rating={brand.rating}
            ratingCount={brand.rating_count}
            onClick={() => onSelect(brand.id)}
          />
        );
      })}
    </div>
  );
}

function buildSections(
  brands: Brand[],
  t: { topRated: string; mostRecent: string; explore: string },
): BrandSection[] {
  const recent = [...brands].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const topRated = [...brands]
    .filter((brand) => typeof brand.rating === "number" && brand.rating_count > 0)
    .sort((a, b) => {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return b.rating_count - a.rating_count;
    });

  const sections: BrandSection[] = [];

  if (topRated.length > 0) {
    sections.push({
      key: "top-rated",
      title: t.topRated,
      icon: "verified",
      brands: topRated.slice(0, 8),
    });
  }

  sections.push(
    {
      key: "most-recent",
      title: t.mostRecent,
      icon: "autorenew",
      brands: recent.slice(0, 8),
    },
    {
      key: "explore",
      title: t.explore,
      icon: "search",
      brands: brands.slice(0, 16),
    },
  );

  return sections;
}

type ServiceDiscoveryCopy = {
  featuredTitle: string;
  labelFree: string;
  labelFrom: string;
  labelDurationUnit: string;
  modalClose: string;
  modalDescription: string;
  modalCategory: string;
  modalPrice: string;
  modalDuration: string;
  modalAddress: string;
  modalBranch: string;
};

const EN_SVC_COPY: ServiceDiscoveryCopy = {
  featuredTitle: "Featured Services",
  labelFree: "Free",
  labelFrom: "From",
  labelDurationUnit: "min",
  modalClose: "Close",
  modalDescription: "Description",
  modalCategory: "Category",
  modalPrice: "Price",
  modalDuration: "Duration",
  modalAddress: "Address",
  modalBranch: "Branch",
};

const TR_SVC_COPY: ServiceDiscoveryCopy = {
  ...EN_SVC_COPY,
  featuredTitle: "Öne Çıkan Hizmetler",
  labelFree: "Ücretsiz",
  labelFrom: "Başlangıç",
  labelDurationUnit: "dk",
  modalClose: "Kapat",
  modalDescription: "Açıklama",
  modalCategory: "Kategori",
  modalPrice: "Fiyat",
  modalDuration: "Süre",
  modalAddress: "Adres",
  modalBranch: "Şube",
};

const AZ_SVC_COPY: ServiceDiscoveryCopy = {
  ...EN_SVC_COPY,
  featuredTitle: "Seçilmiş Xidmətlər",
  labelFree: "Pulsuz",
  labelFrom: "Başlangıcdan",
  labelDurationUnit: "dəq",
  modalClose: "Bağla",
  modalDescription: "Təsvir",
  modalCategory: "Kateqoriya",
  modalPrice: "Qiymət",
  modalDuration: "Müddət",
  modalAddress: "Ünvan",
  modalBranch: "Filial",
};

function getSvcCopy(locale: string): ServiceDiscoveryCopy {
  if (locale.startsWith("az")) return AZ_SVC_COPY;
  if (locale.startsWith("tr")) return TR_SVC_COPY;
  return EN_SVC_COPY;
}

function formatSvcPrice(service: Service, copy: ServiceDiscoveryCopy): string {
  if (service.price_type === "FREE") return copy.labelFree;
  if (service.price === null) return "—";
  if (service.price_type === "STARTING_FROM") return `${copy.labelFrom} ${service.price}`;
  return String(service.price);
}

function formatSvcDuration(minutes: number | null, unit: string): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} ${unit}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}${unit}` : `${h}h`;
}

export function BrandsUcrPage({ brands, ownersById, featuredServices = [] }: BrandsUcrPageProps) {
  const router = useRouter();
  const { locale, messages } = useLocale();
  const t = messages.brands;
  const svcCopy = getSvcCopy(locale);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  function handleSelect(id: string) {
    router.push(`/brands?id=${id}`);
  }

  const sections = buildSections(brands, t);
  const topServices = featuredServices.slice(0, 8);

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.discoverBrands}</h1>
      </div>

      {topServices.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Icon icon="design_services" size={18} color="current" className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>{svcCopy.featuredTitle}</h2>
          </div>
          <div className={styles.servicesGrid}>
            {topServices.map((svc) => {
              const priceLabel = formatSvcPrice(svc, svcCopy);
              const durationLabel = formatSvcDuration(svc.duration, svcCopy.labelDurationUnit);
              const firstImg = svc.images[0];
              const imgUrl = firstImg ? proxyMediaUrl(firstImg.url) : null;

              return (
                <button
                  key={svc.id}
                  type="button"
                  className={styles.serviceCard}
                  onClick={() => setSelectedService(svc)}
                >
                  {imgUrl ? (
                    <div className={styles.serviceCardThumb}>
                      <Image src={imgUrl} alt={svc.title} fill className={styles.serviceCardThumbImg} sizes="56px" />
                    </div>
                  ) : (
                    <div className={styles.serviceCardThumbPlaceholder}>
                      <Icon icon="design_services" size={18} color="current" />
                    </div>
                  )}
                  <div className={styles.serviceCardBody}>
                    <p className={styles.serviceCardTitle}>{svc.title}</p>
                    {svc.category ? (
                      <span className={styles.serviceCardCategory}>{svc.category}</span>
                    ) : null}
                    <div className={styles.serviceCardMeta}>
                      <span>{priceLabel}</span>
                      {durationLabel ? <span>{durationLabel}</span> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {sections.map((section) => (
        <section key={section.key} className={styles.section}>
          <div className={styles.sectionHeader}>
            <Icon
              icon={section.icon}
              size={18}
              color="current"
              className={styles.sectionIcon}
            />
            <h2 className={styles.sectionTitle}>{section.title}</h2>
          </div>
          <BrandGrid
            brands={section.brands}
            ownersById={ownersById}
            emptyLabel={t.noSectionBrands}
            reviewsSuffix={t.brandCardReviewsSuffix}
            onSelect={handleSelect}
          />
        </section>
      ))}

      <AlertDialog open={Boolean(selectedService)} onOpenChange={(open) => { if (!open) setSelectedService(null); }}>
        <AlertDialogContent className={styles.serviceModal}>
          {selectedService ? (
            <>
              <div className={styles.serviceModalHeader}>
                <div>
                  <h2 className={styles.serviceModalTitle}>{selectedService.title}</h2>
                  {selectedService.category ? (
                    <p className={styles.serviceModalCategory}>{selectedService.category}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={styles.serviceModalClose}
                  onClick={() => setSelectedService(null)}
                  aria-label={svcCopy.modalClose}
                >
                  <Icon icon="close" size={18} color="current" />
                </button>
              </div>

              <div className={styles.serviceModalBody}>
                {selectedService.description?.trim() ? (
                  <div className={styles.serviceModalField}>
                    <span className={styles.serviceModalLabel}>{svcCopy.modalDescription}</span>
                    <p className={styles.serviceModalText}>{selectedService.description.trim()}</p>
                  </div>
                ) : null}

                <div className={styles.serviceModalGrid}>
                  <div className={styles.serviceModalField}>
                    <span className={styles.serviceModalLabel}>{svcCopy.modalPrice}</span>
                    <p className={styles.serviceModalText}>{formatSvcPrice(selectedService, svcCopy)}</p>
                  </div>
                  {selectedService.duration ? (
                    <div className={styles.serviceModalField}>
                      <span className={styles.serviceModalLabel}>{svcCopy.modalDuration}</span>
                      <p className={styles.serviceModalText}>{formatSvcDuration(selectedService.duration, svcCopy.labelDurationUnit)}</p>
                    </div>
                  ) : null}
                  {selectedService.address ? (
                    <div className={styles.serviceModalField}>
                      <span className={styles.serviceModalLabel}>{svcCopy.modalAddress}</span>
                      <p className={styles.serviceModalText}>{selectedService.address}</p>
                    </div>
                  ) : null}
                </div>

                {selectedService.images.length > 0 ? (
                  <div className={styles.serviceModalImages}>
                    {selectedService.images.map((img) => {
                      const imgUrl = proxyMediaUrl(img.url);
                      if (!imgUrl) return null;
                      return (
                        <div key={img.id} className={styles.serviceModalImageFrame}>
                          <Image
                            src={imgUrl}
                            alt={selectedService.title}
                            fill
                            className={styles.serviceModalImage}
                            sizes="(max-width: 640px) 50vw, 160px"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
