"use client";

import { type ReactNode, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isAxiosError } from "axios";
import {
  Button,
  Field,
  FieldLabel,
  FieldContent,
  Input,
} from "@/components/atoms";
import { Combobox, type ComboboxOption } from "@/components/atoms/combobox";
import { AvatarCropDialog } from "@/components/molecules/avatar-crop-dialog/avatar-crop-dialog";
import { FormFooter } from "@/components/molecules/form-footer";
import { Switch } from "@/components/atoms/switch";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import type { Messages } from "@/i18n/types";
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
import { PageSurfaceHeader } from "@/components/molecules/page-surface-header";
import { RichTextEditor } from "@/components/molecules/rich-text-editor/rich-text-editor";
import { RichTextDisplay } from "@/components/molecules/rich-text-editor/rich-text-display";
import { StatusBadge, type StatusBadgeTone } from "@/components/molecules/status-badge";
import { StatusBanner, type StatusBannerVariant } from "@/components/molecules/status-banner";
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

const SERVICE_STATUS_TONE: Record<ServiceStatus, StatusBadgeTone> = {
  DRAFT: "muted",
  PENDING: "warning",
  ACTIVE: "success",
  REJECTED: "error",
  PAUSED: "muted",
  ARCHIVED: "muted",
};

const SERVICE_STATUS_ICON: Record<ServiceStatus, string> = {
  ACTIVE: "check_circle",
  PENDING: "schedule",
  DRAFT: "edit",
  PAUSED: "pause",
  REJECTED: "error",
  ARCHIVED: "archive",
};

function formatPrice(service: Service, copy: Messages["services"]): string {
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

function getStatusLabel(status: ServiceStatus, copy: Messages["services"]): string {
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
  copy: Messages["services"];
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

  function renderFormActions(layout: "default" | "aside" = "default") {
    return (
      <FormFooter layout={layout}>
        <Button
          variant="primary"
          type="submit"
          isLoading={isLoading}
          disabled={!form.title.trim() || isLoading}
          icon={isLoading ? undefined : isEditingPaused ? "send" : "check"}
        >
          {isEditingPaused ? copy.btnResubmit : copy.btnSave}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          {copy.btnCancel}
        </Button>
      </FormFooter>
    );
  }

  return (
    <div className={styles.formWrapper}>
      <PageSurfaceHeader
        title={editingService ? copy.formEditTitle : copy.formCreateTitle}
        subtitle={editingService ? copy.actionEdit : copy.createService}
        onBack={onCancel}
      />

      {feedback ? (
        <StatusBanner variant={feedback.type === "success" ? "success" : "error"}>
          {feedback.message}
        </StatusBanner>
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
                      <Button
                        variant="unstyled"
                        type="button"
                        className={styles.removePreviewBtn}
                        aria-label={`${copy.removePhotoLabel} ${index + 1}`}
                        onClick={() => removeImage(index)}
                      >
                        <Icon icon="close" size={12} color="current" />
                      </Button>
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
              {renderFormActions("aside")}
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
                  <RichTextEditor
                    value={form.description}
                    onChange={(html) => setField("description", html)}
                    placeholder={copy.fieldDescriptionPlaceholder}
                    disabled={isLoading}
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
  copy: Messages["services"];
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
        <StatusBadge
          appearance="overlay"
          tone={SERVICE_STATUS_TONE[service.status]}
          icon={SERVICE_STATUS_ICON[service.status]}
          className={styles.cardStatusPill}
        >
          {statusLabel}
        </StatusBadge>
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

export function ServiceDetailView({
  service,
  copy,
  brands,
  user,
  actionLoading,
  actionSlot,
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
  copy: Messages["services"];
  brands: Brand[];
  user: AuthenticatedUser;
  actionLoading: boolean;
  actionSlot?: ReactNode;
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
  const priceLabel = formatPrice(service, copy);
  const durationLabel = formatDuration(service.duration, copy.fieldDurationUnit);
  const owner = getOwnerInfo(service, brands, user);
  const branch = service.branch_id ? getBranchById(brands, service.branch_id) : null;

  const category = service.service_category
    ? (messages.categories[service.service_category.key as keyof typeof messages.categories] ?? service.service_category.key)
    : null;

  const images = service.images.map((img) => proxyMediaUrl(img.url) ?? img.url);

  const bannerConfig: Partial<Record<typeof service.status, { msg: string; variant: StatusBannerVariant; icon: string }>> = {
    DRAFT:    { msg: copy.draftNote,    variant: "warning", icon: "info"     },
    PENDING:  { msg: copy.pendingNote,  variant: "warning", icon: "schedule" },
    PAUSED:   { msg: copy.pausedNote,   variant: "info",    icon: "pause"    },
    REJECTED: { msg: copy.rejectedNote, variant: "error",   icon: "error"    },
    ARCHIVED: { msg: copy.archivedNote, variant: "muted",   icon: "archive"  },
  };
  const banner = bannerConfig[service.status] ?? null;

  return (
    <div className={styles.detailWrapper}>
      <PageSurfaceHeader
        title={service.title}
        titleAddon={
          <StatusBadge tone={SERVICE_STATUS_TONE[service.status]}>
            {statusLabel}
          </StatusBadge>
        }
        onBack={onBack}
      />

      {banner !== null && (
        <StatusBanner variant={banner.variant} icon={banner.icon} className={styles.detailStatusBanner}>
          {banner.msg}
        </StatusBanner>
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
            <RichTextDisplay
              html={service.description ?? ""}
              className={styles.detailDescription}
              emptyFallback={copy.noDescription}
            />
          </div>

          {/* Rejection reason */}
          {service.status === "REJECTED" && service.rejection_reason && (
            <StatusBanner variant="error" icon="error" className={styles.rejectionBanner}>
              <strong>{copy.labelRejectionReason}:</strong> {service.rejection_reason}
            </StatusBanner>
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

            {actionSlot ? (
              <div className={styles.detailActionGroup}>{actionSlot}</div>
            ) : service.status === "PENDING" ? (
              <p className={styles.pendingNote}>{copy.pendingNote}</p>
            ) : null}

            {!actionSlot && service.status === "DRAFT" && (
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

            {!actionSlot && service.status === "REJECTED" && (
              <div className={styles.detailActionGroup}>
                <Button variant="outline" icon="edit" onClick={onEdit} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionEdit}
                </Button>
                <Button variant="primary" icon="send" onClick={onResubmit} isLoading={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionResubmit}
                </Button>
              </div>
            )}

            {!actionSlot && service.status === "ACTIVE" && (
              <div className={styles.detailActionGroup}>
                <Button variant="outline" icon="pause" onClick={onPause} isLoading={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionPause}
                </Button>
                <Button variant="ghost" icon="archive" onClick={onArchive} disabled={actionLoading} className={styles.detailActionBtn}>
                  {copy.actionArchive}
                </Button>
              </div>
            )}

            {!actionSlot && service.status === "PAUSED" && (
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

            {!actionSlot && service.status === "ARCHIVED" && (
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

export function ServiceReadOnlyDetailView({
  service,
  brands,
  user,
  actionSlot,
  onBack,
}: {
  service: Service;
  brands: Brand[];
  user: AuthenticatedUser;
  actionSlot?: ReactNode;
  onBack: () => void;
}) {
  const { messages } = useLocale();
  const copy = messages.services;
  const noop = () => {};

  return (
    <ServiceDetailView
      service={service}
      copy={copy}
      brands={brands}
      user={user}
      actionLoading={false}
      actionSlot={actionSlot}
      onBack={onBack}
      onEdit={noop}
      onSubmit={noop}
      onResubmit={noop}
      onDelete={noop}
      onPause={noop}
      onResume={noop}
      onArchive={noop}
      onUnarchive={noop}
    />
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
  const { messages } = useLocale();
  const copy = messages.services;
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

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
  const [editingService, setEditingService] = useState<Service | null>(
    isEditAction ? initialService : null,
  );
  const [createBrandId, setCreateBrandId] = useState<string | undefined>(
    initialAction === "create" ? initialBrandId : undefined,
  );

  useEffect(() => {
    const params = new URLSearchParams(searchKey);
    const action = params.get("action");
    const id = params.get("id");
    const brandId = params.get("brand") ?? undefined;

    if (action === "create") {
      setEditingService(null);
      setViewService(null);
      setCreateBrandId(brandId);
      setView("form");
      return;
    }

    if (action === "edit" && id) {
      const match = services.find((s) => s.id === id);
      if (match) {
        setEditingService(match);
        setViewService(match);
        setCreateBrandId(undefined);
        setView("form");
      }
      return;
    }

    if (id) {
      const match = services.find((s) => s.id === id);
      if (match) {
        setEditingService(null);
        setViewService(match);
        setCreateBrandId(undefined);
        setView("detail");
      }
      return;
    }

    setEditingService(null);
    setViewService(null);
    setCreateBrandId(undefined);
    setView("list");
  }, [searchKey, services]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  function pushServicesRoute(params?: { id?: string; action?: "create" | "edit"; brand?: string }) {
    const nextParams = new URLSearchParams();
    if (params?.id) nextParams.set("id", params.id);
    if (params?.action) nextParams.set("action", params.action);
    if (params?.brand) nextParams.set("brand", params.brand);

    const query = nextParams.toString();
    router.push(query ? `/services?${query}` : "/services", { scroll: false });
  }

  function openDetail(service: Service) {
    setViewService(service);
    setEditingService(null);
    setCreateBrandId(undefined);
    setView("detail");
    pushServicesRoute({ id: service.id });
  }

  function openCreate(brandId?: string) {
    setEditingService(null);
    setViewService(null);
    setCreateBrandId(brandId);
    setView("form");
    pushServicesRoute({ action: "create", brand: brandId });
  }

  function openEditFromDetail(service: Service) {
    setEditingService(service);
    setViewService(service);
    setView("form");
    pushServicesRoute({ id: service.id, action: "edit" });
  }

  function backToList() {
    setViewService(null);
    setEditingService(null);
    setCreateBrandId(undefined);
    setView("list");
    pushServicesRoute();
  }

  function backToDetail() {
    setEditingService(null);
    setCreateBrandId(undefined);
    setView("detail");
    if (viewService) {
      pushServicesRoute({ id: viewService.id });
    }
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
        <StatusBanner
          variant={feedback.type === "success" ? "success" : "error"}
          icon={feedback.type === "success" ? "check_circle" : "error"}
        >
          {feedback.message}
        </StatusBanner>
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
