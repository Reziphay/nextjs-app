"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import { AvatarCropDialog } from "@/components/molecules/avatar-crop-dialog/avatar-crop-dialog";
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
  unarchiveService,
  uploadServiceMedia,
  type CreateServicePayload,
  type UpdateServicePayload,
} from "@/lib/services-api";
import { proxyMediaUrl } from "@/lib/media";
import type { Brand, Branch } from "@/types/brand";
import type { Service, ServiceCategory, ServiceStatus, PriceType } from "@/types/service";
import type { AuthenticatedUser } from "@/types/user_types";
import { OwnerCard } from "@/components/molecules/owner-card";
import styles from "./services-uso-page.module.css";

type ServicesUsoPageProps = {
  services: Service[];
  brands: Brand[];
  accessToken: string;
  serviceCategories: ServiceCategory[];
  user: AuthenticatedUser;
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
  actionUnarchive: string;
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
  fieldImagesUploadHint: string;
  removePhotoLabel: string;
  servicePhotoAlt: string;
  btnSave: string;
  btnResubmit: string;
  btnCancel: string;
  labelRejectionReason: string;
  labelCategory: string;
  labelDuration: string;
  labelPrice: string;
  labelBranch: string;
  labelIndividual: string;
  labelOwner: string;
  successCreate: string;
  successUpdate: string;
  successDelete: string;
  successSubmit: string;
  successPause: string;
  successResume: string;
  successArchive: string;
  successUnarchive: string;
  errorGeneric: string;
  confirmDelete: string;
  pendingNote: string;
  draftNote: string;
  pausedNote: string;
  rejectedNote: string;
  archivedNote: string;
  selectBrandFirst: string;
  detailInfo: string;
  detailActions: string;
  noDescription: string;
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
  actionUnarchive: "Unarchive",
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
  fieldImagesUploadHint: "JPEG · PNG · max 5",
  removePhotoLabel: "Remove photo",
  servicePhotoAlt: "Service photo",
  btnSave: "Save service",
  btnResubmit: "Resubmit",
  btnCancel: "Cancel",
  labelRejectionReason: "Rejection reason",
  labelCategory: "Category",
  labelDuration: "Duration",
  labelPrice: "Price",
  labelBranch: "Branch",
  labelIndividual: "Individual",
  labelOwner: "Owner",
  successCreate: "Service created.",
  successUpdate: "Service updated.",
  successDelete: "Service deleted.",
  successSubmit: "Submitted for review.",
  successPause: "Service paused.",
  successResume: "Service resumed.",
  successArchive: "Service archived.",
  successUnarchive: "Service restored to draft.",
  errorGeneric: "Something went wrong. Please try again.",
  confirmDelete: "Are you sure you want to delete this service?",
  pendingNote: "Under review — no actions available.",
  draftNote: "This service is a draft and not visible to customers yet. Submit it for review when you're ready.",
  pausedNote: "This service is paused and currently hidden from customers.",
  rejectedNote: "This service was rejected. Review the reason below, make corrections, and resubmit.",
  archivedNote: "This service is archived and no longer visible to customers.",
  selectBrandFirst: "Select a brand first",
  detailInfo: "Details",
  detailActions: "Actions",
  noDescription: "No description provided.",
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
  actionUnarchive: "Arşivden çıkar",
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
  fieldImagesUploadHint: "JPEG · PNG · maks. 5",
  removePhotoLabel: "Fotoğrafı kaldır",
  servicePhotoAlt: "Hizmet fotoğrafı",
  btnSave: "Hizmeti kaydet",
  btnResubmit: "Yenidən göndər",
  btnCancel: "İptal",
  labelRejectionReason: "Reddedilme nedeni",
  labelCategory: "Kategori",
  labelDuration: "Süre",
  labelPrice: "Fiyat",
  labelBranch: "Şube",
  labelIndividual: "Bireysel",
  labelOwner: "Sahib",
  successCreate: "Hizmet oluşturuldu.",
  successUpdate: "Hizmet güncellendi.",
  successDelete: "Hizmet silindi.",
  successSubmit: "İncelemeye gönderildi.",
  successPause: "Hizmet durduruldu.",
  successResume: "Hizmet devam ediyor.",
  successArchive: "Hizmet arşivlendi.",
  successUnarchive: "Hizmet taslağa geri alındı.",
  errorGeneric: "Bir şeyler ters gitti. Lütfen tekrar dene.",
  confirmDelete: "Bu hizmeti silmek istediğinden emin misin?",
  pendingNote: "İnceleniyor — işlem yapılamaz.",
  draftNote: "Bu hizmet taslak halinde olup müşterilere henüz görünmüyor. Hazır olduğunda incelemeye gönder.",
  pausedNote: "Bu hizmet duraklatılmış ve müşterilere gösterilmiyor.",
  rejectedNote: "Bu hizmet reddedildi. Aşağıdaki nedeni incele, düzeltmeleri yap ve yeniden gönder.",
  archivedNote: "Bu hizmet arşivlenmiş ve müşterilere artık görünmüyor.",
  selectBrandFirst: "Önce marka seç",
  detailInfo: "Detaylar",
  detailActions: "İşlemler",
  noDescription: "Açıklama yok.",
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
  actionUnarchive: "Arxivdən çıxar",
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
  fieldImagesUploadHint: "JPEG · PNG · maks. 5",
  removePhotoLabel: "Fotonu sil",
  servicePhotoAlt: "Xidmət fotosu",
  btnSave: "Xidməti saxla",
  btnResubmit: "Yenidən göndər",
  btnCancel: "Ləğv et",
  labelRejectionReason: "Rədd səbəbi",
  labelCategory: "Kateqoriya",
  labelDuration: "Müddət",
  labelPrice: "Qiymət",
  labelBranch: "Filial",
  labelIndividual: "Fərdi",
  labelOwner: "Sahib",
  successCreate: "Xidmət yaradıldı.",
  successUpdate: "Xidmət yeniləndi.",
  successDelete: "Xidmət silindi.",
  successSubmit: "İcazəyə göndərildi.",
  successPause: "Xidmət dayandırıldı.",
  successResume: "Xidmət davam edir.",
  successArchive: "Xidmət arxivləndi.",
  successUnarchive: "Xidmət qaralamaya qaytarıldı.",
  errorGeneric: "Nəsə xəta baş verdi. Yenidən cəhd et.",
  confirmDelete: "Bu xidməti silmək istədiyindən əminsən?",
  pendingNote: "İcazə gözlənilir — heç bir əməliyyat mümkün deyil.",
  draftNote: "Bu xidmət qaralama halındadır və müştərilərə hələ görünmür. Hazır olduqda icazəyə göndər.",
  pausedNote: "Bu xidmət dayandırılıb və hazırda müştərilərə göstərilmir.",
  rejectedNote: "Bu xidmət rədd edildi. Aşağıdakı səbəbi nəzərdən keçir, düzəlişlər et və yenidən göndər.",
  archivedNote: "Bu xidmət arxivlənib və artıq müştərilərə görünmür.",
  selectBrandFirst: "Əvvəlcə brend seç",
  detailInfo: "Təfərrüatlar",
  detailActions: "Əməliyyatlar",
  noDescription: "Təsvir yoxdur.",
};

const RU_COPY: PageCopy = {
  ...EN_COPY,
  pageTitle: "Мои сервисы",
  createService: "Создать сервис",
  emptyTitle: "Сервисов пока нет",
  emptyDescription: "Создайте первый сервис, чтобы предложить его клиентам.",
  statusDraft: "Черновик",
  statusPending: "На проверке",
  statusActive: "Активен",
  statusRejected: "Отклонён",
  statusPaused: "На паузе",
  statusArchived: "В архиве",
  actionEdit: "Редактировать",
  actionSubmit: "Отправить на проверку",
  actionDelete: "Удалить",
  actionResubmit: "Отправить снова",
  actionPause: "Поставить на паузу",
  actionResume: "Возобновить",
  actionArchive: "Архивировать",
  formTitleCreate: "Создать сервис",
  formTitleEdit: "Редактировать сервис",
  fieldTitle: "Название",
  fieldTitlePlaceholder: "например, Стрижка и укладка",
  fieldDescription: "Описание",
  fieldDescriptionPlaceholder: "Опишите ваш сервис…",
  fieldCategory: "Категория",
  fieldCategoryPlaceholder: "например, Волосы, Ногти, Массаж",
  fieldContext: "Контекст сервиса",
  contextIndividual: "Оказывается по моему адресу",
  contextBranch: "Сервис привязан к филиалу",
  fieldAddress: "Адрес",
  fieldAddressPlaceholder: "Где оказывается сервис",
  fieldBrand: "Бренд",
  fieldBrandPlaceholder: "Выберите бренд",
  fieldBranch: "Филиал",
  fieldBranchPlaceholder: "Выберите филиал",
  fieldDuration: "Длительность",
  fieldDurationPlaceholder: "например, 60",
  fieldDurationUnit: "мин",
  fieldPriceType: "Цена и длительность",
  priceTypeFixed: "Фиксированная",
  priceTypeStartingFrom: "От",
  priceTypeFree: "Бесплатно",
  fieldPrice: "Цена",
  fieldImages: "Фото",
  fieldImagesHint: "Добавьте фото сервиса (JPEG или PNG, максимум 5)",
  fieldImagesUploadHint: "JPEG · PNG · максимум 5",
  removePhotoLabel: "Удалить фото",
  servicePhotoAlt: "Фото сервиса",
  btnSave: "Сохранить сервис",
  btnResubmit: "Отправить снова",
  btnCancel: "Отмена",
  labelRejectionReason: "Причина отклонения",
  labelCategory: "Категория",
  labelDuration: "Длительность",
  labelPrice: "Цена",
  labelBranch: "Филиал",
  labelIndividual: "Индивидуально",
  labelOwner: "Владелец",
  successCreate: "Сервис создан.",
  successUpdate: "Сервис обновлён.",
  successDelete: "Сервис удалён.",
  successSubmit: "Отправлено на проверку.",
  successPause: "Сервис поставлен на паузу.",
  successResume: "Сервис возобновлён.",
  successArchive: "Сервис архивирован.",
  errorGeneric: "Что-то пошло не так. Попробуйте ещё раз.",
  confirmDelete: "Вы уверены, что хотите удалить этот сервис?",
  pendingNote: "На проверке — действия недоступны.",
  draftNote:
    "Этот сервис находится в черновике и пока не виден клиентам. Отправьте его на проверку, когда будете готовы.",
  selectBrandFirst: "Сначала выберите бренд",
  detailInfo: "Детали",
  detailActions: "Действия",
  noDescription: "Описание не добавлено.",
};

function getCopy(locale: string): PageCopy {
  if (locale.startsWith("az")) return AZ_COPY;
  if (locale.startsWith("ru")) return RU_COPY;
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
  return `${prefix}${service.price} AZN`;
}

function formatDuration(minutes: number | null, unit: string): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} ${unit}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hourUnit =
    unit === "мин" ? "ч" : unit === "dəq" ? "saat" : unit === "dk" ? "sa" : "h";
  return m > 0 ? `${h}${hourUnit} ${m}${unit}` : `${h}${hourUnit}`;
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

type OwnerInfo =
  | { isBrand: true; name: string; brand: Brand }
  | { isBrand: false; name: string; brand: null };

function getOwnerInfo(
  service: Service,
  brands: Brand[],
  user: AuthenticatedUser,
): OwnerInfo {
  if (service.branch_id) {
    const brand = getBrandByBranchId(brands, service.branch_id);
    if (brand) return { isBrand: true, name: brand.name, brand };
  }
  return { isBrand: false, name: `${user.first_name} ${user.last_name}`, brand: null };
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
  initialBrandId?: string;
  onSaved: (service: Service, isNew: boolean) => void;
  onCancel: () => void;
};

type CropTarget = { file: File };

function ServiceFormPage({
  copy,
  brands,
  serviceCategories,
  accessToken,
  editingService,
  initialBrandId,
  onSaved,
  onCancel,
}: ServiceFormPageProps) {
  const { messages } = useLocale();
  const initialData = editingService
    ? serviceToFormState(editingService, brands)
    : initialBrandId
      ? { ...DEFAULT_FORM, brandId: initialBrandId, contextType: "branch" as const }
      : DEFAULT_FORM;
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

  const isEditingPaused = editingService?.status === "PAUSED";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = buildPayload(form);
    setIsLoading(true);
    try {
      if (editingService) {
        const serviceId = editingService.id;
        const updated = await updateService(
          serviceId,
          payload as UpdateServicePayload,
          accessToken,
        );
        if (isEditingPaused) {
          const resubmitted = await submitService(updated.id, accessToken);
          onSaved(resubmitted, false);
        } else {
          onSaved(updated, false);
        }
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
          icon={isLoading ? undefined : isEditingPaused ? "send" : "check"}
          className={styles.formFooterPrimary}
        >
          {isEditingPaused ? copy.btnResubmit : copy.btnSave}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          {copy.btnCancel}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
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
          <div className={styles.sidebarStack}>
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
                        alt={`${copy.servicePhotoAlt} ${index + 1}`}
                        fill
                        className={styles.previewImage}
                        sizes="200px"
                      />
                      <button
                        type="button"
                        className={styles.removePreviewBtn}
                        aria-label={`${copy.removePhotoLabel} ${index + 1}`}
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
                    <Icon icon="add_photo_alternate" size={28} color="current" className={styles.uploadIcon} />
                    <p className={styles.uploadLabel}>{copy.fieldImages}</p>
                    <p className={styles.uploadHint}>{copy.fieldImagesUploadHint}</p>
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

            <div className={styles.desktopAside}>
              {renderFormActions(styles.formFooterAside)}
            </div>
          </div>

          <div className={styles.mainStack}>
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
                  <Input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder={copy.fieldTitlePlaceholder} required />
                </Field>
              </div>

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel>{copy.fieldDescription}</FieldLabel>
                  <textarea className={styles.textarea} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder={copy.fieldDescriptionPlaceholder} rows={4} />
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
                    <Input value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder={copy.fieldAddressPlaceholder} />
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
                        const label = pt === "FIXED" ? copy.priceTypeFixed : pt === "STARTING_FROM" ? copy.priceTypeStartingFrom : copy.priceTypeFree;
                        return (
                          <label key={pt} className={styles.radioLabel}>
                            <input type="radio" name="price_type" value={pt} checked={form.price_type === pt} onChange={() => setField("price_type", pt)} className={styles.radioInput} />
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
                    <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField("price", e.target.value)} placeholder={copy.fieldPricePlaceholder} />
                  </Field>
                </div>
              ) : null}

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel>{copy.fieldDuration}</FieldLabel>
                  <FieldContent>
                    <div className={styles.inlineRow}>
                      <Input type="number" min="1" value={form.duration} onChange={(e) => setField("duration", e.target.value)} placeholder={copy.fieldDurationPlaceholder} className={styles.durationInput} />
                      <span className={styles.inlineUnit}>{copy.fieldDurationUnit}</span>
                    </div>
                  </FieldContent>
                </Field>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mobileFooter}>{renderFormActions()}</div>
      </form>

      {cropTarget ? (
        <AvatarCropDialog
          file={cropTarget.file}
          aspectRatio="16:9"
          open={true}
          onConfirm={handleCropDone}
          onClose={() => setCropTarget(null)}
        />
      ) : null}
    </div>
  );
}

// ─── Service Card (Wolt-style) ────────────────────────────────────────────────

function ServiceCard({
  service,
  copy,
  brands,
  user,
  onClick,
}: {
  service: Service;
  copy: PageCopy;
  brands: Brand[];
  user: AuthenticatedUser;
  onClick: () => void;
}) {
  const { messages } = useLocale();
  const statusLabel = getStatusLabel(service.status, copy);
  const priceLabel = formatPrice(service, copy);
  const durationLabel = formatDuration(service.duration, copy.fieldDurationUnit);
  const owner = getOwnerInfo(service, brands, user);

  const branch = service.branch_id ? getBranchById(brands, service.branch_id) : null;

  const firstImage = service.images[0];
  const imageUrl = firstImage ? proxyMediaUrl(firstImage.url) : null;

  const category = service.service_category
    ? (messages.categories[service.service_category.key as keyof typeof messages.categories] ?? service.service_category.key)
    : null;

  const statusPillClass = {
    ACTIVE: styles.cardStatusActive,
    PENDING: styles.cardStatusPending,
    DRAFT: styles.cardStatusDraft,
    PAUSED: styles.cardStatusPaused,
    REJECTED: styles.cardStatusRejected,
    ARCHIVED: styles.cardStatusArchived,
  }[service.status];

  const statusIcon: Record<typeof service.status, string> = {
    ACTIVE: "check_circle",
    PENDING: "schedule",
    DRAFT: "edit",
    PAUSED: "pause",
    REJECTED: "error",
    ARCHIVED: "archive",
  };

  const brandLogoUrl = owner.isBrand ? (proxyMediaUrl(owner.brand.logo_url ?? "") || null) : null;

  const ownerHref = owner.isBrand ? `/brands?id=${owner.brand.id}` : "/account";

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.serviceCard}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      {/* Image hero */}
      <div className={styles.cardHero}>
        {imageUrl ? (
          <Image src={imageUrl} alt={service.title} fill className={styles.cardHeroImage} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className={styles.cardHeroPlaceholder}>
            <Icon icon="design_services" size={32} color="current" className={styles.cardHeroIcon} />
          </div>
        )}
        {/* Status pill overlaid top-right */}
        <div className={`${styles.cardStatusPill} ${statusPillClass}`}>
          <Icon icon={statusIcon[service.status]} size={11} color="current" />
          {statusLabel}
        </div>
        {/* Price pill overlaid bottom-right */}
        {priceLabel !== "—" && (
          <div className={styles.cardPricePill}>
            <Icon icon="sell" size={11} color="current" />
            {priceLabel}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardTitle}>{service.title}</h3>
          {durationLabel !== "—" && (
            <span className={styles.cardDurationPill}>
              <Icon icon="schedule" size={11} color="current" />
              {durationLabel}
            </span>
          )}
        </div>

        {category && (
          <span className={styles.cardCategory}>{category}</span>
        )}

        <div className={styles.cardFooter}>
          <Link
            href={ownerHref}
            className={styles.cardOwner}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {owner.isBrand ? (
              brandLogoUrl ? (
                <span className={styles.cardOwnerLogo}>
                  <Image src={brandLogoUrl} alt={owner.name} fill sizes="20px" className={styles.cardOwnerLogoImg} />
                </span>
              ) : (
                <Icon icon="store" size={12} color="current" className={styles.cardOwnerIcon} />
              )
            ) : (
              <Icon icon="person" size={12} color="current" className={styles.cardOwnerIcon} />
            )}
            {owner.name}
          </Link>
          {branch && !owner.isBrand && (
            <span className={styles.cardBranch}>
              <Icon icon="location_on" size={12} color="current" />
              {branch.name}
            </span>
          )}
          {owner.isBrand && owner.brand.rating !== null && owner.brand.rating > 0 && (
            <span className={styles.cardRating}>
              <Icon icon="star" size={11} color="current" className={styles.cardStarIcon} />
              {owner.brand.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Service Detail View ──────────────────────────────────────────────────────

function ServiceDetailView({
  service,
  copy,
  brands,
  user,
  actionLoading,
  onBack,
  onEdit,
  onSubmit,
  onResubmit,
  onDelete,
  onPause,
  onResume,
  onArchive,
  onUnarchive,
}: {
  service: Service;
  copy: PageCopy;
  brands: Brand[];
  user: AuthenticatedUser;
  actionLoading: boolean;
  onBack: () => void;
  onEdit: () => void;
  onSubmit: () => void;
  onResubmit: () => void;
  onDelete: () => void;
  onPause: () => void;
  onResume: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const { messages } = useLocale();
  const statusLabel = getStatusLabel(service.status, copy);
  const badgeVariant = STATUS_BADGE_VARIANT[service.status];
  const priceLabel = formatPrice(service, copy);
  const durationLabel = formatDuration(service.duration, copy.fieldDurationUnit);
  const owner = getOwnerInfo(service, brands, user);
  const branch = service.branch_id ? getBranchById(brands, service.branch_id) : null;

  const category = service.service_category
    ? (messages.categories[service.service_category.key as keyof typeof messages.categories] ?? service.service_category.key)
    : null;

  const images = service.images.map((img) => proxyMediaUrl(img.url) ?? img.url);

  type BannerVariant = "warning" | "error" | "info" | "muted";
  const bannerConfig: Partial<Record<typeof service.status, { msg: string; variant: BannerVariant; icon: string }>> = {
    DRAFT:    { msg: copy.draftNote,    variant: "warning", icon: "info"     },
    PENDING:  { msg: copy.pendingNote,  variant: "info",    icon: "schedule" },
    PAUSED:   { msg: copy.pausedNote,   variant: "warning", icon: "info"     },
    REJECTED: { msg: copy.rejectedNote, variant: "error",   icon: "error"    },
    ARCHIVED: { msg: copy.archivedNote, variant: "muted",   icon: "archive"  },
  };
  const banner = bannerConfig[service.status] ?? null;

  return (
    <div className={styles.detailWrapper}>
      {/* Sticky header */}
      <div className={styles.detailHeader}>
        <Button variant="ghost" icon="arrow_back" onClick={onBack} />
        <div className={styles.detailHeaderMeta}>
          <h1 className={styles.detailTitle}>{service.title}</h1>
          <Badge variant={badgeVariant}>{statusLabel}</Badge>
        </div>
      </div>

      {banner !== null && (
        <div className={`${styles.statusBanner} ${styles[`statusBanner_${banner.variant}`]}`}>
          <Icon icon={banner.icon} size={15} color="current" className={styles.statusBannerIcon} />
          <span>{banner.msg}</span>
        </div>
      )}

      <div className={styles.detailShell}>
        {/* Left: images + description */}
        <div className={styles.detailMain}>
          {/* Image gallery */}
          {images.length > 0 ? (
            <div className={styles.detailGallery}>
              <div className={styles.detailHeroWrap}>
                <Image
                  src={images[0]}
                  alt={service.title}
                  fill
                  className={styles.detailHeroImage}
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className={styles.detailThumbnails}>
                  {images.slice(1).map((url, i) => (
                    <div key={i} className={styles.detailThumbWrap}>
                      <Image src={url} alt={`Photo ${i + 2}`} fill className={styles.detailThumbImage} sizes="120px" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.detailHeroPlaceholder}>
              <Icon icon="design_services" size={48} color="current" className={styles.detailPlaceholderIcon} />
            </div>
          )}

          {/* Description */}
          <div className={styles.detailSection}>
            <p className={styles.detailDescription}>
              {service.description || <em className={styles.noDescription}>{copy.noDescription}</em>}
            </p>
          </div>

          {/* Rejection reason */}
          {service.status === "REJECTED" && service.rejection_reason && (
            <div className={styles.rejectionBanner}>
              <Icon icon="info" size={14} color="current" />
              <span>
                <strong>{copy.labelRejectionReason}:</strong> {service.rejection_reason}
              </span>
            </div>
          )}
        </div>

        {/* Right: info + actions */}
        <div className={styles.detailSidebar}>
          {/* Info card */}
          <div className={styles.detailInfoCard}>
            <h2 className={styles.detailSidebarTitle}>{copy.detailInfo}</h2>

            <dl className={styles.detailDl}>
              {category && (
                <>
                  <dt className={styles.detailDt}>{copy.labelCategory}</dt>
                  <dd className={styles.detailDd}>
                    <span className={styles.detailChip}>{category}</span>
                  </dd>
                </>
              )}

              <dt className={styles.detailDt}>{copy.fieldPrice}</dt>
              <dd className={styles.detailDd}>{priceLabel}</dd>

              <dt className={styles.detailDt}>{copy.fieldDuration}</dt>
              <dd className={styles.detailDd}>{durationLabel}</dd>

              {branch && (
                <>
                  <dt className={styles.detailDt}>{copy.labelBranch}</dt>
                  <dd className={styles.detailDd}>{branch.name}</dd>
                </>
              )}

              {service.address && !branch && (
                <>
                  <dt className={styles.detailDt}>{copy.fieldAddress}</dt>
                  <dd className={styles.detailDd}>{service.address}</dd>
                </>
              )}
            </dl>

            <div className={styles.detailOwnerCardWrap}>
              {owner.isBrand ? (
                <OwnerCard
                  roleLabel={copy.labelOwner}
                  name={owner.brand.name}
                  href={`/brands?id=${owner.brand.id}`}
                  logoUrl={owner.brand.logo_url}
                  rating={owner.brand.rating}
                  ratingCount={owner.brand.rating_count}
                />
              ) : (
                <OwnerCard
                  roleLabel={copy.labelOwner}
                  name={owner.name}
                  href="/account"
                  avatarUrl={user.avatar_url}
                  initials={`${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()}
                  subtitle={user.email}
                />
              )}
            </div>
          </div>

          {/* Actions card */}
          <div className={styles.detailActionsCard}>
            <h2 className={styles.detailSidebarTitle}>{copy.detailActions}</h2>

            {service.status === "PENDING" && (
              <p className={styles.pendingNote}>{copy.pendingNote}</p>
            )}

            {service.status === "DRAFT" && (
              <div className={styles.detailActionGroup}>
                <Button variant="primary" icon="send" onClick={onSubmit} isLoading={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionSubmit}
                </Button>
                <Button variant="outline" icon="edit" onClick={onEdit} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionEdit}
                </Button>
                <Button variant="destructive" icon="delete" onClick={onDelete} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionDelete}
                </Button>
              </div>
            )}

            {service.status === "REJECTED" && (
              <div className={styles.detailActionGroup}>
                <Button variant="outline" icon="edit" onClick={onEdit} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionEdit}
                </Button>
                <Button variant="primary" icon="send" onClick={onResubmit} isLoading={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionResubmit}
                </Button>
              </div>
            )}

            {service.status === "ACTIVE" && (
              <div className={styles.detailActionGroup}>
                <Button variant="outline" icon="pause" onClick={onPause} isLoading={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionPause}
                </Button>
                <Button variant="ghost" icon="archive" onClick={onArchive} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionArchive}
                </Button>
              </div>
            )}

            {service.status === "PAUSED" && (
              <div className={styles.detailActionGroup}>
                <Button variant="primary" icon="edit" onClick={onEdit} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionEdit}
                </Button>
                <Button variant="outline" icon="play_arrow" onClick={onResume} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionResume}
                </Button>
                <Button variant="ghost" icon="archive" onClick={onArchive} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionArchive}
                </Button>
              </div>
            )}

            {service.status === "ARCHIVED" && (
              <div className={styles.detailActionGroup}>
                <Button variant="outline" icon="autorenew" onClick={onUnarchive} isLoading={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionUnarchive}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ServicesUsoPage({
  services: initialServices,
  brands,
  accessToken,
  serviceCategories,
  user,
}: ServicesUsoPageProps) {
  const { locale } = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const searchParams = useSearchParams();

  const [services, setServices] = useState<Service[]>(initialServices);

  const initialServiceId = searchParams.get("id");
  const initialService = initialServiceId
    ? initialServices.find((s) => s.id === initialServiceId) ?? null
    : null;
  const initialAction = searchParams.get("action");
  const initialBrandId = searchParams.get("brand") ?? undefined;

  const isEditAction = initialAction === "edit" && Boolean(initialService);

  const [view, setView] = useState<"list" | "detail" | "form">(
    isEditAction ? "form" : initialService ? "detail" : initialAction === "create" ? "form" : "list",
  );
  const [viewService, setViewService] = useState<Service | null>(
    isEditAction ? null : initialService,
  );
  const [createBrandId, setCreateBrandId] = useState<string | undefined>(
    initialAction === "create" ? initialBrandId : undefined,
  );

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const match = services.find((s) => s.id === id);
    if (match) {
      setViewService(match);
      setView("detail");
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const [editingService, setEditingService] = useState<Service | null>(
    isEditAction ? initialService : null,
  );
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  function openDetail(service: Service) {
    setViewService(service);
    setView("detail");
  }

  function openCreate(brandId?: string) {
    setEditingService(null);
    setCreateBrandId(brandId);
    setView("form");
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setViewService(null);
    setView("form");
  }

  function openEditFromDetail(service: Service) {
    setEditingService(service);
    setView("form");
  }

  function backToList() {
    setViewService(null);
    setEditingService(null);
    setCreateBrandId(undefined);
    setView("list");
  }

  function backToDetail() {
    setEditingService(null);
    setView("detail");
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
      window.dispatchEvent(new Event("reziphay:services-changed"));
      showFeedback("success", copy.successDelete);
      backToList();
    } catch {
      showFeedback("error", copy.errorGeneric);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleLifecycle(
    service: Service,
    action: "submit" | "resubmit" | "pause" | "resume" | "archive" | "unarchive",
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
      } else if (action === "unarchive") {
        updated = await unarchiveService(service.id, accessToken);
        successMsg = copy.successUnarchive;
      } else {
        updated = await archiveService(service.id, accessToken);
        successMsg = copy.successArchive;
      }
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setViewService(updated);
      window.dispatchEvent(new Event("reziphay:services-changed"));
      showFeedback("success", successMsg);
    } catch {
      showFeedback("error", copy.errorGeneric);
    } finally {
      setActionLoadingId(null);
    }
  }

  if (view === "form") {
    return (
      <ServiceFormPage
        key={editingService?.id ?? `create-${createBrandId ?? ""}`}
        copy={copy}
        brands={brands}
        serviceCategories={serviceCategories}
        accessToken={accessToken}
        editingService={editingService}
        initialBrandId={editingService ? undefined : createBrandId}
        onSaved={(service, isNew) => {
          if (isNew) {
            setServices((prev) => [service, ...prev]);
            window.dispatchEvent(new Event("reziphay:services-changed"));
            showFeedback("success", copy.successCreate);
            backToList();
          } else {
            setServices((prev) => prev.map((s) => (s.id === service.id ? service : s)));
            setViewService(service);
            window.dispatchEvent(new Event("reziphay:services-changed"));
            showFeedback("success", copy.successUpdate);
            backToDetail();
          }
        }}
        onCancel={viewService ? backToDetail : backToList}
      />
    );
  }

  if (view === "detail" && viewService) {
    const liveService = services.find((s) => s.id === viewService.id) ?? viewService;
    return (
      <ServiceDetailView
        service={liveService}
        copy={copy}
        brands={brands}
        user={user}
        actionLoading={actionLoadingId === liveService.id}
        onBack={backToList}
        onEdit={() => openEditFromDetail(liveService)}
        onSubmit={() => handleLifecycle(liveService, "submit")}
        onResubmit={() => handleLifecycle(liveService, "resubmit")}
        onDelete={() => handleDelete(liveService)}
        onPause={() => handleLifecycle(liveService, "pause")}
        onResume={() => handleLifecycle(liveService, "resume")}
        onArchive={() => handleLifecycle(liveService, "archive")}
        onUnarchive={() => handleLifecycle(liveService, "unarchive")}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{copy.pageTitle}</h1>
        <Button variant="primary" icon="add" onClick={() => openCreate()}>
          {copy.createService}
        </Button>
      </div>

      {feedback ? (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError
          }`}
        >
          <Icon icon={feedback.type === "success" ? "check_circle" : "error"} size={16} color="current" />
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
          <Button variant="primary" icon="add" onClick={() => openCreate()}>
            {copy.createService}
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              copy={copy}
              brands={brands}
              user={user}
              onClick={() => openDetail(service)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
