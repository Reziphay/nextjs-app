"use client";

import { useRouter } from "next/navigation";
import { BrandCard } from "@/components/molecules/brand-card";
import { Icon } from "@/components/icon";
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
  onSelect,
}: {
  brands: Brand[];
  onSelect: (id: string) => void;
}) {
  if (brands.length === 0) {
    return <div className={styles.empty}>No brands in this section yet.</div>;
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

function buildSections(brands: Brand[]): BrandSection[] {
  const sorted = [...brands].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  );
  const recent = [...brands].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const bestOfWeek = brands
    .filter((b) => new Date(b.created_at).getTime() >= oneWeekAgo)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return [
    {
      key: "top-seller",
      title: "Top Seller",
      icon: "star",
      brands: sorted.slice(0, 8),
    },
    {
      key: "most-recent",
      title: "Most Recent",
      icon: "schedule",
      brands: recent.slice(0, 8),
    },
    {
      key: "best-of-week",
      title: "Best of Week",
      icon: "trending_up",
      brands: bestOfWeek.slice(0, 8),
    },
    {
      key: "explore",
      title: "Explore",
      icon: "explore",
      brands: brands.slice(0, 16),
    },
  ];
}

export function BrandsUcrPage({ brands }: BrandsUcrPageProps) {
  const router = useRouter();

  function handleSelect(id: string) {
    router.push(`/brands?id=${id}`);
  }

  const sections = buildSections(brands);

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Discover Brands</h1>
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
          <BrandGrid brands={section.brands} onSelect={handleSelect} />
        </section>
      ))}
    </div>
  );
}
