"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/atoms/button";
import { Field, FieldLabel, Input } from "@/components/atoms/input";
import {
  Combobox,
  type ComboboxOption,
} from "@/components/atoms/combobox";
import { ImageCropModal } from "@/components/atoms/image-crop-modal/image-crop-modal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/atoms/alert-dialog";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import {
  createBrand,
  createBranch,
  updateBrand,
  updateBranch,
  deleteBranchApi,
  uploadBrandMedia,
  deleteBrand,
  initiateTransfer,
  searchUsoUsers,
  type UserSearchResult,
  type DeleteBrandPayload,
} from "@/lib/brands-api";
import type { Brand, BrandCategory, BrandGalleryItem } from "@/types/brand";
import { BranchModal } from "./branch-modal";
import styles from "./brand-form.module.css";

// Branch draft preserves the server id for persisted branches
type BranchDraft = {
  id?: string; // undefined = new (not yet persisted)
  name: string;
  description?: string;
  address1: string;
  address2?: string;
  phone?: string;
  email?: string;
  is_24_7: boolean;
  opening?: string;
  closing?: string;
  breaks: { id?: string; start: string; end: string }[];
};

type BrandFormDraft = {
  name: string;
  description: string;
  category_ids: string[];
  logoFile: File | null;
  /** null  = explicit removal; undefined = unchanged (edit only); string = existing URL */
  logoPreviewUrl: string | null;
  logoRemoved: boolean; // true when user explicitly removed an existing logo
  existingGalleryItems: BrandGalleryItem[]; // existing server items to keep
  newGalleryFiles: File[];
  newGalleryPreviewUrls: string[];
  branches: BranchDraft[];
};

type BrandFormProps = {
  mode: "create" | "edit";
  brand?: Brand;
  categories: BrandCategory[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

function createEmptyDraft(): BrandFormDraft {
  return {
    name: "",
    description: "",
    category_ids: [],
    logoFile: null,
    logoPreviewUrl: null,
    logoRemoved: false,
    existingGalleryItems: [],
    newGalleryFiles: [],
    newGalleryPreviewUrls: [],
    branches: [],
  };
}

function brandToDraft(brand: Brand): BrandFormDraft {
  return {
    name: brand.name,
    description: brand.description ?? "",
    category_ids: brand.categories.map((c) => c.id),
    logoFile: null,
    logoPreviewUrl: brand.logo_url ?? null,
    logoRemoved: false,
    existingGalleryItems: (brand.gallery ?? []).slice().sort((a, b) => a.order - b.order),
    newGalleryFiles: [],
    newGalleryPreviewUrls: [],
    branches: (brand.branches ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      address1: b.address1,
      address2: b.address2,
      phone: b.phone,
      email: b.email,
      is_24_7: b.is_24_7,
      opening: b.opening,
      closing: b.closing,
      breaks: b.breaks,
    })),
  };
}

type CropTarget = {
  file: File;
  aspectRatio: "1:1" | "16:9";
  onDone: (croppedFile: File) => void;
};

export function BrandForm({
  mode,
  brand,
  categories,
  emailVerified,
  phoneVerified,
}: BrandFormProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);

  const [draft, setDraft] = useState<BrandFormDraft>(
    mode === "edit" && brand ? brandToDraft(brand) : createEmptyDraft(),
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Crop modal state
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Branch modal state
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranchIndex, setEditingBranchIndex] = useState<number | null>(null);

  // Transfer modal state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferQuery, setTransferQuery] = useState("");
  const [transferResults, setTransferResults] = useState<UserSearchResult[]>([]);
  const [transferSearchLoading, setTransferSearchLoading] = useState(false);
  const [selectedTransferTarget, setSelectedTransferTarget] = useState<UserSearchResult | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteServiceHandling, setDeleteServiceHandling] = useState<DeleteBrandPayload["service_handling"]>("delete");
  const [deleteTargetQuery, setDeleteTargetQuery] = useState("");
  const [deleteTargetResults, setDeleteTargetResults] = useState<UserSearchResult[]>([]);
  const [deleteTargetSearchLoading, setDeleteTargetSearchLoading] = useState(false);
  const [selectedDeleteTarget, setSelectedDeleteTarget] = useState<UserSearchResult | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categoryOptions: ComboboxOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const verificationMissing =
    mode === "create" && !emailVerified && !phoneVerified;

  function updateField<K extends keyof BrandFormDraft>(
    key: K,
    value: BrandFormDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (logoInputRef.current) logoInputRef.current.value = "";
    if (!file) return;

    setCropTarget({
      file,
      aspectRatio: "1:1",
      onDone: (croppedFile) => {
        if (draft.logoPreviewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(draft.logoPreviewUrl);
        }
        const url = URL.createObjectURL(croppedFile);
        setDraft((prev) => ({
          ...prev,
          logoFile: croppedFile,
          logoPreviewUrl: url,
          logoRemoved: false,
        }));
        setCropTarget(null);
      },
    });
  }

  function handleRemoveLogo() {
    if (draft.logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(draft.logoPreviewUrl);
    }
    setDraft((prev) => ({
      ...prev,
      logoFile: null,
      logoPreviewUrl: null,
      logoRemoved: true,
    }));
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (!file) return;

    setCropTarget({
      file,
      aspectRatio: "16:9",
      onDone: (croppedFile) => {
        const url = URL.createObjectURL(croppedFile);
        setDraft((prev) => ({
          ...prev,
          newGalleryFiles: [...prev.newGalleryFiles, croppedFile],
          newGalleryPreviewUrls: [...prev.newGalleryPreviewUrls, url],
        }));
        setCropTarget(null);
      },
    });
  }

  function handleRemoveExistingGalleryItem(index: number) {
    setDraft((prev) => ({
      ...prev,
      existingGalleryItems: prev.existingGalleryItems.filter((_, i) => i !== index),
    }));
  }

  function handleRemoveNewGalleryItem(index: number) {
    const url = draft.newGalleryPreviewUrls[index];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    setDraft((prev) => ({
      ...prev,
      newGalleryFiles: prev.newGalleryFiles.filter((_, i) => i !== index),
      newGalleryPreviewUrls: prev.newGalleryPreviewUrls.filter((_, i) => i !== index),
    }));
  }

  function handleAddBranch() {
    setEditingBranchIndex(null);
    setBranchModalOpen(true);
  }

  function handleEditBranch(index: number) {
    setEditingBranchIndex(index);
    setBranchModalOpen(true);
  }

  function handleDeleteBranch(index: number) {
    setDraft((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  }

  function handleBranchSave(branchDraft: BranchDraft) {
    if (editingBranchIndex !== null) {
      setDraft((prev) => {
        const next = [...prev.branches];
        next[editingBranchIndex] = branchDraft;
        return { ...prev, branches: next };
      });
    } else {
      setDraft((prev) => ({
        ...prev,
        branches: [...prev.branches, branchDraft],
      }));
    }
    setEditingBranchIndex(null);
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<string, string>> = {};
    if (!draft.name.trim()) {
      nextErrors.name = t.nameRequiredMessage;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = session.accessToken;
    if (!accessToken) {
      setFeedback({ type: "error", message: t.loginRequired });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      // Upload new logo if selected
      let logoMediaId: string | undefined;
      if (draft.logoFile) {
        const uploaded = await uploadBrandMedia(draft.logoFile, accessToken);
        logoMediaId = uploaded.media_id;
      }

      // Upload new gallery files
      const newGalleryMediaIds: string[] = [];
      for (const file of draft.newGalleryFiles) {
        const uploaded = await uploadBrandMedia(file, accessToken);
        newGalleryMediaIds.push(uploaded.media_id);
      }

      if (mode === "create") {
        const allGalleryIds = newGalleryMediaIds;

        const newBrand = await createBrand({
          name: draft.name.trim(),
          description: draft.description.trim() || undefined,
          categoryIds: draft.category_ids.length > 0 ? draft.category_ids : undefined,
          logo_media_id: logoMediaId,
          gallery_media_ids: allGalleryIds.length > 0 ? allGalleryIds : undefined,
        }, accessToken);

        for (const b of draft.branches) {
          await createBranch(newBrand.id, {
            name: b.name,
            description: b.description || undefined,
            address1: b.address1,
            address2: b.address2 || undefined,
            phone: b.phone || undefined,
            email: b.email || undefined,
            is_24_7: b.is_24_7,
            opening: b.opening || undefined,
            closing: b.closing || undefined,
            breaks: b.breaks.map((br) => ({ start: br.start, end: br.end })),
          }, accessToken);
        }

        setFeedback({ type: "success", message: t.createSuccessDescription });
        setDraft(createEmptyDraft());
      } else if (mode === "edit" && brand) {
        // Build full gallery: keep remaining existing items + new uploads
        const existingMediaIds = draft.existingGalleryItems.map((g) => g.media_id);
        const allGalleryIds = [...existingMediaIds, ...newGalleryMediaIds];

        // Only include gallery_media_ids in payload if anything changed
        const galleryChanged =
          existingMediaIds.length !== (brand.gallery ?? []).length ||
          newGalleryMediaIds.length > 0;

        const payload = {
          name: draft.name.trim(),
          description: draft.description.trim() || undefined,
          categoryIds: draft.category_ids.length > 0 ? draft.category_ids : undefined,
          // Logo: new file takes precedence; removal sends null; no change omits field
          ...(logoMediaId !== undefined
            ? { logo_media_id: logoMediaId }
            : draft.logoRemoved
              ? { logo_media_id: null as null }
              : {}),
          ...(galleryChanged ? { gallery_media_ids: allGalleryIds } : {}),
        };
        await updateBrand(brand.id, payload, accessToken);

        // Branch CRUD: diff against original brand branches
        const originalIds = new Set((brand.branches ?? []).map((b) => b.id));
        const currentIds = new Set(draft.branches.filter((b) => b.id).map((b) => b.id!));

        // Delete removed branches
        for (const origId of originalIds) {
          if (!currentIds.has(origId)) {
            await deleteBranchApi(brand.id, origId, accessToken);
          }
        }

        // Update existing / create new
        for (const b of draft.branches) {
          if (b.id && originalIds.has(b.id)) {
            await updateBranch(brand.id, b.id, {
              name: b.name,
              description: b.description ?? null,
              address1: b.address1,
              address2: b.address2 ?? null,
              phone: b.phone ?? null,
              email: b.email ?? null,
              is_24_7: b.is_24_7,
              opening: b.is_24_7 ? null : (b.opening ?? null),
              closing: b.is_24_7 ? null : (b.closing ?? null),
              breaks: b.breaks.map((br) => ({ start: br.start, end: br.end })),
            }, accessToken);
          } else if (!b.id) {
            await createBranch(brand.id, {
              name: b.name,
              description: b.description || undefined,
              address1: b.address1,
              address2: b.address2 || undefined,
              phone: b.phone || undefined,
              email: b.email || undefined,
              is_24_7: b.is_24_7,
              opening: b.opening || undefined,
              closing: b.closing || undefined,
              breaks: b.breaks.map((br) => ({ start: br.start, end: br.end })),
            }, accessToken);
          }
        }

        setFeedback({ type: "success", message: t.updateSuccessDescription });
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message as string) ?? t.errorGeneric
        : t.errorGeneric;
      setFeedback({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  // ── Transfer handlers ───────────────────────────────────────────────────────

  async function handleTransferSearch(q: string) {
    setTransferQuery(q);
    setSelectedTransferTarget(null);
    if (q.trim().length < 2) {
      setTransferResults([]);
      return;
    }
    const accessToken = session.accessToken;
    if (!accessToken) return;
    setTransferSearchLoading(true);
    try {
      const results = await searchUsoUsers(q, accessToken);
      setTransferResults(results);
    } finally {
      setTransferSearchLoading(false);
    }
  }

  async function handleTransferConfirm() {
    if (!selectedTransferTarget || !brand) return;
    const accessToken = session.accessToken;
    if (!accessToken) return;
    setTransferLoading(true);
    try {
      await initiateTransfer(brand.id, selectedTransferTarget.id, accessToken);
      setTransferModalOpen(false);
      setFeedback({ type: "success", message: t.transferSuccessDescription });
      setSelectedTransferTarget(null);
      setTransferQuery("");
      setTransferResults([]);
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message as string) ?? t.errorGeneric
        : t.errorGeneric;
      setFeedback({ type: "error", message });
    } finally {
      setTransferLoading(false);
    }
  }

  // ── Delete handlers ─────────────────────────────────────────────────────────

  async function handleDeleteTargetSearch(q: string) {
    setDeleteTargetQuery(q);
    setSelectedDeleteTarget(null);
    if (q.trim().length < 2) {
      setDeleteTargetResults([]);
      return;
    }
    const accessToken = session.accessToken;
    if (!accessToken) return;
    setDeleteTargetSearchLoading(true);
    try {
      const results = await searchUsoUsers(q, accessToken);
      setDeleteTargetResults(results);
    } finally {
      setDeleteTargetSearchLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!brand) return;
    if (deleteServiceHandling === "transfer_to_other" && !selectedDeleteTarget) return;
    const accessToken = session.accessToken;
    if (!accessToken) return;
    setDeleteLoading(true);
    try {
      await deleteBrand(brand.id, {
        service_handling: deleteServiceHandling,
        service_target_user_id: selectedDeleteTarget?.id,
      }, accessToken);
      setDeleteModalOpen(false);
      router.replace("/brands");
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message as string) ?? t.errorGeneric
        : t.errorGeneric;
      setFeedback({ type: "error", message });
    } finally {
      setDeleteLoading(false);
    }
  }

  const editingBranch =
    editingBranchIndex !== null ? draft.branches[editingBranchIndex] : undefined;

  const allGalleryPreviews: { url: string; isExisting: boolean; index: number }[] = [
    ...draft.existingGalleryItems.map((g, i) => ({ url: g.url, isExisting: true, index: i })),
    ...draft.newGalleryPreviewUrls.map((url, i) => ({ url, isExisting: false, index: i })),
  ];

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <Button variant="ghost" icon="arrow_back" onClick={handleCancel} />
        <h1 className={styles.title}>
          {mode === "create" ? t.formCreateTitle : t.formEditTitle}
        </h1>
      </div>

      {/* Verification warning (create mode only) */}
      {verificationMissing && (
        <div className={`${styles.feedback} ${styles.feedbackError}`}>
          <strong>{t.verificationRequiredTitle}</strong>
          {" — "}
          {t.verificationRequiredDescription}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Basic info */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>{t.basicInfoSection}</h2>

          <Field>
            <FieldLabel required>{t.fieldName}</FieldLabel>
            <Input
              value={draft.name}
              placeholder={t.fieldNamePlaceholder}
              aria-invalid={!!errors.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {errors.name && (
              <p className={styles.fieldError}>{errors.name}</p>
            )}
          </Field>

          <Field>
            <FieldLabel>{t.fieldDescription}</FieldLabel>
            <textarea
              className={styles.textarea}
              value={draft.description}
              placeholder={t.fieldDescriptionPlaceholder}
              rows={4}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>{t.fieldCategories}</FieldLabel>
            <Combobox
              items={categoryOptions}
              value={draft.category_ids}
              multiple
              placeholder={t.fieldCategoriesPlaceholder}
              emptyMessage={t.noCategoriesFound}
              onValueChange={(val) =>
                updateField(
                  "category_ids",
                  Array.isArray(val) ? val : val ? [val] : [],
                )
              }
            />
          </Field>
        </div>

        {/* Logo */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>{t.fieldLogo}</h2>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-small)",
              color: "var(--app-text-muted)",
            }}
          >
            {t.fieldLogoHint}
          </p>

          {draft.logoPreviewUrl ? (
            <div className={styles.logoPreview}>
              <Image
                src={draft.logoPreviewUrl}
                alt="Logo preview"
                fill
                className={styles.previewImage}
                sizes="160px"
              />
              <button
                type="button"
                className={styles.removePreviewBtn}
                aria-label="Remove logo"
                onClick={handleRemoveLogo}
              >
                <Icon icon="close" size={12} color="current" />
              </button>
            </div>
          ) : (
            <label className={`${styles.uploadArea} ${styles.uploadAreaSquare}`}>
              <div className={styles.uploadContent}>
                <Icon
                  icon="add_photo_alternate"
                  size={28}
                  color="current"
                  className={styles.uploadIcon}
                />
                <p className={styles.uploadLabel}>{t.fieldLogoUpload}</p>
                <p className={styles.uploadHint}>{t.fieldLogoFormatHint}</p>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleLogoChange}
              />
            </label>
          )}
        </div>

        {/* Gallery */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>{t.fieldGallery}</h2>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-small)",
              color: "var(--app-text-muted)",
            }}
          >
            {t.fieldGalleryHint}
          </p>

          <label className={`${styles.uploadArea} ${styles.uploadAreaWide}`}>
            <div className={styles.uploadContent}>
              <Icon
                icon="add_photo_alternate"
                size={28}
                color="current"
                className={styles.uploadIcon}
              />
              <p className={styles.uploadLabel}>{t.fieldGalleryUpload}</p>
              <p className={styles.uploadHint}>{t.fieldGalleryFormatHint}</p>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleGalleryChange}
            />
          </label>

          {allGalleryPreviews.length > 0 && (
            <div className={styles.galleryPreviewRow}>
              {allGalleryPreviews.map(({ url, isExisting, index }) => (
                <div key={url} className={styles.galleryPreviewItem}>
                  <Image
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className={styles.previewImage}
                    sizes="128px"
                  />
                  <button
                    type="button"
                    className={styles.removePreviewBtn}
                    aria-label={`Remove gallery image ${index + 1}`}
                    onClick={() =>
                      isExisting
                        ? handleRemoveExistingGalleryItem(index)
                        : handleRemoveNewGalleryItem(index)
                    }
                  >
                    <Icon icon="close" size={12} color="current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branches */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>{t.branchesTitle}</h2>

          <div className={styles.branchesList}>
            {draft.branches.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-small)",
                  color: "var(--app-text-muted)",
                }}
              >
                {t.noBranches}
              </p>
            ) : (
              draft.branches.map((branch, index) => (
                <div key={branch.id ?? `new-${index}`} className={styles.branchItem}>
                  <div className={styles.branchItemInfo}>
                    <p className={styles.branchItemName}>{branch.name}</p>
                    <p className={styles.branchItemAddress}>
                      {branch.address1}
                      {branch.address2 ? `, ${branch.address2}` : ""}
                    </p>
                  </div>
                  <div className={styles.branchItemActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`Edit ${branch.name}`}
                      onClick={() => handleEditBranch(index)}
                    >
                      <Icon icon="edit" size={14} color="current" />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                      aria-label={`Delete ${branch.name}`}
                      onClick={() => handleDeleteBranch(index)}
                    >
                      <Icon icon="delete" size={14} color="current" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            icon="add"
            type="button"
            onClick={handleAddBranch}
          >
            {t.addBranch}
          </Button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`${styles.feedback} ${
              feedback.type === "success"
                ? styles.feedbackSuccess
                : styles.feedbackError
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Submit */}
        <div className={styles.formFooter}>
          <Button variant="outline" type="button" onClick={handleCancel}>
            {t.cancelForm}
          </Button>

          {mode === "edit" && brand && (
            <>
              <Button
                variant="outline"
                type="button"
                icon="swap_horiz"
                onClick={() => setTransferModalOpen(true)}
              >
                {t.transferBrand}
              </Button>
              <Button
                variant="outline"
                type="button"
                icon="delete"
                onClick={() => setDeleteModalOpen(true)}
              >
                {t.deleteBrand}
              </Button>
            </>
          )}

          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
            icon={isLoading ? undefined : "check"}
            disabled={
              isLoading ||
              verificationMissing ||
              (mode === "create" &&
                (!draft.name.trim() ||
                  !draft.logoFile ||
                  draft.branches.length === 0))
            }
          >
            {mode === "create" ? t.createBrand : t.formSaveChanges}
          </Button>
        </div>
      </form>

      {/* Branch modal — keyed so it remounts when switching between add and different edits */}
      <BranchModal
        key={editingBranchIndex === null ? "new" : `edit-${editingBranchIndex}`}
        open={branchModalOpen}
        onOpenChange={setBranchModalOpen}
        initial={editingBranch}
        onSave={handleBranchSave}
      />

      {/* Image crop modal */}
      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspectRatio={cropTarget.aspectRatio}
          onCrop={cropTarget.onDone}
          onCancel={() => setCropTarget(null)}
        />
      )}

      {/* Transfer modal */}
      <AlertDialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.transferModalTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.transferModalDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Input
              value={transferQuery}
              placeholder={t.transferSearchPlaceholder}
              onChange={(e) => handleTransferSearch(e.target.value)}
            />
            {transferSearchLoading && (
              <p style={{ margin: 0, fontSize: "var(--font-size-small)", color: "var(--app-text-muted)" }}>
                ...
              </p>
            )}
            {transferResults.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedTransferTarget(u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem",
                  background: selectedTransferTarget?.id === u.id ? "var(--app-surface-raised)" : "transparent",
                  border: "1px solid var(--app-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "var(--font-size-small)" }}>
                  {u.first_name} {u.last_name} — {u.email}
                </span>
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.transferCancel}</AlertDialogCancel>
            <Button
              variant="primary"
              disabled={!selectedTransferTarget || transferLoading}
              isLoading={transferLoading}
              onClick={handleTransferConfirm}
            >
              {t.transferConfirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteModalTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteModalDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(
              [
                { value: "delete", label: t.deleteWithServices },
                { value: "transfer_to_self", label: t.deleteServicesTransferToMe },
                { value: "transfer_to_other", label: t.deleteServicesTransferToOther },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setDeleteServiceHandling(opt.value);
                  setSelectedDeleteTarget(null);
                  setDeleteTargetQuery("");
                  setDeleteTargetResults([]);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem",
                  background: deleteServiceHandling === opt.value ? "var(--app-surface-raised)" : "transparent",
                  border: "1px solid var(--app-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "var(--font-size-small)" }}>{opt.label}</span>
              </button>
            ))}

            {deleteServiceHandling === "transfer_to_other" && (
              <>
                <Input
                  value={deleteTargetQuery}
                  placeholder={t.transferSearchPlaceholder}
                  onChange={(e) => handleDeleteTargetSearch(e.target.value)}
                />
                {deleteTargetSearchLoading && (
                  <p style={{ margin: 0, fontSize: "var(--font-size-small)", color: "var(--app-text-muted)" }}>
                    ...
                  </p>
                )}
                {deleteTargetResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedDeleteTarget(u)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem",
                      background: selectedDeleteTarget?.id === u.id ? "var(--app-surface-raised)" : "transparent",
                      border: "1px solid var(--app-border)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "var(--font-size-small)" }}>
                      {u.first_name} {u.last_name} — {u.email}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.deleteCancel}</AlertDialogCancel>
            <Button
              variant="primary"
              disabled={
                deleteLoading ||
                (deleteServiceHandling === "transfer_to_other" && !selectedDeleteTarget)
              }
              isLoading={deleteLoading}
              onClick={handleDeleteConfirm}
            >
              {t.deleteConfirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
