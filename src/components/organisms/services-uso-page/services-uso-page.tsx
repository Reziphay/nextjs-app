"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { isAxiosError } from "axios";
import {
  Badge,
  Button,
  Field,
  FieldLabel,
  FieldContent,
  Input,
} from "@/components/atoms";
import { Combobox, type ComboboxOption } from "@/components/atoms/combobox";
import { ImageCropModal } from "@/components/atoms/image-crop-modal/image-crop-modal";
import { Switch } from "@/components/atoms/switch";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import {
  createService,
  updateService,
  deleteService,
  submitService,
  pauseService,
  resumeService,
  archiveService,
  uploadServiceMedia,
  type CreateServicePayload,
  type UpdateServicePayload,
} from "@/lib/services-api";
import { proxyMediaUrl } from "@/lib/media";
import type { Brand, Branch } from "@/types/brand";
import type { Service, ServiceCategory, ServiceStatus, PriceType } from "@/types/service";
import styles from "./services-uso-page.module.css";

type ServicesUsoPageProps = {
  services: Service[];
  brands: Brand[];
  accessToken: string;
  serviceCategories: ServiceCategory[];
};

type ServiceFormState = {
  title: string;
  description: string;
  service_category_id: string;
  contextType: "individual" | "branch";
  address: string;
  brandId: string;
  branchId: string;
  duration: string;
  price_type: PriceType;
  price: string;
  image_media_ids: string[];
  imagePreviews: string[];
};

type PageCopy = {
  pageTitle: string;
  createService: string;
  emptyTitle: string;
  emptyDescription: string;
  statusDraft: string;
  statusPending: string;
  statusActive: string;
  statusRejected: string;
  statusPaused: string;
  statusArchived: string;
  actionEdit: string;
  actionSubmit: string;
  actionDelete: string;
  actionResubmit: string;
  actionPause: string;
  actionResume: string;
  actionArchive: string;
  formTitleCreate: string;
  formTitleEdit: string;
  fieldTitle: string;
  fieldTitlePlaceholder: string;
  fieldDescription: string;
  fieldDescriptionPlaceholder: string;
  fieldCategory: string;
  fieldCategoryPlaceholder: string;
  fieldContext: string;
  contextIndividual: string;
  contextBranch: string;
  fieldAddress: string;
  fieldAddressPlaceholder: string;
  fieldBrand: string;
  fieldBrandPlaceholder: string;
  fieldBranch: string;
  fieldBranchPlaceholder: string;
  fieldDuration: string;
  fieldDurationPlaceholder: string;
  fieldDurationUnit: string;
  fieldPriceType: string;
  priceTypeFixed: string;
  priceTypeStartingFrom: string;
  priceTypeFree: string;
  fieldPrice: string;
  fieldPricePlaceholder: string;
  fieldImages: string;
  fieldImagesHint: string;
  btnSave: string;
  btnCancel: string;
  labelRejectionReason: string;
  labelCategory: string;
  labelDuration: string;
  labelPrice: string;
  labelBranch: string;
  labelIndividual: string;
  successCreate: string;
  successUpdate: string;
  successDelete: string;
  successSubmit: string;
  successPause: string;
  successResume: string;
  successArchive: string;
  errorGeneric: string;
  confirmDelete: string;
  pendingNote: string;
  selectBrandFirst: string;
};

const EN_COPY: PageCopy = {
  pageTitle: "My Services",
  createService: "Create service",
  emptyTitle: "No services yet",
  emptyDescription: "Create your first service to start offering it to customers.",
  statusDraft: "Draft",
  statusPending: "Pending",
  statusActive: "Active",
  statusRejected: "Rejected",
  statusPaused: "Paused",
  statusArchived: "Archived",
  actionEdit: "Edit",
  actionSubmit: "Submit for review",
  actionDelete: "Delete",
  actionResubmit: "Resubmit",
  actionPause: "Pause",
  actionResume: "Resume",
  actionArchive: "Archive",
  formTitleCreate: "Create service",
  formTitleEdit: "Edit service",
  fieldTitle: "Title",
  fieldTitlePlaceholder: "e.g. Haircut & Styling",
  fieldDescription: "Description",
  fieldDescriptionPlaceholder: "Describe your service…",
  fieldCategory: "Category",
  fieldCategoryPlaceholder: "e.g. Hair, Nails, Massage",
  fieldContext: "Service context",
  contextIndividual: "Provided at my own location or address",
  contextBranch: "Branch-based service",
  fieldAddress: "Address",
  fieldAddressPlaceholder: "Where the service is provided",
  fieldBrand: "Brand",
  fieldBrandPlaceholder: "Select a brand",
  fieldBranch: "Branch",
  fieldBranchPlaceholder: "Select a branch",
  fieldDuration: "Duration",
  fieldDurationPlaceholder: "e.g. 60",
  fieldDurationUnit: "min",
  fieldPriceType: "Pricing & duration",
  priceTypeFixed: "Fixed",
  priceTypeStartingFrom: "Starting from",
  priceTypeFree: "Free",
  fieldPrice: "Price",
  fieldPricePlaceholder: "0.00",
  fieldImages: "Photos",
  fieldImagesHint: "Add photos of your service (JPEG or PNG, max 5)",
  btnSave: "Save service",
  btnCancel: "Cancel",
  labelRejectionReason: "Rejection reason",
  labelCategory: "Category",
  labelDuration: "Duration",
  labelPrice: "Price",
  labelBranch: "Branch",
  labelIndividual: "Individual",
  successCreate: "Service created.",
  successUpdate: "Service updated.",
  successDelete: "Service deleted.",
  successSubmit: "Submitted for review.",
  successPause: "Service paused.",
  successResume: "Service resumed.",
  successArchive: "Service archived.",
  errorGeneric: "Something went wrong. Please try again.",
  confirmDelete: "Are you sure you want to delete this service?",
  pendingNote: "Under review — no actions available.",
  selectBrandFirst: "Select a brand first",
};

const TR_COPY: PageCopy = {
  ...EN_COPY,
  pageTitle: "Hizmetlerim",
  createService: "Hizmet oluştur",
  emptyTitle: "Henüz hizmet yok",
  emptyDescription: "Müşterilere sunum yapmak için ilk hizmetini oluştur.",
  statusDraft: "Taslak",
  statusPending: "Beklemede",
  statusActive: "Aktif",
  statusRejected: "Reddedildi",
  statusPaused: "Durduruldu",
  statusArchived: "Arşivlendi",
  actionEdit: "Düzenle",
  actionSubmit: "İncelemeye gönder",
  actionDelete: "Sil",
  actionResubmit: "Yenidən gönder",
  actionPause: "Durdur",
  actionResume: "Devam et",
  actionArchive: "Arşivle",
  formTitleCreate: "Hizmet oluştur",
  formTitleEdit: "Hizmeti düzenle",
  fieldTitle: "Başlık",
  fieldTitlePlaceholder: "ör. Saç Kesimi & Şekillendirme",
  fieldDescription: "Açıklama",
  fieldDescriptionPlaceholder: "Hizmetini açıkla…",
  fieldCategory: "Kategori",
  fieldCategoryPlaceholder: "ör. Saç, Tırnak, Masaj",
  fieldContext: "Hizmet bağlamı",
  contextIndividual: "Kendi konumum veya adresimde sunuluyor",
  contextBranch: "Şube bazlı hizmet",
  fieldAddress: "Adres",
  fieldAddressPlaceholder: "Hizmetin verileceği yer",
  fieldBrand: "Marka",
  fieldBrandPlaceholder: "Marka seç",
  fieldBranch: "Şube",
  fieldBranchPlaceholder: "Şube seç",
  fieldDuration: "Süre",
  fieldDurationPlaceholder: "ör. 60",
  fieldDurationUnit: "dk",
  fieldPriceType: "Fiyatlandırma & süre",
  priceTypeFixed: "Sabit",
  priceTypeStartingFrom: "Başlangıç",
  priceTypeFree: "Ücretsiz",
  fieldPrice: "Fiyat",
  fieldPricePlaceholder: "0.00",
  fieldImages: "Fotoğraflar",
  fieldImagesHint: "Hizmetinle ilgili fotoğraf ekle (JPEG veya PNG, max 5)",
  btnSave: "Hizmeti kaydet",
  btnCancel: "İptal",
  labelRejectionReason: "Reddedilme nedeni",
  labelCategory: "Kategori",
  labelDuration: "Süre",
  labelPrice: "Fiyat",
  labelBranch: "Şube",
  labelIndividual: "Bireysel",
  successCreate: "Hizmet oluşturuldu.",
  successUpdate: "Hizmet güncellendi.",
  successDelete: "Hizmet silindi.",
  successSubmit: "İncelemeye gönderildi.",
  successPause: "Hizmet durduruldu.",
  successResume: "Hizmet devam ediyor.",
  successArchive: "Hizmet arşivlendi.",
  errorGeneric: "Bir şeyler ters gitti. Lütfen tekrar dene.",
  confirmDelete: "Bu hizmeti silmek istediğinden emin misin?",
  pendingNote: "İnceleniyor — işlem yapılamaz.",
  selectBrandFirst: "Önce marka seç",
};

const AZ_COPY: PageCopy = {
  ...EN_COPY,
  pageTitle: "Xidmətlərim",
  createService: "Xidmət yarat",
  emptyTitle: "Hələ xidmət yoxdur",
  emptyDescription: "Müştərilərə təklif etmək üçün ilk xidmətini yarat.",
  statusDraft: "Qaralama",
  statusPending: "Gözləyir",
  statusActive: "Aktiv",
  statusRejected: "Rədd edildi",
  statusPaused: "Dayandırıldı",
  statusArchived: "Arxivləşdirildi",
  actionEdit: "Redaktə et",
  actionSubmit: "İcazəyə göndər",
  actionDelete: "Sil",
  actionResubmit: "Yenidən göndər",
  actionPause: "Dayandır",
  actionResume: "Davam et",
  actionArchive: "Arxivlə",
  formTitleCreate: "Xidmət yarat",
  formTitleEdit: "Xidməti redaktə et",
  fieldTitle: "Başlıq",
  fieldTitlePlaceholder: "məs. Saç kəsimi & düzəlişi",
  fieldDescription: "Təsvir",
  fieldDescriptionPlaceholder: "Xidmətini təsvir et…",
  fieldCategory: "Kateqoriya",
  fieldCategoryPlaceholder: "məs. Saç, Dırnaq, Masaj",
  fieldContext: "Xidmət konteksti",
  contextIndividual: "Öz lokasiyamda və ya ünvanımda təklif olunur",
  contextBranch: "Filial əsaslı xidmət",
  fieldAddress: "Ünvan",
  fieldAddressPlaceholder: "Xidmətin göstəriləcəyi yer",
  fieldBrand: "Brend",
  fieldBrandPlaceholder: "Brend seç",
  fieldBranch: "Filial",
  fieldBranchPlaceholder: "Filial seç",
  fieldDuration: "Müddət",
  fieldDurationPlaceholder: "məs. 60",
  fieldDurationUnit: "dəq",
  fieldPriceType: "Qiymətləndirmə & müddət",
  priceTypeFixed: "Sabit",
  priceTypeStartingFrom: "Başlanğıc",
  priceTypeFree: "Pulsuz",
  fieldPrice: "Qiymət",
  fieldPricePlaceholder: "0.00",
  fieldImages: "Fotolar",
  fieldImagesHint: "Xidmətinlə bağlı foto əlavə et (JPEG və ya PNG, max 5)",
  btnSave: "Xidməti saxla",
  btnCancel: "Ləğv et",
  labelRejectionReason: "Rədd səbəbi",
  labelCategory: "Kateqoriya",
  labelDuration: "Müddət",
  labelPrice: "Qiymət",
  labelBranch: "Filial",
  labelIndividual: "Fərdi",
  successCreate: "Xidmət yaradıldı.",
  successUpdate: "Xidmət yeniləndi.",
  successDelete: "Xidmət silindi.",
  successSubmit: "İcazəyə göndərildi.",
  successPause: "Xidmət dayandırıldı.",
  successResume: "Xidmət davam edir.",
  successArchive: "Xidmət arxivləndi.",
  errorGeneric: "Nəsə xəta baş verdi. Yenidən cəhd et.",
  confirmDelete: "Bu xidməti silmək istədiyindən əminsən?",
  pendingNote: "İcazə gözlənilir — heç bir əməliyyat mümkün deyil.",
  selectBrandFirst: "Əvvəlcə brend seç",
};

function getCopy(locale: string): PageCopy {
  if (locale.startsWith("az")) return AZ_COPY;
  if (locale.startsWith("tr")) return TR_COPY;
  return EN_COPY;
}

const STATUS_BADGE_VARIANT: Record<
  ServiceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "secondary",
  PENDING: "default",
  ACTIVE: "outline",
  REJECTED: "destructive",
  PAUSED: "secondary",
  ARCHIVED: "secondary",
};

function formatPrice(service: Service, copy: PageCopy): string {
  if (service.price_type === "FREE") return copy.priceTypeFree;
  if (service.price === null) return "—";
  const prefix = service.price_type === "STARTING_FROM" ? `${copy.priceTypeStartingFrom} ` : "";
  return `${prefix}${service.price}`;
}

function formatDuration(minutes: number | null, unit: string): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} ${unit}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}${unit}` : `${h}h`;
}

function getStatusLabel(status: ServiceStatus, copy: PageCopy): string {
  const map: Record<ServiceStatus, string> = {
    DRAFT: copy.statusDraft,
    PENDING: copy.statusPending,
    ACTIVE: copy.statusActive,
    REJECTED: copy.statusRejected,
    PAUSED: copy.statusPaused,
    ARCHIVED: copy.statusArchived,
  };
  return map[status];
}

function getBranchById(brands: Brand[], branchId: string): Branch | undefined {
  for (const brand of brands) {
    const branch = brand.branches?.find((b) => b.id === branchId);
    if (branch) return branch;
  }
  return undefined;
}

function getBrandByBranchId(brands: Brand[], branchId: string): Brand | undefined {
  return brands.find((brand) => brand.branches?.some((b) => b.id === branchId));
}

const DEFAULT_FORM: ServiceFormState = {
  title: "",
  description: "",
  service_category_id: "",
  contextType: "individual",
  address: "",
  brandId: "",
  branchId: "",
  duration: "",
  price_type: "FIXED",
  price: "",
  image_media_ids: [],
  imagePreviews: [],
};

function serviceToFormState(service: Service, brands: Brand[]): ServiceFormState {
  const contextType = service.branch_id ? "branch" : "individual";
  const brand = service.branch_id ? getBrandByBranchId(brands, service.branch_id) : undefined;
  return {
    title: service.title,
    description: service.description ?? "",
    service_category_id: service.service_category_id ?? "",
    contextType,
    address: service.address ?? "",
    brandId: brand?.id ?? "",
    branchId: service.branch_id ?? "",
    duration: service.duration !== null ? String(service.duration) : "",
    price_type: service.price_type,
    price: service.price !== null ? String(service.price) : "",
    image_media_ids: service.images.map((img) => img.media_id),
    imagePreviews: service.images.map((img) => proxyMediaUrl(img.url) ?? img.url),
  };
}

function buildPayload(form: ServiceFormState): CreateServicePayload {
  const payload: CreateServicePayload = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    service_category_id: form.service_category_id || null,
    price_type: form.price_type,
    image_media_ids: form.image_media_ids.length > 0 ? form.image_media_ids : undefined,
  };

  if (form.contextType === "branch") {
    payload.branch_id = form.branchId || null;
  } else {
    payload.branch_id = null;
    payload.address = form.address.trim() || undefined;
  }

  if (form.duration.trim()) {
    const d = parseInt(form.duration, 10);
    if (!isNaN(d) && d > 0) payload.duration = d;
  }

  if (form.price_type !== "FREE" && form.price.trim()) {
    const p = parseFloat(form.price);
    if (!isNaN(p)) payload.price = p;
  }

  return payload;
}

// ─── Service Form Page ────────────────────────────────────────────────────────

type ServiceFormPageProps = {
  copy: PageCopy;
  brands: Brand[];
  serviceCategories: ServiceCategory[];
  accessToken: string;
  editingService: Service | null;
  onSaved: (service: Service, isNew: boolean) => void;
  onCancel: () => void;
};

type CropTarget = {
  file: File;
};

function ServiceFormPage({
  copy,
  brands,
  serviceCategories,
  accessToken,
  editingService,
  onSaved,
  onCancel,
}: ServiceFormPageProps) {
  const { messages } = useLocale();
  const initialData = editingService ? serviceToFormState(editingService, brands) : DEFAULT_FORM;
  const [form, setForm] = useState<ServiceFormState>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBrand = brands.find((b) => b.id === form.brandId);
  const brandOptions: ComboboxOption[] = brands.map((b) => ({ value: b.id, label: b.name }));
  const categoryOptions: ComboboxOption[] = serviceCategories.map((c) => ({
    value: c.id,
    label: messages.categories[c.key as keyof typeof messages.categories] ?? c.key,
  }));
  const branchOptions: ComboboxOption[] = (selectedBrand?.branches ?? []).map((b) => ({
    value: b.id,
    label: b.name,
  }));

  function setField<K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCropTarget({ file });
  }

  async function handleCropDone(croppedFile: File) {
    setCropTarget(null);
    setIsLoading(true);
    try {
      const result = await uploadServiceMedia(croppedFile, accessToken);
      setForm((prev) => ({
        ...prev,
        image_media_ids: [...prev.image_media_ids, result.media_id],
        imagePreviews: [...prev.imagePreviews, result.url],
      }));
    } catch {
      setFeedback({ type: "error", message: copy.errorGeneric });
    } finally {
      setIsLoading(false);
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      image_media_ids: prev.image_media_ids.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = buildPayload(form);
    setIsLoading(true);
    try {
      if (editingService) {
        const updated = await updateService(
          editingService.id,
          payload as UpdateServicePayload,
          accessToken,
        );
        onSaved(updated, false);
      } else {
        const created = await createService(payload as CreateServicePayload, accessToken);
        onSaved(created, true);
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? ((error.response?.data?.message as string | undefined) ?? copy.errorGeneric)
        : copy.errorGeneric;
      setFeedback({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  const showPrice = form.price_type !== "FREE";

  function renderFormActions(className?: string) {
    return (
      <div className={`${styles.formFooter}${className ? ` ${className}` : ""}`}>
        <Button
          variant="primary"
          type="submit"
          isLoading={isLoading}
          disabled={!form.title.trim() || isLoading}
          icon={isLoading ? undefined : "check"}
          className={styles.formFooterPrimary}
        >
          {copy.btnSave}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          {copy.btnCancel}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
      {/* Sticky header */}
      <div className={styles.formPageHeader}>
        <Button variant="ghost" icon="arrow_back" onClick={onCancel} />
        <div className={styles.headerMeta}>
          <h1 className={styles.formPageTitle}>
            {editingService ? copy.formTitleEdit : copy.formTitleCreate}
          </h1>
          <span className={styles.modeBadge}>
            {editingService ? copy.actionEdit : copy.createService}
          </span>
        </div>
      </div>

      {feedback ? (
        <div
          className={`${styles.feedback} ${
            feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <form className={styles.formBody} onSubmit={handleSubmit}>
        <div className={styles.desktopShell}>
          {/* ── Sidebar ── */}
          <div className={styles.sidebarStack}>
            {/* Photos */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>1</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{copy.fieldImages}</h2>
                  <p className={styles.sectionHint}>{copy.fieldImagesHint}</p>
                </div>
              </div>

              {form.imagePreviews.length > 0 ? (
                <div className={styles.galleryPreviewGrid}>
                  {form.imagePreviews.map((url, index) => (
                    <div key={index} className={styles.galleryPreviewItem}>
                      <Image
                        src={proxyMediaUrl(url) ?? url}
                        alt={`Service photo ${index + 1}`}
                        fill
                        className={styles.previewImage}
                        sizes="200px"
                      />
                      <button
                        type="button"
                        className={styles.removePreviewBtn}
                        aria-label="Remove photo"
                        onClick={() => removeImage(index)}
                      >
                        <Icon icon="close" size={12} color="current" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {form.image_media_ids.length < 5 ? (
                <label className={`${styles.uploadArea} ${styles.uploadAreaWide}`}>
                  <div className={styles.uploadContent}>
                    <Icon
                      icon="add_photo_alternate"
                      size={28}
                      color="current"
                      className={styles.uploadIcon}
                    />
                    <p className={styles.uploadLabel}>{copy.fieldImages}</p>
                    <p className={styles.uploadHint}>JPEG · PNG · max 5</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className={styles.hiddenInput}
                    onChange={handleImageFileChange}
                    disabled={isLoading}
                  />
                </label>
              ) : null}
            </div>

            {/* Desktop aside actions */}
            <div className={styles.desktopAside}>
              {renderFormActions(styles.formFooterAside)}
            </div>
          </div>

          {/* ── Main stack ── */}
          <div className={styles.mainStack}>
            {/* Section 2: Basic info */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>2</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{copy.fieldTitle}</h2>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel required>{copy.fieldTitle}</FieldLabel>
                  <Input
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder={copy.fieldTitlePlaceholder}
                    required
                  />
                </Field>
              </div>

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel>{copy.fieldDescription}</FieldLabel>
                  <textarea
                    className={styles.textarea}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder={copy.fieldDescriptionPlaceholder}
                    rows={4}
                  />
                </Field>
              </div>

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel>{copy.fieldCategory}</FieldLabel>
                  <Combobox
                    items={categoryOptions}
                    value={form.service_category_id}
                    placeholder={copy.fieldCategoryPlaceholder}
                    emptyMessage={copy.fieldCategoryPlaceholder}
                    onValueChange={(val) => {
                      const id = Array.isArray(val) ? (val[0] ?? "") : (val ?? "");
                      setField("service_category_id", id);
                    }}
                  />
                </Field>
              </div>
            </div>

            {/* Section 3: Context */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>3</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{copy.fieldContext}</h2>
                </div>
              </div>

              <div className={styles.switchRow}>
                <div className={styles.switchLabelGroup}>
                  <span className={styles.switchLabelText}>{copy.contextBranch}</span>
                  <span className={styles.switchLabelHint}>{copy.contextIndividual}</span>
                </div>
                <Switch
                  checked={form.contextType === "branch"}
                  onChange={(e) => {
                    setField("contextType", e.target.checked ? "branch" : "individual");
                    setField("branchId", "");
                    setField("brandId", "");
                  }}
                />
              </div>

              {form.contextType === "individual" ? (
                <div className={styles.fieldRow}>
                  <Field>
                    <FieldLabel>{copy.fieldAddress}</FieldLabel>
                    <Input
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      placeholder={copy.fieldAddressPlaceholder}
                    />
                  </Field>
                </div>
              ) : (
                <>
                  <div className={styles.fieldRow}>
                    <Field>
                      <FieldLabel>{copy.fieldBrand}</FieldLabel>
                      <Combobox
                        items={brandOptions}
                        value={form.brandId}
                        placeholder={copy.fieldBrandPlaceholder}
                        emptyMessage="No brands found"
                        onValueChange={(val) => {
                          const id = Array.isArray(val) ? (val[0] ?? "") : (val ?? "");
                          setField("brandId", id);
                          setField("branchId", "");
                        }}
                      />
                    </Field>
                  </div>

                  <div className={styles.fieldRow}>
                    <Field>
                      <FieldLabel>{copy.fieldBranch}</FieldLabel>
                      <Combobox
                        items={branchOptions}
                        value={form.branchId}
                        placeholder={form.brandId ? copy.fieldBranchPlaceholder : copy.selectBrandFirst}
                        emptyMessage="No branches found"
                        disabled={!form.brandId}
                        onValueChange={(val) => {
                          const id = Array.isArray(val) ? (val[0] ?? "") : (val ?? "");
                          setField("branchId", id);
                        }}
                      />
                    </Field>
                  </div>
                </>
              )}
            </div>

            {/* Section 4: Pricing & Duration */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>4</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{copy.fieldPriceType}</h2>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel>{copy.fieldPriceType}</FieldLabel>
                  <FieldContent>
                    <div className={styles.radioGroup}>
                      {(["FIXED", "STARTING_FROM", "FREE"] as PriceType[]).map((pt) => {
                        const label =
                          pt === "FIXED"
                            ? copy.priceTypeFixed
                            : pt === "STARTING_FROM"
                              ? copy.priceTypeStartingFrom
                              : copy.priceTypeFree;
                        return (
                          <label key={pt} className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="price_type"
                              value={pt}
                              checked={form.price_type === pt}
                              onChange={() => setField("price_type", pt)}
                              className={styles.radioInput}
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FieldContent>
                </Field>
              </div>

              {showPrice ? (
                <div className={styles.fieldRow}>
                  <Field>
                    <FieldLabel>{copy.fieldPrice}</FieldLabel>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                      placeholder={copy.fieldPricePlaceholder}
                    />
                  </Field>
                </div>
              ) : null}

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel>{copy.fieldDuration}</FieldLabel>
                  <FieldContent>
                    <div className={styles.inlineRow}>
                      <Input
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={(e) => setField("duration", e.target.value)}
                        placeholder={copy.fieldDurationPlaceholder}
                        className={styles.durationInput}
                      />
                      <span className={styles.inlineUnit}>{copy.fieldDurationUnit}</span>
                    </div>
                  </FieldContent>
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile footer */}
        <div className={styles.mobileFooter}>{renderFormActions()}</div>
      </form>

      {cropTarget ? (
        <ImageCropModal
          file={cropTarget.file}
          aspectRatio="16:9"
          onCrop={handleCropDone}
          onCancel={() => setCropTarget(null)}
        />
      ) : null}
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  copy,
  brands,
  onEdit,
  onSubmit,
  onResubmit,
  onDelete,
  onPause,
  onResume,
  onArchive,
  actionLoading,
}: {
  service: Service;
  copy: PageCopy;
  brands: Brand[];
  onEdit: () => void;
  onSubmit: () => void;
  onResubmit: () => void;
  onDelete: () => void;
  onPause: () => void;
  onResume: () => void;
  onArchive: () => void;
  actionLoading: boolean;
}) {
  const { messages } = useLocale();
  const statusLabel = getStatusLabel(service.status, copy);
  const badgeVariant = STATUS_BADGE_VARIANT[service.status];
  const priceLabel = formatPrice(service, copy);
  const durationLabel = formatDuration(service.duration, copy.fieldDurationUnit);

  const branch = service.branch_id ? getBranchById(brands, service.branch_id) : null;
  const contextLabel = branch ? `${copy.labelBranch}: ${branch.name}` : copy.labelIndividual;

  const firstImage = service.images[0];
  const imageUrl = firstImage ? proxyMediaUrl(firstImage.url) : null;

  return (
    <article className={styles.serviceCard}>
      {imageUrl ? (
        <div className={styles.cardImageThumb}>
          <Image
            src={imageUrl}
            alt={service.title}
            fill
            className={styles.cardImage}
            sizes="72px"
          />
        </div>
      ) : (
        <div className={styles.cardImagePlaceholder}>
          <Icon icon="design_services" size={22} color="current" />
        </div>
      )}

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{service.title}</h3>
          <Badge variant={badgeVariant}>{statusLabel}</Badge>
        </div>

        <div className={styles.cardMeta}>
          {service.service_category ? (
            <span className={styles.metaChip}>
              {messages.categories[service.service_category.key as keyof typeof messages.categories] ?? service.service_category.key}
            </span>
          ) : null}
          <span className={styles.metaItem}>{priceLabel}</span>
          {durationLabel !== "—" ? (
            <span className={styles.metaItem}>{durationLabel}</span>
          ) : null}
          <span className={styles.metaItem}>{contextLabel}</span>
        </div>

        {service.status === "REJECTED" && service.rejection_reason ? (
          <div className={styles.rejectionBanner}>
            <Icon icon="info" size={14} color="current" />
            <span>
              <strong>{copy.labelRejectionReason}:</strong> {service.rejection_reason}
            </span>
          </div>
        ) : null}

        {service.status === "PENDING" ? (
          <p className={styles.pendingNote}>{copy.pendingNote}</p>
        ) : null}
      </div>

      <div className={styles.cardActions}>
        {service.status === "DRAFT" ? (
          <>
            <Button size="small" variant="outline" icon="edit" onClick={onEdit} disabled={actionLoading}>
              {copy.actionEdit}
            </Button>
            <Button size="small" variant="primary" icon="send" onClick={onSubmit} isLoading={actionLoading}>
              {copy.actionSubmit}
            </Button>
            <Button size="small" variant="destructive" icon="delete" onClick={onDelete} disabled={actionLoading}>
              {copy.actionDelete}
            </Button>
          </>
        ) : null}

        {service.status === "REJECTED" ? (
          <>
            <Button size="small" variant="outline" icon="edit" onClick={onEdit} disabled={actionLoading}>
              {copy.actionEdit}
            </Button>
            <Button size="small" variant="primary" icon="send" onClick={onResubmit} isLoading={actionLoading}>
              {copy.actionResubmit}
            </Button>
          </>
        ) : null}

        {service.status === "ACTIVE" ? (
          <>
            <Button size="small" variant="outline" icon="pause" onClick={onPause} isLoading={actionLoading}>
              {copy.actionPause}
            </Button>
            <Button size="small" variant="ghost" icon="archive" onClick={onArchive} disabled={actionLoading}>
              {copy.actionArchive}
            </Button>
          </>
        ) : null}

        {service.status === "PAUSED" ? (
          <>
            <Button size="small" variant="primary" icon="play_arrow" onClick={onResume} isLoading={actionLoading}>
              {copy.actionResume}
            </Button>
            <Button size="small" variant="ghost" icon="archive" onClick={onArchive} disabled={actionLoading}>
              {copy.actionArchive}
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ServicesUsoPage({
  services: initialServices,
  brands,
  accessToken,
  serviceCategories,
}: ServicesUsoPageProps) {
  const { locale } = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);

  const [services, setServices] = useState<Service[]>(initialServices);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  function openCreate() {
    setEditingService(null);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingService(null);
  }

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  }

  async function handleDelete(service: Service) {
    if (!window.confirm(copy.confirmDelete)) return;
    setActionLoadingId(service.id);
    try {
      await deleteService(service.id, accessToken);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      showFeedback("success", copy.successDelete);
    } catch {
      showFeedback("error", copy.errorGeneric);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleLifecycle(
    service: Service,
    action: "submit" | "resubmit" | "pause" | "resume" | "archive",
  ) {
    setActionLoadingId(service.id);
    try {
      let updated: Service;
      let successMsg: string;
      if (action === "submit" || action === "resubmit") {
        updated = await submitService(service.id, accessToken);
        successMsg = copy.successSubmit;
      } else if (action === "pause") {
        updated = await pauseService(service.id, accessToken);
        successMsg = copy.successPause;
      } else if (action === "resume") {
        updated = await resumeService(service.id, accessToken);
        successMsg = copy.successResume;
      } else {
        updated = await archiveService(service.id, accessToken);
        successMsg = copy.successArchive;
      }
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showFeedback("success", successMsg);
    } catch {
      showFeedback("error", copy.errorGeneric);
    } finally {
      setActionLoadingId(null);
    }
  }

  if (formOpen) {
    return (
      <ServiceFormPage
        key={editingService?.id ?? "create"}
        copy={copy}
        brands={brands}
        serviceCategories={serviceCategories}
        accessToken={accessToken}
        editingService={editingService}
        onSaved={(service, isNew) => {
          if (isNew) {
            setServices((prev) => [service, ...prev]);
          } else {
            setServices((prev) => prev.map((s) => (s.id === service.id ? service : s)));
          }
          closeForm();
          showFeedback("success", isNew ? copy.successCreate : copy.successUpdate);
        }}
        onCancel={closeForm}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{copy.pageTitle}</h1>
        <Button variant="primary" icon="add" onClick={openCreate}>
          {copy.createService}
        </Button>
      </div>

      {feedback ? (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError
          }`}
        >
          <Icon
            icon={feedback.type === "success" ? "check_circle" : "error"}
            size={16}
            color="current"
          />
          <span>{feedback.message}</span>
        </div>
      ) : null}

      {services.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <Icon icon="design_services" size={40} color="current" />
          </div>
          <p className={styles.emptyTitle}>{copy.emptyTitle}</p>
          <p className={styles.emptyDescription}>{copy.emptyDescription}</p>
          <Button variant="primary" icon="add" onClick={openCreate}>
            {copy.createService}
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              copy={copy}
              brands={brands}
              onEdit={() => openEdit(service)}
              onSubmit={() => handleLifecycle(service, "submit")}
              onResubmit={() => handleLifecycle(service, "resubmit")}
              onDelete={() => handleDelete(service)}
              onPause={() => handleLifecycle(service, "pause")}
              onResume={() => handleLifecycle(service, "resume")}
              onArchive={() => handleLifecycle(service, "archive")}
              actionLoading={actionLoadingId === service.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
