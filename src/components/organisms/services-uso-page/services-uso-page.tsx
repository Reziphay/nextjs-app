"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { isAxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogContent,
  Badge,
  Button,
  Field,
  FieldLabel,
  FieldContent,
  Input,
} from "@/components/atoms";
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
import type { Service, ServiceStatus, PriceType } from "@/types/service";
import styles from "./services-uso-page.module.css";

type ServicesUsoPageProps = {
  services: Service[];
  brands: Brand[];
  accessToken: string;
};

type ServiceFormState = {
  title: string;
  description: string;
  category: string;
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
  uploadingImage: string;
  selectBrandFirst: string;
};

const EN_COPY: PageCopy = {
  pageTitle: "My Services",
  createService: "Create service",
  emptyTitle: "No services yet",
  emptyDescription:
    "Create your first service to start offering it to customers.",
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
  fieldContext: "Context",
  contextIndividual: "Individual service",
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
  fieldPriceType: "Price type",
  priceTypeFixed: "Fixed price",
  priceTypeStartingFrom: "Starting from",
  priceTypeFree: "Free",
  fieldPrice: "Price",
  fieldPricePlaceholder: "0.00",
  fieldImages: "Photos",
  fieldImagesHint: "Add photos of your service (JPEG or PNG, max 5)",
  btnSave: "Save",
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
  uploadingImage: "Uploading…",
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
  actionResubmit: "Yeniden gönder",
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
  fieldContext: "Bağlam",
  contextIndividual: "Bireysel hizmet",
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
  fieldPriceType: "Fiyat türü",
  priceTypeFixed: "Sabit fiyat",
  priceTypeStartingFrom: "Başlangıç fiyatı",
  priceTypeFree: "Ücretsiz",
  fieldPrice: "Fiyat",
  fieldPricePlaceholder: "0.00",
  fieldImages: "Fotoğraflar",
  fieldImagesHint: "Hizmetinle ilgili fotoğraf ekle (JPEG veya PNG, max 5)",
  btnSave: "Kaydet",
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
  uploadingImage: "Yükleniyor…",
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
  fieldContext: "Kontekst",
  contextIndividual: "Fərdi xidmət",
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
  fieldPriceType: "Qiymət növü",
  priceTypeFixed: "Sabit qiymət",
  priceTypeStartingFrom: "Başlangıc qiyməti",
  priceTypeFree: "Pulsuz",
  fieldPrice: "Qiymət",
  fieldPricePlaceholder: "0.00",
  fieldImages: "Fotolar",
  fieldImagesHint: "Xidmətinlə bağlı foto əlavə et (JPEG və ya PNG, max 5)",
  btnSave: "Saxla",
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
  uploadingImage: "Yüklənir…",
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
  category: "",
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
    category: service.category ?? "",
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
    category: form.category.trim() || undefined,
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

// ─── Service Form ─────────────────────────────────────────────────────────────

function ServiceForm({
  copy,
  brands,
  accessToken,
  initialData,
  isLoading,
  onSave,
  onCancel,
}: {
  copy: PageCopy;
  brands: Brand[];
  accessToken: string;
  initialData: ServiceFormState;
  isLoading: boolean;
  onSave: (payload: CreateServicePayload | UpdateServicePayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ServiceFormState>(initialData);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBrand = brands.find((b) => b.id === form.brandId);
  const availableBranches = selectedBrand?.branches ?? [];

  function setField<K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remaining = 5 - form.image_media_ids.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    setImageUploading(true);
    try {
      const results = await Promise.all(
        toUpload.map((file) => uploadServiceMedia(file, accessToken)),
      );

      setForm((prev) => ({
        ...prev,
        image_media_ids: [...prev.image_media_ids, ...results.map((r) => r.media_id)],
        imagePreviews: [...prev.imagePreviews, ...results.map((r) => r.url)],
      }));
    } catch {
      // silently ignore upload errors for now
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      image_media_ids: prev.image_media_ids.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = buildPayload(form);
    await onSave(payload);
  }

  const showPrice = form.price_type !== "FREE";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field>
        <FieldLabel required>{copy.fieldTitle}</FieldLabel>
        <FieldContent>
          <Input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder={copy.fieldTitlePlaceholder}
            required
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>{copy.fieldDescription}</FieldLabel>
        <FieldContent>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder={copy.fieldDescriptionPlaceholder}
            rows={3}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>{copy.fieldCategory}</FieldLabel>
        <FieldContent>
          <Input
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            placeholder={copy.fieldCategoryPlaceholder}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>{copy.fieldContext}</FieldLabel>
        <FieldContent>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="contextType"
                value="individual"
                checked={form.contextType === "individual"}
                onChange={() => setField("contextType", "individual")}
                className={styles.radioInput}
              />
              <span>{copy.contextIndividual}</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="contextType"
                value="branch"
                checked={form.contextType === "branch"}
                onChange={() => setField("contextType", "branch")}
                className={styles.radioInput}
              />
              <span>{copy.contextBranch}</span>
            </label>
          </div>
        </FieldContent>
      </Field>

      {form.contextType === "individual" ? (
        <Field>
          <FieldLabel>{copy.fieldAddress}</FieldLabel>
          <FieldContent>
            <Input
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder={copy.fieldAddressPlaceholder}
            />
          </FieldContent>
        </Field>
      ) : (
        <>
          <Field>
            <FieldLabel>{copy.fieldBrand}</FieldLabel>
            <FieldContent>
              <select
                className={styles.select}
                value={form.brandId}
                onChange={(e) => {
                  setField("brandId", e.target.value);
                  setField("branchId", "");
                }}
              >
                <option value="">{copy.fieldBrandPlaceholder}</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>{copy.fieldBranch}</FieldLabel>
            <FieldContent>
              <select
                className={styles.select}
                value={form.branchId}
                onChange={(e) => setField("branchId", e.target.value)}
                disabled={!form.brandId}
              >
                <option value="">
                  {form.brandId ? copy.fieldBranchPlaceholder : copy.selectBrandFirst}
                </option>
                {availableBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </FieldContent>
          </Field>
        </>
      )}

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

      {showPrice ? (
        <Field>
          <FieldLabel>{copy.fieldPrice}</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder={copy.fieldPricePlaceholder}
            />
          </FieldContent>
        </Field>
      ) : null}

      <Field>
        <FieldLabel>{copy.fieldImages}</FieldLabel>
        <FieldContent>
          <p className={styles.fieldHint}>{copy.fieldImagesHint}</p>
          {form.imagePreviews.length > 0 ? (
            <div className={styles.imageGrid}>
              {form.imagePreviews.map((url, index) => (
                <div key={index} className={styles.imageTile}>
                  <div className={styles.imagePreview}>
                    <Image
                      src={url}
                      alt={`Service image ${index + 1}`}
                      fill
                      className={styles.imagePreviewImg}
                      sizes="80px"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.imageRemove}
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                  >
                    <Icon icon="close" size={12} color="current" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {form.image_media_ids.length < 5 ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className={styles.fileInput}
                onChange={handleImageUpload}
                disabled={imageUploading}
              />
              {imageUploading ? (
                <p className={styles.uploadingHint}>{copy.uploadingImage}</p>
              ) : null}
            </>
          ) : null}
        </FieldContent>
      </Field>

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!form.title.trim()}
        >
          {copy.btnSave}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {copy.btnCancel}
        </Button>
      </div>
    </form>
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
  const statusLabel = getStatusLabel(service.status, copy);
  const badgeVariant = STATUS_BADGE_VARIANT[service.status];
  const priceLabel = formatPrice(service, copy);
  const durationLabel = formatDuration(service.duration, copy.fieldDurationUnit);

  const branch = service.branch_id ? getBranchById(brands, service.branch_id) : null;
  const contextLabel = branch
    ? `${copy.labelBranch}: ${branch.name}`
    : copy.labelIndividual;

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
          {service.category ? (
            <span className={styles.metaChip}>{service.category}</span>
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
              <strong>{copy.labelRejectionReason}:</strong>{" "}
              {service.rejection_reason}
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
            <Button
              size="small"
              variant="outline"
              icon="edit"
              onClick={onEdit}
              disabled={actionLoading}
            >
              {copy.actionEdit}
            </Button>
            <Button
              size="small"
              variant="primary"
              icon="send"
              onClick={onSubmit}
              isLoading={actionLoading}
            >
              {copy.actionSubmit}
            </Button>
            <Button
              size="small"
              variant="destructive"
              icon="delete"
              onClick={onDelete}
              disabled={actionLoading}
            >
              {copy.actionDelete}
            </Button>
          </>
        ) : null}

        {service.status === "REJECTED" ? (
          <>
            <Button
              size="small"
              variant="outline"
              icon="edit"
              onClick={onEdit}
              disabled={actionLoading}
            >
              {copy.actionEdit}
            </Button>
            <Button
              size="small"
              variant="primary"
              icon="send"
              onClick={onResubmit}
              isLoading={actionLoading}
            >
              {copy.actionResubmit}
            </Button>
          </>
        ) : null}

        {service.status === "ACTIVE" ? (
          <>
            <Button
              size="small"
              variant="outline"
              icon="pause"
              onClick={onPause}
              isLoading={actionLoading}
            >
              {copy.actionPause}
            </Button>
            <Button
              size="small"
              variant="ghost"
              icon="archive"
              onClick={onArchive}
              disabled={actionLoading}
            >
              {copy.actionArchive}
            </Button>
          </>
        ) : null}

        {service.status === "PAUSED" ? (
          <>
            <Button
              size="small"
              variant="primary"
              icon="play_arrow"
              onClick={onResume}
              isLoading={actionLoading}
            >
              {copy.actionResume}
            </Button>
            <Button
              size="small"
              variant="ghost"
              icon="archive"
              onClick={onArchive}
              disabled={actionLoading}
            >
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
}: ServicesUsoPageProps) {
  const { locale } = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);

  const [services, setServices] = useState<Service[]>(initialServices);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  function openCreate() {
    setEditingService(null);
    setFormOpen(true);
    setFeedback(null);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setFormOpen(true);
    setFeedback(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingService(null);
  }

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSave(payload: CreateServicePayload | UpdateServicePayload) {
    setFormLoading(true);
    try {
      if (editingService) {
        const updated = await updateService(editingService.id, payload as UpdateServicePayload, accessToken);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        showFeedback("success", copy.successUpdate);
      } else {
        const created = await createService(payload as CreateServicePayload, accessToken);
        setServices((prev) => [created, ...prev]);
        showFeedback("success", copy.successCreate);
      }
      closeForm();
    } catch (error) {
      const message = isAxiosError(error)
        ? ((error.response?.data?.message as string | undefined) ?? copy.errorGeneric)
        : copy.errorGeneric;
      showFeedback("error", message);
    } finally {
      setFormLoading(false);
    }
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

  const formInitialData = editingService
    ? serviceToFormState(editingService, brands)
    : DEFAULT_FORM;

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{copy.pageTitle}</h1>
        <Button variant="primary" icon="add" onClick={openCreate}>
          {copy.createService}
        </Button>
      </div>

      {feedback ? (
        <div className={`${styles.feedbackBanner} ${feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError}`}>
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

      <AlertDialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <AlertDialogContent className={styles.formDialog}>
          <div className={styles.formDialogHeader}>
            <h2 className={styles.formDialogTitle}>
              {editingService ? copy.formTitleEdit : copy.formTitleCreate}
            </h2>
            <button
              type="button"
              className={styles.formDialogClose}
              onClick={closeForm}
              aria-label={copy.btnCancel}
            >
              <Icon icon="close" size={18} color="current" />
            </button>
          </div>

          {feedback ? (
            <div className={`${styles.feedbackBanner} ${feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError}`}>
              <Icon
                icon={feedback.type === "success" ? "check_circle" : "error"}
                size={14}
                color="current"
              />
              <span>{feedback.message}</span>
            </div>
          ) : null}

          <ServiceForm
            key={editingService?.id ?? "create"}
            copy={copy}
            brands={brands}
            accessToken={accessToken}
            initialData={formInitialData}
            isLoading={formLoading}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
