"use client";

import { useRouter } from "next/navigation";
import { BrandCard } from "@/components/molecules/brand-card";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { proxyMediaUrl } from "@/lib/media";
import type { Brand } from "@/types/brand";
import styles from "./brands-ucr-page.module.css";

type BrandsUcrPageProps = {
  brands: Brand[];
};

type BrandSection = {
  key: string;
  title: string;
  icon: string;
  brands: Brand[];
};

const PLACEHOLDER_IMAGE = "/banner1.jpg";

function BrandGrid({
  brands,
  emptyLabel,
  onSelect,
}: {
  brands: Brand[];
  emptyLabel: string;
  onSelect: (id: string) => void;
}) {
  if (brands.length === 0) {
    return <div className={styles.empty}>{emptyLabel}</div>;
  }

  return (
    <div className={styles.grid}>
      {brands.map((brand) => (
        <BrandCard
          key={brand.id}
          image={{
            src: proxyMediaUrl(brand.gallery?.[0]?.url ?? brand.logo_url) ?? PLACEHOLDER_IMAGE,
            alt: brand.name,
          }}
          title={brand.name}
          description={brand.description ?? ""}
          author={{
            name: brand.name,
            avatar: proxyMediaUrl(brand.logo_url) ?? "/reziphay-logo.png",
          }}
          rating={brand.rating ?? 0}
          onClick={() => onSelect(brand.id)}
        />
      ))}
    </div>
  );
}

function buildSections(brands: Brand[], t: { mostRecent: string; explore: string }): BrandSection[] {
  const recent = [...brands].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Rating-based sections (Top Seller, Best of Week) are intentionally omitted until
  // real rating data is available from user reviews.
  return [
    {
      key: "most-recent",
      title: t.mostRecent,
      icon: "schedule",
      brands: recent.slice(0, 8),
    },
    {
      key: "explore",
      title: t.explore,
      icon: "explore",
      brands: brands.slice(0, 16),
    },
  ];
}

export function BrandsUcrPage({ brands }: BrandsUcrPageProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;

  function handleSelect(id: string) {
    router.push(`/brands?id=${id}`);
  }

  const sections = buildSections(brands, t);

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.discoverBrands}</h1>
      </div>

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
          <BrandGrid brands={section.brands} emptyLabel={t.noSectionBrands} onSelect={handleSelect} />
        </section>
      ))}
    </div>
  );
}
