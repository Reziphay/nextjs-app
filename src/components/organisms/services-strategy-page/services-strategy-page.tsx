"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import type { Brand } from "@/types/brand";
import styles from "./services-strategy-page.module.css";

type ServicesStrategyPageProps = {
  brands: Brand[];
};


function getBrandStatusLabel(t: { statusActive: string; statusRejected: string; statusClosed: string; statusPending: string }, status: Brand["status"]) {
  switch (status) {
    case "ACTIVE":
      return t.statusActive;
    case "REJECTED":
      return t.statusRejected;
    case "CLOSED":
      return t.statusClosed;
    case "PENDING":
    default:
      return t.statusPending;
  }
}

export function ServicesStrategyPage({
  brands,
}: ServicesStrategyPageProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;

  const totalBranches = brands.reduce((sum, brand) => sum + (brand.branches?.length ?? 0), 0);
  const teamReadyBrands = brands.filter((brand) => (brand.branches?.length ?? 0) > 0).length;

  const modelCards = [
    {
      icon: "person",
      title: t.strategyModelIndividualTitle,
      status: t.strategyModelIndividualStatus,
      body: t.strategyModelIndividualBody,
    },
    {
      icon: "sell",
      title: t.strategyModelBrandTitle,
      status: t.strategyModelBrandStatus,
      body: t.strategyModelBrandBody,
    },
    {
      icon: "groups",
      title: t.strategyModelTeamTitle,
      status: t.strategyModelTeamStatus,
      body: t.strategyModelTeamBody,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Badge icon="route" variant="outline" className={styles.heroBadge}>
            {t.strategyBadge}
          </Badge>
          <h1 className={styles.heroTitle}>{t.strategyTitle}</h1>
          <p className={styles.heroDescription}>{t.strategyDescription}</p>
        </div>

        <aside className={styles.heroAside}>
          <div className={styles.focusCard}>
            <span className={styles.focusLabel}>{t.strategyFocusTitle}</span>
            <p className={styles.focusBody}>{t.strategyFocusDescription}</p>
          </div>
        </aside>
      </section>

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{t.strategyMetricBrands}</span>
          <strong className={styles.metricValue}>{brands.length}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{t.strategyMetricBranches}</span>
          <strong className={styles.metricValue}>{totalBranches}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{t.strategyMetricTeamReady}</span>
          <strong className={styles.metricValue}>{teamReadyBrands}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{t.strategyMetricServicePhase}</span>
          <strong className={styles.metricValue}>
            {t.strategyMetricServicePhaseValue}
          </strong>
        </article>
      </section>

      <section className={styles.modelsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.strategyModelSectionTitle}</h2>
          <p className={styles.sectionLead}>{t.strategyModelSectionLead}</p>
        </div>

        <div className={styles.modelGrid}>
          {modelCards.map((card) => (
            <article key={card.title} className={styles.modelCard}>
              <div className={styles.modelTop}>
                <div className={styles.modelIcon}>
                  <Icon icon={card.icon} size={18} color="current" />
                </div>
                <Badge variant="outline">{card.status}</Badge>
              </div>
              <h3 className={styles.modelTitle}>{card.title}</h3>
              <p className={styles.modelBody}>{card.body}</p>
            </article>
          ))}
        </div>

        <p className={styles.modelsFootnote}>{t.strategyModelsFootnote}</p>
      </section>

      <section className={styles.brandsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.strategyBrandsSectionTitle}</h2>
          <p className={styles.sectionLead}>{t.strategyBrandsSectionLead}</p>
        </div>

        {brands.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>{t.strategyEmptyTitle}</h3>
            <p className={styles.emptyDescription}>{t.strategyEmptyDescription}</p>
            <div className={styles.emptyActions}>
              <Button
                variant="primary"
                icon="add"
                onClick={() => router.push("/brands?progress=create")}
              >
                {t.strategyCreateBrand}
              </Button>
              <Button
                variant="outline"
                icon="sell"
                onClick={() => router.push("/brands")}
              >
                {t.strategyOpenBrands}
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => {
              const branchCount = brand.branches?.length ?? 0;
              const categories =
                brand.categories.length > 0
                  ? brand.categories.map((category) => messages.categories[category.key as keyof typeof messages.categories] ?? category.key).join(", ")
                  : t.strategyNoCategories;

              return (
                <article key={brand.id} className={styles.brandCard}>
                  <div className={styles.brandCardTop}>
                    <div>
                      <h3 className={styles.brandName}>{brand.name}</h3>
                      <p className={styles.brandDescription}>
                        {brand.description?.trim() || t.strategyFutureNoteBody}
                      </p>
                    </div>

                    <Badge variant="outline">
                      {getBrandStatusLabel(t, brand.status)}
                    </Badge>
                  </div>

                  <div className={styles.brandFacts}>
                    <span>
                      <strong>{t.strategyBranchLabel}:</strong> {branchCount}
                    </span>
                    <span>
                      <strong>{t.strategyStatusLabel}:</strong>{" "}
                      {getBrandStatusLabel(t, brand.status)}
                    </span>
                    <span>
                      <strong>{t.strategyCategoriesLabel}:</strong> {categories}
                    </span>
                  </div>

                  <div className={styles.brandActions}>
                    <Button
                      variant="outline"
                      size="small"
                      icon="sell"
                      onClick={() => router.push(`/brands?id=${brand.id}`)}
                    >
                      {t.strategyOpenBrand}
                    </Button>

                    {branchCount > 0 ? (
                      <Button
                        variant="primary"
                        size="small"
                        icon="groups"
                        onClick={() =>
                          router.push(`/brands?progress=team&id=${brand.id}`)
                        }
                      >
                        {t.strategyOpenTeam}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="small"
                        icon="account_tree"
                        onClick={() =>
                          router.push(`/brands?progress=edit&id=${brand.id}`)
                        }
                      >
                        {t.addBranch}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="small"
                      icon="edit_square"
                      onClick={() =>
                        router.push(`/brands?progress=edit&id=${brand.id}`)
                      }
                    >
                      {t.editBrand}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.futureNote}>
        <div className={styles.futureNoteIcon}>
          <Icon icon="construction" size={18} color="current" />
        </div>
        <div className={styles.futureNoteCopy}>
          <h2 className={styles.sectionTitle}>{t.strategyFutureNoteTitle}</h2>
          <p className={styles.sectionLead}>{t.strategyFutureNoteBody}</p>
        </div>
      </section>
    </div>
  );
}
