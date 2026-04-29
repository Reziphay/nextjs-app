"use client";

import { useMemo } from "react";
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

type StrategyCopy = {
  badge: string;
  title: string;
  description: string;
  focusTitle: string;
  focusDescription: string;
  metricBrands: string;
  metricBranches: string;
  metricTeamReady: string;
  metricServicePhase: string;
  metricServicePhaseValue: string;
  modelSectionTitle: string;
  modelSectionLead: string;
  modelIndividualTitle: string;
  modelIndividualStatus: string;
  modelIndividualBody: string;
  modelBrandTitle: string;
  modelBrandStatus: string;
  modelBrandBody: string;
  modelTeamTitle: string;
  modelTeamStatus: string;
  modelTeamBody: string;
  modelsFootnote: string;
  brandsSectionTitle: string;
  brandsSectionLead: string;
  emptyTitle: string;
  emptyDescription: string;
  createBrand: string;
  openBrands: string;
  editBrand: string;
  openTeam: string;
  addBranch: string;
  openBrand: string;
  branchLabel: string;
  statusLabel: string;
  categoriesLabel: string;
  noCategories: string;
  futureNoteTitle: string;
  futureNoteBody: string;
  statusPending: string;
  statusActive: string;
  statusRejected: string;
  statusClosed: string;
};

const EN_COPY: StrategyCopy = {
  badge: "Service architecture",
  title: "Prepare the structure before service creation launches",
  description:
    "The service module comes next. This page helps USOs choose the correct operating model now, so the future service domain lands on clean brand, branch, and team foundations.",
  focusTitle: "Current focus",
  focusDescription:
    "Brand and branch structure already exists. The missing operational layer is team management for branch-based ecosystems.",
  metricBrands: "Owned brands",
  metricBranches: "Total branches",
  metricTeamReady: "Brands ready for team setup",
  metricServicePhase: "Service phase",
  metricServicePhaseValue: "Next",
  modelSectionTitle: "Three operating models",
  modelSectionLead:
    "Reziphay is not locked to one business type. A user can begin alone, grow into a brand, then expand into a team ecosystem.",
  modelIndividualTitle: "Individual service model",
  modelIndividualStatus: "Service module next phase",
  modelIndividualBody:
    "A USO will later create services directly and attach them to an address without creating a brand first.",
  modelBrandTitle: "Brand and branch model",
  modelBrandStatus: "Structure ready now",
  modelBrandBody:
    "A USO becomes a brand owner, opens branches, and later creates services inside those branches.",
  modelTeamTitle: "Team ecosystem model",
  modelTeamStatus: "Frontend ready now",
  modelTeamBody:
    "A brand owner prepares branch teams now, then invited USOs will later publish their own services under the same branch.",
  modelsFootnote:
    "The growth path is deliberate: Address -> Branch -> Team. Service creation will be layered on top of that sequence.",
  brandsSectionTitle: "Your current brand lanes",
  brandsSectionLead:
    "Use the brands below to decide where team planning should happen before the backend team module and future service domain arrive.",
  emptyTitle: "You have not created a brand yet",
  emptyDescription:
    "You can still use the future individual model without a brand, but to prepare branch and team-based service flows, create your first brand now.",
  createBrand: "Create brand",
  openBrands: "Open brands",
  editBrand: "Edit brand",
  openTeam: "Open team workspace",
  addBranch: "Add branch first",
  openBrand: "Open brand",
  branchLabel: "Branches",
  statusLabel: "Status",
  categoriesLabel: "Categories",
  noCategories: "No categories yet",
  futureNoteTitle: "Why this matters before services",
  futureNoteBody:
    "Once services are introduced, the frontend should not guess structure on the fly. A service must clearly know whether it belongs to an individual owner, a branch, or an accepted team member inside that branch.",
  statusPending: "Pending",
  statusActive: "Active",
  statusRejected: "Rejected",
  statusClosed: "Closed",
};

const TR_COPY: StrategyCopy = {
  ...EN_COPY,
  badge: "Hizmet mimarisi",
  title: "Hizmet oluşturma gelmeden önce yapıyı hazırla",
  description:
    "Service modülü bir sonraki ana faz. Bu ekran, gelecekteki service domain'inin brand, branch ve team altyapısına temiz oturması için USO'ya bugünden doğru modeli seçtirir.",
  focusTitle: "Şu anki odak",
  focusDescription:
    "Brand ve branch yapısı mevcut. Eksik operasyon katmanı, şube bazlı ekosistemler için team yönetimidir.",
  metricBrands: "Sahip olunan markalar",
  metricBranches: "Toplam şube",
  metricTeamReady: "Takım kurulmaya hazır marka",
  metricServicePhase: "Service fazı",
  metricServicePhaseValue: "Sıradaki",
  modelSectionTitle: "Üç çalışma modeli",
  modelSectionLead:
    "Reziphay tek bir iş tipine bağlı değil. Kullanıcı bireysel başlayabilir, brand'e dönüşebilir ve ardından team ekosistemine büyüyebilir.",
  modelIndividualTitle: "Bireysel service modeli",
  modelIndividualStatus: "Service modülü sonraki faz",
  modelIndividualBody:
    "Bir USO gelecekte brand oluşturmadan doğrudan service yaratacak ve bunu bir address'e bağlayacak.",
  modelBrandTitle: "Brand ve branch modeli",
  modelBrandStatus: "Yapı bugün hazır",
  modelBrandBody:
    "Bir USO brand owner olur, branch açar ve daha sonra service'lerini bu branch'lerin içinde kurar.",
  modelTeamTitle: "Team ekosistem modeli",
  modelTeamStatus: "Frontend bugün hazır",
  modelTeamBody:
    "Brand owner bugün şube ekiplerini kurar; davet edilen USO'lar daha sonra aynı branch içinde kendi service'lerini yayınlar.",
  modelsFootnote:
    "Büyüme sırası bilinçli: Address -> Branch -> Team. Service oluşturma bu sıranın üstüne eklenecek.",
  brandsSectionTitle: "Mevcut brand alanların",
  brandsSectionLead:
    "Aşağıdaki brand'leri kullanarak backend team modülü ve gelecekteki service domain'i gelmeden önce takım planlamasını nerede yapacağını belirle.",
  emptyTitle: "Henüz bir brand oluşturmadın",
  emptyDescription:
    "Gelecekteki bireysel model için brandsiz de ilerleyebilirsin; ama branch ve team bazlı service akışını hazırlamak için ilk brand'ini şimdi oluştur.",
  createBrand: "Marka oluştur",
  openBrands: "Markaları aç",
  editBrand: "Markayı düzenle",
  openTeam: "Takım alanını aç",
  addBranch: "Önce şube ekle",
  openBrand: "Markayı aç",
  branchLabel: "Şube",
  statusLabel: "Durum",
  categoriesLabel: "Kategoriler",
  noCategories: "Henüz kategori yok",
  futureNoteTitle: "Bu neden services'ten önce önemli",
  futureNoteBody:
    "Service'ler geldiğinde frontend yapıyı o anda tahmin etmemeli. Bir service'in bireysel owner'a mı, branch'e mi, yoksa o branch içindeki kabul edilmiş bir team üyesine mi ait olduğu baştan net olmalı.",
  statusPending: "Beklemede",
  statusActive: "Aktif",
  statusRejected: "Reddedildi",
  statusClosed: "Kapalı",
};

const AZ_COPY: StrategyCopy = {
  ...EN_COPY,
  badge: "Service arxitekturası",
  title: "Service yaratma açılmadan əvvəl strukturu hazırla",
  description:
    "Service modulu növbəti əsas fazadır. Bu ekran gələcək service domain-in brand, branch və team altyapısına təmiz oturması üçün USO-ya bu gündən doğru modeli seçməyə kömək edir.",
  focusTitle: "Cari fokus",
  focusDescription:
    "Brand və branch strukturu artıq mövcuddur. Çatışmayan əməliyyat qatı isə filial əsaslı ekosistemlər üçün team idarəçiliyidir.",
  metricBrands: "Sahib olduğun brendlər",
  metricBranches: "Toplam filial",
  metricTeamReady: "Komanda qurmağa hazır brend",
  metricServicePhase: "Service fazı",
  metricServicePhaseValue: "Növbəti",
  modelSectionTitle: "Üç işləmə modeli",
  modelSectionLead:
    "Reziphay tək bir biznes tipinə bağlanmır. İstifadəçi fərdi başlaya, sonra brendə çevrilə və daha sonra team ekosisteminə böyüyə bilər.",
  modelIndividualTitle: "Fərdi service modeli",
  modelIndividualStatus: "Service modulu növbəti faza",
  modelIndividualBody:
    "Bir USO gələcəkdə brand yaratmadan birbaşa service quracaq və onu bir address-ə bağlayacaq.",
  modelBrandTitle: "Brand və branch modeli",
  modelBrandStatus: "Struktur indi hazırdır",
  modelBrandBody:
    "Bir USO brand owner olur, branch yaradır və daha sonra service-lərini həmin filialların içində qurur.",
  modelTeamTitle: "Team ekosistem modeli",
  modelTeamStatus: "Frontend indi hazırdır",
  modelTeamBody:
    "Brand owner indi filial komandalarını qurur; dəvət olunan USO-lar daha sonra eyni branch daxilində öz service-lərini yaradır.",
  modelsFootnote:
    "Böyümə sırası şüurludur: Address -> Branch -> Team. Service yaratma bu ardıcıllığın üzərinə gələcək.",
  brandsSectionTitle: "Mövcud brand xətlərin",
  brandsSectionLead:
    "Aşağıdakı brendlərdən istifadə edərək backend team modulu və gələcək service domain-i gəlməzdən əvvəl komanda planlamasını harada quracağını müəyyən et.",
  emptyTitle: "Hələ heç bir brand yaratmamısan",
  emptyDescription:
    "Gələcək fərdi model üçün brandsiz də işləmək mümkün olacaq; amma branch və team əsaslı service axınını hazırlamaq üçün ilk brand-ini indi yarat.",
  createBrand: "Brend yarat",
  openBrands: "Brendləri aç",
  editBrand: "Brendi redaktə et",
  openTeam: "Komanda sahəsini aç",
  addBranch: "Əvvəl filial əlavə et",
  openBrand: "Brendi aç",
  branchLabel: "Filial",
  statusLabel: "Status",
  categoriesLabel: "Kateqoriyalar",
  noCategories: "Hələ kateqoriya yoxdur",
  futureNoteTitle: "Bu niyə service-lərdən əvvəl vacibdir",
  futureNoteBody:
    "Service-lər gələndə frontend strukturu o anda təxmin etməməlidir. Bir service-in fərdi owner-ə, branch-ə, ya da həmin branch daxilində qəbul olunmuş team üzvünə aid olduğu əvvəlcədən aydın olmalıdır.",
  statusPending: "Gözləyir",
  statusActive: "Aktiv",
  statusRejected: "Rədd edildi",
  statusClosed: "Bağlıdır",
};

const RU_COPY: StrategyCopy = {
  ...EN_COPY,
  badge: "Архитектура сервисов",
  title: "Подготовьте структуру до запуска создания сервисов",
  description:
    "Модуль сервисов будет следующим этапом. Эта страница помогает USO уже сейчас выбрать правильную операционную модель, чтобы будущий домен сервисов лёг на чистую основу брендов, филиалов и команд.",
  focusTitle: "Текущий фокус",
  focusDescription:
    "Структура брендов и филиалов уже есть. Недостающий операционный слой — управление командами для филиальных экосистем.",
  metricBrands: "Ваши бренды",
  metricBranches: "Всего филиалов",
  metricTeamReady: "Бренды, готовые к командам",
  metricServicePhase: "Фаза сервисов",
  metricServicePhaseValue: "Следующая",
  modelSectionTitle: "Три рабочие модели",
  modelSectionLead:
    "Reziphay не привязан к одному типу бизнеса. Пользователь может начать индивидуально, вырасти в бренд, затем расшириться до командной экосистемы.",
  modelIndividualTitle: "Индивидуальная модель сервиса",
  modelIndividualStatus: "Модуль сервисов — следующий этап",
  modelIndividualBody:
    "USO позже сможет создавать сервисы напрямую и привязывать их к адресу без предварительного создания бренда.",
  modelBrandTitle: "Модель бренда и филиала",
  modelBrandStatus: "Структура уже готова",
  modelBrandBody:
    "USO становится владельцем бренда, открывает филиалы и позже создаёт сервисы внутри этих филиалов.",
  modelTeamTitle: "Командная экосистема",
  modelTeamStatus: "Фронтенд уже готов",
  modelTeamBody:
    "Владелец бренда заранее готовит команды филиалов, а приглашённые USO позже публикуют свои сервисы в том же филиале.",
  modelsFootnote:
    "Путь роста намеренный: адрес -> филиал -> команда. Создание сервисов будет добавлено поверх этой последовательности.",
  brandsSectionTitle: "Ваши текущие направления брендов",
  brandsSectionLead:
    "Используйте бренды ниже, чтобы определить, где нужно подготовить командную структуру до появления backend-модуля команд и будущего домена сервисов.",
  emptyTitle: "Вы ещё не создали бренд",
  emptyDescription:
    "Для будущей индивидуальной модели можно будет работать и без бренда, но для филиальных и командных сценариев стоит создать первый бренд сейчас.",
  createBrand: "Создать бренд",
  openBrands: "Открыть бренды",
  editBrand: "Редактировать бренд",
  openTeam: "Открыть команду",
  addBranch: "Сначала добавьте филиал",
  openBrand: "Открыть бренд",
  branchLabel: "Филиалы",
  statusLabel: "Статус",
  categoriesLabel: "Категории",
  noCategories: "Категорий пока нет",
  futureNoteTitle: "Почему это важно до сервисов",
  futureNoteBody:
    "Когда сервисы появятся, фронтенд не должен угадывать структуру на ходу. Сервис должен ясно знать, принадлежит ли он индивидуальному владельцу, филиалу или принятому участнику команды внутри филиала.",
  statusPending: "Ожидает",
  statusActive: "Активен",
  statusRejected: "Отклонён",
  statusClosed: "Закрыт",
};

function getCopy(locale: string): StrategyCopy {
  if (locale.startsWith("az")) {
    return AZ_COPY;
  }

  if (locale.startsWith("ru")) {
    return RU_COPY;
  }

  if (locale.startsWith("tr")) {
    return TR_COPY;
  }

  return EN_COPY;
}

function getBrandStatusLabel(copy: StrategyCopy, status: Brand["status"]) {
  switch (status) {
    case "ACTIVE":
      return copy.statusActive;
    case "REJECTED":
      return copy.statusRejected;
    case "CLOSED":
      return copy.statusClosed;
    case "PENDING":
    default:
      return copy.statusPending;
  }
}

export function ServicesStrategyPage({
  brands,
}: ServicesStrategyPageProps) {
  const router = useRouter();
  const { locale, messages } = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);

  const totalBranches = useMemo(
    () => brands.reduce((sum, brand) => sum + (brand.branches?.length ?? 0), 0),
    [brands],
  );
  const teamReadyBrands = useMemo(
    () => brands.filter((brand) => (brand.branches?.length ?? 0) > 0).length,
    [brands],
  );

  const modelCards = [
    {
      icon: "person",
      title: copy.modelIndividualTitle,
      status: copy.modelIndividualStatus,
      body: copy.modelIndividualBody,
    },
    {
      icon: "sell",
      title: copy.modelBrandTitle,
      status: copy.modelBrandStatus,
      body: copy.modelBrandBody,
    },
    {
      icon: "groups",
      title: copy.modelTeamTitle,
      status: copy.modelTeamStatus,
      body: copy.modelTeamBody,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Badge icon="route" variant="outline" className={styles.heroBadge}>
            {copy.badge}
          </Badge>
          <h1 className={styles.heroTitle}>{copy.title}</h1>
          <p className={styles.heroDescription}>{copy.description}</p>
        </div>

        <aside className={styles.heroAside}>
          <div className={styles.focusCard}>
            <span className={styles.focusLabel}>{copy.focusTitle}</span>
            <p className={styles.focusBody}>{copy.focusDescription}</p>
          </div>
        </aside>
      </section>

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{copy.metricBrands}</span>
          <strong className={styles.metricValue}>{brands.length}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{copy.metricBranches}</span>
          <strong className={styles.metricValue}>{totalBranches}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{copy.metricTeamReady}</span>
          <strong className={styles.metricValue}>{teamReadyBrands}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>{copy.metricServicePhase}</span>
          <strong className={styles.metricValue}>
            {copy.metricServicePhaseValue}
          </strong>
        </article>
      </section>

      <section className={styles.modelsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{copy.modelSectionTitle}</h2>
          <p className={styles.sectionLead}>{copy.modelSectionLead}</p>
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

        <p className={styles.modelsFootnote}>{copy.modelsFootnote}</p>
      </section>

      <section className={styles.brandsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{copy.brandsSectionTitle}</h2>
          <p className={styles.sectionLead}>{copy.brandsSectionLead}</p>
        </div>

        {brands.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>{copy.emptyTitle}</h3>
            <p className={styles.emptyDescription}>{copy.emptyDescription}</p>
            <div className={styles.emptyActions}>
              <Button
                variant="primary"
                icon="add"
                onClick={() => router.push("/brands?progress=create")}
              >
                {copy.createBrand}
              </Button>
              <Button
                variant="outline"
                icon="sell"
                onClick={() => router.push("/brands")}
              >
                {copy.openBrands}
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
                  : copy.noCategories;

              return (
                <article key={brand.id} className={styles.brandCard}>
                  <div className={styles.brandCardTop}>
                    <div>
                      <h3 className={styles.brandName}>{brand.name}</h3>
                      <p className={styles.brandDescription}>
                        {brand.description?.trim() || copy.futureNoteBody}
                      </p>
                    </div>

                    <Badge variant="outline">
                      {getBrandStatusLabel(copy, brand.status)}
                    </Badge>
                  </div>

                  <div className={styles.brandFacts}>
                    <span>
                      <strong>{copy.branchLabel}:</strong> {branchCount}
                    </span>
                    <span>
                      <strong>{copy.statusLabel}:</strong>{" "}
                      {getBrandStatusLabel(copy, brand.status)}
                    </span>
                    <span>
                      <strong>{copy.categoriesLabel}:</strong> {categories}
                    </span>
                  </div>

                  <div className={styles.brandActions}>
                    <Button
                      variant="outline"
                      size="small"
                      icon="sell"
                      onClick={() => router.push(`/brands?id=${brand.id}`)}
                    >
                      {copy.openBrand}
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
                        {copy.openTeam}
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
                        {copy.addBranch}
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
                      {copy.editBrand}
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
          <h2 className={styles.sectionTitle}>{copy.futureNoteTitle}</h2>
          <p className={styles.sectionLead}>{copy.futureNoteBody}</p>
        </div>
      </section>
    </div>
  );
}
