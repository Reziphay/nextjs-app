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
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import { createBrand, updateBrand } from "@/lib/brands-api";
import type { Brand, BrandCategory, Branch } from "@/types/brand";
import { BranchModal } from "./branch-modal";
import styles from "./brand-form.module.css";

type BranchDraft = Omit<Branch, "id" | "brand_id">;

type BrandFormDraft = {
  name: string;
  description: string;
  category_ids: string[];
  logoFile: File | null;
  logoPreviewUrl: string | null;
  galleryFiles: File[];
  galleryPreviewUrls: string[];
  branches: BranchDraft[];
};

type BrandFormProps = {
  mode: "create" | "edit";
  brand?: Brand;
  categories: BrandCategory[];
};

function createEmptyDraft(): BrandFormDraft {
  return {
    name: "",
    description: "",
    category_ids: [],
    logoFile: null,
    logoPreviewUrl: null,
    galleryFiles: [],
    galleryPreviewUrls: [],
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
    galleryFiles: [],
    galleryPreviewUrls: (brand.gallery ?? [])
      .sort((a, b) => a.order - b.order)
      .map((g) => g.url),
    branches: (brand.branches ?? []).map((b) => ({
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

export function BrandForm({ mode, brand, categories }: BrandFormProps) {
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

  const categoryOptions: ComboboxOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

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
        updateField("logoFile", croppedFile);
        updateField("logoPreviewUrl", url);
        setCropTarget(null);
      },
    });
  }

  function handleRemoveLogo() {
    if (draft.logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(draft.logoPreviewUrl);
    }
    updateField("logoFile", null);
    updateField("logoPreviewUrl", null);
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
          galleryFiles: [...prev.galleryFiles, croppedFile],
          galleryPreviewUrls: [...prev.galleryPreviewUrls, url],
        }));
        setCropTarget(null);
      },
    });
  }

  function handleRemoveGalleryItem(index: number) {
    const url = draft.galleryPreviewUrls[index];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    setDraft((prev) => ({
      ...prev,
      galleryFiles: prev.galleryFiles.filter((_, i) => i !== index),
      galleryPreviewUrls: prev.galleryPreviewUrls.filter((_, i) => i !== index),
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
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        category_ids: draft.category_ids.length > 0 ? draft.category_ids : undefined,
        branches: draft.branches.length > 0 ? draft.branches.map((b) => ({
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
        })) : undefined,
      };

      if (mode === "create") {
        await createBrand(payload, accessToken);
        setFeedback({
          type: "success",
          message: t.createSuccessDescription,
        });
        setDraft(createEmptyDraft());
      } else if (mode === "edit" && brand) {
        await updateBrand(brand.id, payload, accessToken);
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

  const editingBranch =
    editingBranchIndex !== null ? draft.branches[editingBranchIndex] : undefined;

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <Button variant="ghost" icon="arrow_back" onClick={handleCancel} />
        <h1 className={styles.title}>
          {mode === "create" ? t.formCreateTitle : t.formEditTitle}
        </h1>
      </div>

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

          {draft.galleryPreviewUrls.length > 0 && (
            <div className={styles.galleryPreviewRow}>
              {draft.galleryPreviewUrls.map((url, index) => (
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
                    onClick={() => handleRemoveGalleryItem(index)}
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
                <div key={index} className={styles.branchItem}>
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
          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
            icon={isLoading ? undefined : "check"}
            disabled={
              isLoading ||
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

      {/* Branch modal */}
      <BranchModal
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
    </div>
  );
}
