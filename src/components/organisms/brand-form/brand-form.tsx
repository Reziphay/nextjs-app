"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/atoms/button";
import { Field, FieldLabel, Input } from "@/components/atoms/input";
import {
  Combobox,
  type ComboboxOption,
} from "@/components/atoms/combobox";
import { AvatarCropDialog } from "@/components/molecules/avatar-crop-dialog/avatar-crop-dialog";
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
import { SocialIcon, SOCIAL_COLORS } from "@/components/atoms/social-icon/social-icon";
import { Switch } from "@/components/atoms/switch";
import { useLocale } from "@/components/providers/locale-provider";
import { proxyMediaUrl } from "@/lib/media";
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
  fetchBrandById,
  type UserSearchResult,
} from "@/lib/brands-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import type { Brand, BrandCategory, BrandGalleryItem, Branch } from "@/types/brand";
import { BranchPage } from "./branch-page";
import { RichTextEditor } from "@/components/molecules/rich-text-editor/rich-text-editor";
import styles from "./brand-form.module.css";

// Branch draft preserves the server id for persisted branches
type BranchDraft = {
  id?: string; // undefined = new (not yet persisted)
  name: string;
  description?: string;
  cover_media_id?: string | null;
  cover_url?: string | null;
  address1: string;
  address2?: string;
  phone?: string;
  email?: string;
  is_24_7: boolean;
  opening?: string;
  closing?: string;
  breaks: { id?: string; start: string; end: string }[];
  photoFile?: File | null;
  photoPreviewUrl?: string | null;
  photoRemoved?: boolean;
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
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  whatsapp_url: string;
  linkedin_url: string;
  x_url: string;
  website_url: string;
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
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
    whatsapp_url: "",
    linkedin_url: "",
    x_url: "",
    website_url: "",
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
    instagram_url: brand.instagram_url ?? "",
    facebook_url: brand.facebook_url ?? "",
    youtube_url: brand.youtube_url ?? "",
    whatsapp_url: brand.whatsapp_url ?? "",
    linkedin_url: brand.linkedin_url ?? "",
    x_url: brand.x_url ?? "",
    website_url: brand.website_url ?? "",
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
      cover_media_id: b.cover_media_id ?? null,
      cover_url: b.cover_url ?? null,
      photoFile: null,
      photoPreviewUrl: proxyMediaUrl(b.cover_url) ?? null,
      photoRemoved: false,
    })),
  };
}

function revokeDraftObjectUrls(draft: BrandFormDraft) {
  if (draft.logoPreviewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(draft.logoPreviewUrl);
  }

  for (const url of draft.newGalleryPreviewUrls) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  for (const branch of draft.branches) {
    if (branch.photoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(branch.photoPreviewUrl);
    }
  }
}

function buildTransferTargetLabel(user: UserSearchResult) {
  return `${user.first_name} ${user.last_name}`.trim();
}

function getBranchUploadKey(branch: BranchDraft, index: number) {
  return branch.id ?? `new-${index}`;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image file"));
    };

    image.src = objectUrl;
  });
}

function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  type: string,
  quality = 0.92,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export canvas"));
          return;
        }

        resolve(new File([blob], fileName, { type }));
      },
      type,
      quality,
    );
  });
}

async function prepareBranchCoverUpload(file: File): Promise<File> {
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const width = 1280;
  const height = 720;
  const inset = 72;
  const squareSize = height - inset * 2;
  const squareX = (width - squareSize) / 2;
  const squareY = inset;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const ctx = canvas.getContext("2d");
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;

  canvas.width = width;
  canvas.height = height;

  if (!ctx) {
    return file;
  }

  const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
  backgroundGradient.addColorStop(0, "#0f172a");
  backgroundGradient.addColorStop(1, "#1e293b");
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, width, width);
  ctx.restore();

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(squareX - 14, squareY - 14, squareSize + 28, squareSize + 28);

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    squareX,
    squareY,
    squareSize,
    squareSize,
  );

  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.lineWidth = 2;
  ctx.strokeRect(squareX, squareY, squareSize, squareSize);

  return canvasToFile(canvas, `${baseName}-branch-cover.jpg`, "image/jpeg");
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
  const searchParams = useSearchParams();
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const branchQueryId = searchParams.get("branch");
  const addBranchQuery = searchParams.get("addBranch");
  const [addBranchQueryHandled, setAddBranchQueryHandled] = useState(false);
  const [persistedBrand, setPersistedBrand] = useState<Brand | null>(
    mode === "edit" ? brand ?? null : null,
  );

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
  const [branchQueryHandled, setBranchQueryHandled] = useState(false);

  // Transfer modal state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  // Combobox-based async search
  const [transferComboValue, setTransferComboValue] = useState("");
  const [transferItems, setTransferItems] = useState<ComboboxOption[]>([]);
  const [transferItemsMap, setTransferItemsMap] = useState<Map<string, UserSearchResult>>(new Map());
  const transferSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Selection + two-step confirmation
  const [selectedTransferTarget, setSelectedTransferTarget] = useState<UserSearchResult | null>(null);
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Switch: true = also delete services (default ON); false = keep / transfer services
  // When false the two transfer-service options are shown as disabled (service domain not built).
  const [deleteAlsoServices, setDeleteAlsoServices] = useState(true);

  const categoryOptions: ComboboxOption[] = categories.map((c) => ({
    value: c.id,
    label: messages.categories[c.key as keyof typeof messages.categories] ?? c.key,
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

  function resetDraft(nextDraft: BrandFormDraft) {
    setDraft((prev) => {
      revokeDraftObjectUrls(prev);
      return nextDraft;
    });
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
    const branch = draft.branches[index];
    if (branch?.photoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(branch.photoPreviewUrl);
    }

    setDraft((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  }

  function handleBranchSave(branchDraft: BranchDraft) {
    if (editingBranchIndex !== null) {
      setDraft((prev) => {
        const next = [...prev.branches];
        const previousBranch = next[editingBranchIndex];

        if (
          previousBranch?.photoPreviewUrl?.startsWith("blob:") &&
          previousBranch.photoPreviewUrl !== branchDraft.photoPreviewUrl
        ) {
          URL.revokeObjectURL(previousBranch.photoPreviewUrl);
        }

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

  useEffect(() => {
    if (
      mode !== "edit" ||
      !branchQueryId ||
      branchQueryHandled ||
      draft.branches.length === 0
    ) {
      return;
    }

    const branchIndex = draft.branches.findIndex((branchItem) => branchItem.id === branchQueryId);
    setBranchQueryHandled(true);

    if (branchIndex >= 0) {
      setEditingBranchIndex(branchIndex);
      setBranchModalOpen(true);
    }
  }, [branchQueryHandled, branchQueryId, draft.branches, mode]);

  useEffect(() => {
    if (mode !== "edit" || addBranchQuery !== "1" || addBranchQueryHandled) return;
    setAddBranchQueryHandled(true);
    setEditingBranchIndex(null);
    setBranchModalOpen(true);
  }, [addBranchQuery, addBranchQueryHandled, mode]);

  useEffect(() => {
    if (!branchModalOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [branchModalOpen]);

  function validate(): boolean {
    const nextErrors: Partial<Record<string, string>> = {};
    if (!draft.name.trim()) {
      nextErrors.name = t.nameRequiredMessage;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function resolveFeedbackMessage(error: unknown): string {
    const apiMessage = isAxiosError(error)
      ? (error.response?.data?.message as string | undefined)
      : undefined;

    switch (apiMessage) {
      case "media.invalid_logo_ratio":
        return t.logoRatioError;
      case "media.invalid_gallery_ratio":
        return t.galleryRatioError;
      case "media.invalid_cover_ratio":
        return t.errorGeneric;
      default:
        return (
          translateBackendErrorMessage(apiMessage, messages.backendErrors) ??
          t.errorGeneric
        );
    }
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
    const currentBrand = mode === "edit" ? (persistedBrand ?? brand ?? null) : null;
    let didMutateServerState = false;

    try {
      // Upload new logo if selected
      let logoMediaId: string | undefined;
      if (draft.logoFile) {
        const uploaded = await uploadBrandMedia(draft.logoFile, accessToken, "logo");
        logoMediaId = uploaded.media_id;
      }

      // Upload new gallery files
      const newGalleryMediaIds: string[] = [];
      for (const file of draft.newGalleryFiles) {
        const uploaded = await uploadBrandMedia(file, accessToken, "gallery");
        newGalleryMediaIds.push(uploaded.media_id);
      }

      const branchCoverMediaIds = new Map<string, string>();
      for (const [index, branch] of draft.branches.entries()) {
        if (!branch.photoFile) {
          continue;
        }

        const normalizedCoverFile = await prepareBranchCoverUpload(branch.photoFile);
        const uploaded = await uploadBrandMedia(
          normalizedCoverFile,
          accessToken,
          "branch_cover",
        );
        branchCoverMediaIds.set(getBranchUploadKey(branch, index), uploaded.media_id);
      }

      if (mode === "create") {
        const allGalleryIds = newGalleryMediaIds;

        const newBrand = await createBrand({
          name: draft.name.trim(),
          description: draft.description.trim() || undefined,
          categoryIds: draft.category_ids,
          logo_media_id: logoMediaId,
          gallery_media_ids: allGalleryIds.length > 0 ? allGalleryIds : undefined,
          instagram_url: draft.instagram_url.trim() || null,
          facebook_url: draft.facebook_url.trim() || null,
          youtube_url: draft.youtube_url.trim() || null,
          whatsapp_url: draft.whatsapp_url.trim() || null,
          linkedin_url: draft.linkedin_url.trim() || null,
          x_url: draft.x_url.trim() || null,
          website_url: draft.website_url.trim() || null,
          branches: draft.branches.map((branch, index) => ({
            name: branch.name,
            description: branch.description || undefined,
            cover_media_id: branchCoverMediaIds.get(
              getBranchUploadKey(branch, index),
            ),
            address1: branch.address1,
            address2: branch.address2 || undefined,
            phone: branch.phone || undefined,
            email: branch.email || undefined,
            is_24_7: branch.is_24_7,
            opening: branch.is_24_7 ? undefined : (branch.opening || undefined),
            closing: branch.is_24_7 ? undefined : (branch.closing || undefined),
            breaks: branch.breaks.map((item) => ({ start: item.start, end: item.end })),
          })),
        }, accessToken);

        router.push(`/brands?id=${newBrand.id}&created=1`);
        return;
      } else if (mode === "edit" && currentBrand) {
        const trimmedDescription = draft.description.trim();

        // Build full gallery: keep remaining existing items + new uploads
        const existingMediaIds = draft.existingGalleryItems.map((g) => g.media_id);
        const allGalleryIds = [...existingMediaIds, ...newGalleryMediaIds];

        // Only include gallery_media_ids in payload if anything changed
        const galleryChanged =
          existingMediaIds.length !== (currentBrand.gallery ?? []).length ||
          existingMediaIds.some(
            (mediaId, index) => mediaId !== currentBrand.gallery?.[index]?.media_id,
          ) ||
          newGalleryMediaIds.length > 0;

        const payload = {
          name: draft.name.trim(),
          description: trimmedDescription.length > 0 ? trimmedDescription : null,
          categoryIds: draft.category_ids,
          // Logo: new file takes precedence; removal sends null; no change omits field
          ...(logoMediaId !== undefined
            ? { logo_media_id: logoMediaId }
            : draft.logoRemoved
              ? { logo_media_id: null as null }
              : {}),
          ...(galleryChanged ? { gallery_media_ids: allGalleryIds } : {}),
          instagram_url: draft.instagram_url.trim() || null,
          facebook_url: draft.facebook_url.trim() || null,
          youtube_url: draft.youtube_url.trim() || null,
          whatsapp_url: draft.whatsapp_url.trim() || null,
          linkedin_url: draft.linkedin_url.trim() || null,
          x_url: draft.x_url.trim() || null,
          website_url: draft.website_url.trim() || null,
        };
        const updatedBrand = await updateBrand(currentBrand.id, payload, accessToken);
        didMutateServerState = true;

        // Branch CRUD: diff against the latest persisted server snapshot
        const originalIds = new Set((currentBrand.branches ?? []).map((b) => b.id));
        const currentIds = new Set(draft.branches.filter((b) => b.id).map((b) => b.id!));
        const nextPersistedBranches: Branch[] = [];

        // Delete removed branches
        for (const origId of originalIds) {
          if (!currentIds.has(origId)) {
            await deleteBranchApi(currentBrand.id, origId, accessToken);
            didMutateServerState = true;
          }
        }

        // Update existing / create new
        for (const [index, b] of draft.branches.entries()) {
          if (b.id && originalIds.has(b.id)) {
            const uploadedCoverMediaId = branchCoverMediaIds.get(b.id);
            const updatedBranchDraft = await updateBranch(currentBrand.id, b.id, {
              name: b.name,
              description: b.description ?? null,
              ...(uploadedCoverMediaId !== undefined
                ? { cover_media_id: uploadedCoverMediaId }
                : b.photoRemoved
                  ? { cover_media_id: null as null }
                  : {}),
              address1: b.address1,
              address2: b.address2 ?? null,
              phone: b.phone ?? null,
              email: b.email ?? null,
              is_24_7: b.is_24_7,
              opening: b.is_24_7 ? null : (b.opening ?? null),
              closing: b.is_24_7 ? null : (b.closing ?? null),
              breaks: b.breaks.map((br) => ({ start: br.start, end: br.end })),
            }, accessToken);
            nextPersistedBranches.push(updatedBranchDraft);
            didMutateServerState = true;
          } else if (!b.id) {
            const uploadedCoverMediaId = branchCoverMediaIds.get(
              getBranchUploadKey(b, index),
            );
            const createdBranch = await createBranch(currentBrand.id, {
              name: b.name,
              description: b.description || undefined,
              ...(uploadedCoverMediaId !== undefined
                ? { cover_media_id: uploadedCoverMediaId }
                : {}),
              address1: b.address1,
              address2: b.address2 || undefined,
              phone: b.phone || undefined,
              email: b.email || undefined,
              is_24_7: b.is_24_7,
              opening: b.opening || undefined,
              closing: b.closing || undefined,
              breaks: b.breaks.map((br) => ({ start: br.start, end: br.end })),
            }, accessToken);
            nextPersistedBranches.push(createdBranch);
            didMutateServerState = true;
          }
        }

        const nextPersistedBrand: Brand = {
          ...updatedBrand,
          branches: nextPersistedBranches,
        };

        setPersistedBrand(nextPersistedBrand);
        resetDraft(brandToDraft(nextPersistedBrand));
        router.push(`/brands?id=${nextPersistedBrand.id}&updated=1`);
        return;
      }
    } catch (error) {
      if (mode === "edit" && currentBrand && didMutateServerState) {
        try {
          const refreshedBrand = await fetchBrandById(currentBrand.id, accessToken);
          if (refreshedBrand) {
            setPersistedBrand(refreshedBrand);
            resetDraft(brandToDraft(refreshedBrand));
          }
        } catch {
          // Preserve the current draft when the resync request also fails.
        }
      }

      setFeedback({ type: "error", message: resolveFeedbackMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  // ── Transfer handlers ───────────────────────────────────────────────────────

  function resetTransferModalState() {
    if (transferSearchTimerRef.current) clearTimeout(transferSearchTimerRef.current);
    setTransferComboValue("");
    setTransferItems([]);
    setTransferItemsMap(new Map());
    setSelectedTransferTarget(null);
    setTransferConfirmed(false);
  }

  /** Fires when the user types in the Combobox input (via onInput). Debounced 350ms. */
  function handleTransferInput(e: React.FormEvent<HTMLInputElement>) {
    const q = (e.target as HTMLInputElement).value.trim();
    setSelectedTransferTarget(null);
    setTransferConfirmed(false);

    if (transferSearchTimerRef.current) clearTimeout(transferSearchTimerRef.current);

    if (q.length < 2) {
      setTransferItems([]);
      setTransferItemsMap(new Map());
      return;
    }

    transferSearchTimerRef.current = setTimeout(async () => {
      const accessToken = session.accessToken;
      if (!accessToken) return;
      try {
        const results = await searchUsoUsers(q, accessToken);
        const nextMap = new Map(results.map((u) => [u.id, u]));
        setTransferItemsMap(nextMap);
        setTransferItems(
          results.map((u) => ({
            value: u.id,
            label: buildTransferTargetLabel(u),
            description: u.email,
            keywords: [u.email ?? "", u.first_name, u.last_name],
          })),
        );
      } catch {
        /* swallow — user will just see no results */
      }
    }, 350);
  }

  /** Fires when the Combobox selection changes. */
  function handleTransferValueChange(val: string | string[]) {
    const id = Array.isArray(val) ? val[0] : val;
    setTransferComboValue(id ?? "");
    const user = transferItemsMap.get(id ?? "");
    setSelectedTransferTarget(user ?? null);
    setTransferConfirmed(false);
  }

  async function handleTransferConfirm() {
    const currentBrand = persistedBrand ?? brand;
    if (!selectedTransferTarget || !transferConfirmed || !currentBrand) return;
    const accessToken = session.accessToken;
    if (!accessToken) return;
    setTransferLoading(true);
    try {
      await initiateTransfer(currentBrand.id, selectedTransferTarget.id, accessToken);
      setTransferModalOpen(false);
      setFeedback({ type: "success", message: t.transferSuccessDescription });
      resetTransferModalState();
    } catch (error) {
      setFeedback({ type: "error", message: resolveFeedbackMessage(error) });
    } finally {
      setTransferLoading(false);
    }
  }

  // ── Delete handlers ─────────────────────────────────────────────────────────

  function resetDeleteModalState() {
    setDeleteAlsoServices(true);
  }

  async function handleDeleteConfirm() {
    const currentBrand = persistedBrand ?? brand;
    if (!currentBrand) return;
    // Only delete_with_services is currently supported.
    if (!deleteAlsoServices) return;
    const accessToken = session.accessToken;
    if (!accessToken) return;
    setDeleteLoading(true);
    try {
      await deleteBrand(currentBrand.id, { service_handling: "delete_with_services" }, accessToken);
      setDeleteModalOpen(false);
      router.replace("/brands");
    } catch (error) {
      setFeedback({ type: "error", message: resolveFeedbackMessage(error) });
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

  function renderFormActions(className?: string) {
    return (
      <div className={`${styles.formFooter}${className ? ` ${className}` : ""}`}>
        <Button
          variant="primary"
          type="submit"
          isLoading={isLoading}
          icon={isLoading ? undefined : "check"}
          className={styles.formFooterPrimary}
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

        <Button variant="outline" type="button" onClick={handleCancel}>
          {t.cancelForm}
        </Button>

        <div className={styles.formFooterSpacer} />

        {mode === "edit" && (persistedBrand ?? brand) && (
          <div className={styles.formFooterDanger}>
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
          </div>
        )}
      </div>
    );
  }

  if (branchModalOpen) {
    return (
      <BranchPage
        key={editingBranchIndex === null ? "new" : `edit-${editingBranchIndex}`}
        open={branchModalOpen}
        onOpenChange={(open) => {
          setBranchModalOpen(open);
          if (!open) {
            setEditingBranchIndex(null);
          }
        }}
        initial={editingBranch}
        brandId={mode === "edit" ? (persistedBrand?.id ?? brand?.id ?? null) : null}
        onSave={handleBranchSave}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Sticky header ── */}
      <div className={styles.pageHeader}>
        <Button variant="ghost" icon="arrow_back" onClick={handleCancel} />
        <div className={styles.headerMeta}>
          <h1 className={styles.title}>
            {mode === "create" ? t.formCreateTitle : t.formEditTitle}
          </h1>
          <span className={styles.modeBadge}>
            {mode === "create" ? t.formCreateTitle : t.formEditTitle}
          </span>
        </div>
      </div>

      {/* ── Verification warning ── */}
      {verificationMissing && (
        <div className={`${styles.feedback} ${styles.feedbackError}`}>
          <strong>{t.verificationRequiredTitle}</strong>
          {" — "}
          {t.verificationRequiredDescription}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* ── Feedback ── */}
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

        <div className={styles.desktopShell}>
          <div className={styles.sidebarStack}>
            {/* Logo — sidebar */}
            <div className={`${styles.formSection} ${styles.logoSection}`}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepBadge}>1</span>
              <div className={styles.sectionHeaderText}>
                <h2 className={styles.sectionTitle}>{t.fieldLogo}</h2>
                <p className={styles.sectionHint}>{t.fieldLogoHint}</p>
              </div>
            </div>

            {draft.logoPreviewUrl ? (
              <div className={styles.logoPreviewWrap}>
                <div className={styles.logoPreview}>
                  <Image
                    src={proxyMediaUrl(draft.logoPreviewUrl) ?? draft.logoPreviewUrl}
                    alt={t.fieldLogo}
                    fill
                    className={styles.previewImage}
                    sizes="(min-width: 980px) 18rem, 120px"
                  />
                  <button
                    type="button"
                    className={styles.removePreviewBtn}
                    aria-label={`${t.deleteConfirm} ${t.fieldLogo}`}
                    onClick={handleRemoveLogo}
                  >
                    <Icon icon="close" size={12} color="current" />
                  </button>
                </div>
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

            <div className={styles.desktopAside}>
              {renderFormActions(styles.formFooterAside)}
            </div>
          </div>

          <div className={styles.mainStack}>
            {/* Basic info — main */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>2</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{t.basicInfoSection}</h2>
                </div>
              </div>

              <div className={styles.fieldRow}>
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
              </div>

              <div className={styles.fieldRow}>
                <Field>
                  <FieldLabel>{t.fieldDescription}</FieldLabel>
                  <RichTextEditor
                    value={draft.description ?? ""}
                    onChange={(html) => updateField("description", html)}
                    placeholder={t.fieldDescriptionPlaceholder}
                  />
                </Field>
              </div>

              <div className={styles.fieldRow}>
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
            </div>

            {/* ── Row 2: Gallery ── */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>3</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{t.fieldGallery}</h2>
                  <p className={styles.sectionHint}>{t.fieldGalleryHint}</p>
                </div>
              </div>

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
                <div className={styles.galleryPreviewGrid}>
                  {allGalleryPreviews.map(({ url, isExisting, index }) => (
                    <div key={url} className={styles.galleryPreviewItem}>
                      <Image
                        src={proxyMediaUrl(url) ?? url}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className={styles.previewImage}
                        sizes="200px"
                      />
                      <button
                        type="button"
                        className={styles.removePreviewBtn}
                        aria-label={`${t.deleteConfirm} ${t.gallery} ${index + 1}`}
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

            {/* ── Row 3: Social Media ── */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>4</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{t.socialSection}</h2>
                </div>
              </div>

              <div className={styles.socialGrid}>
                {(
                  [
                    { key: "website_url",   platform: "website",   label: t.socialWebsite   },
                    { key: "instagram_url", platform: "instagram",  label: t.socialInstagram },
                    { key: "facebook_url",  platform: "facebook",   label: t.socialFacebook  },
                    { key: "youtube_url",   platform: "youtube",    label: t.socialYoutube   },
                    { key: "whatsapp_url",  platform: "whatsapp",   label: t.socialWhatsapp  },
                    { key: "linkedin_url",  platform: "linkedin",   label: t.socialLinkedin  },
                    { key: "x_url",         platform: "x",          label: t.socialX         },
                  ] as const
                ).map(({ key, platform, label }) => (
                  <div key={key} className={styles.socialField}>
                    <label className={styles.socialLabel}>
                      <span
                        className={styles.socialIconWrap}
                        style={{ color: SOCIAL_COLORS[platform] }}
                      >
                        <SocialIcon platform={platform} size={18} />
                      </span>
                      {label}
                    </label>
                    <Input
                      type="url"
                      value={draft[key]}
                      placeholder={t.socialUrlPlaceholder}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Row 4: Branches ── */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>5</span>
                <div className={styles.sectionHeaderText}>
                  <h2 className={styles.sectionTitle}>{t.branchesTitle}</h2>
                </div>
              </div>

              <div className={styles.branchesList}>
                {draft.branches.length === 0 ? (
                  <div className={styles.branchesEmpty}>
                    <Icon icon="location_off" size={16} color="current" />
                    <span>{t.noBranches}</span>
                  </div>
                ) : (
                  draft.branches.map((branch, index) => (
                    <div key={branch.id ?? `new-${index}`} className={styles.branchItem}>
                      <div className={styles.branchItemLeft}>
                        <span className={styles.branchIndex}>{index + 1}</span>
                        <div className={styles.branchItemInfo}>
                          <p className={styles.branchItemName}>{branch.name}</p>
                          <p className={styles.branchItemAddress}>
                            {branch.address1}
                            {branch.address2 ? `, ${branch.address2}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className={styles.branchItemActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          aria-label={`${t.branchEditModalTitle}: ${branch.name}`}
                          onClick={() => handleEditBranch(index)}
                        >
                          <Icon icon="edit" size={14} color="current" />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                          aria-label={`${t.deleteBranch}: ${branch.name}`}
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
          </div>
        </div>
        <div className={styles.mobileFooter}>
          {renderFormActions()}
        </div>
      </form>

      {/* Image crop modal */}
      {cropTarget && (
        <AvatarCropDialog
          file={cropTarget.file}
          aspectRatio={cropTarget.aspectRatio}
          open={true}
          onConfirm={cropTarget.onDone}
          onClose={() => setCropTarget(null)}
        />
      )}

      {/* Transfer modal */}
      <AlertDialog
        open={transferModalOpen}
        onOpenChange={(open) => {
          setTransferModalOpen(open);
          if (!open) resetTransferModalState();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedTransferTarget ? t.transferConfirmStepTitle : t.transferModalTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTransferTarget
                ? t.transferConfirmStepDescription
                : t.transferModalDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {/* Step 1: Combobox search with avatar items */}
            <Combobox
              items={transferItems}
              value={transferComboValue}
              placeholder={t.transferSearchPlaceholder}
              emptyMessage={
                transferComboValue.length > 0
                  ? t.transferNoResults
                  : t.transferSearchHint
              }
              onValueChange={handleTransferValueChange}
              onInput={handleTransferInput}
              renderItem={(item) => {
                const u = transferItemsMap.get(item.value);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        position: "relative",
                        width: "1.75rem",
                        height: "1.75rem",
                        borderRadius: "999px",
                        overflow: "hidden",
                        background: "var(--app-bg-surface)",
                        border: "1px solid var(--app-border)",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={proxyMediaUrl(u?.avatar_url) ?? "/reziphay-logo.png"}
                        alt={item.label}
                        fill
                        sizes="28px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span style={{ fontSize: "var(--font-size-small)", fontWeight: 600, color: "var(--app-text-strong)" }}>
                        {item.label}
                      </span>
                      {item.description && (
                        <span style={{ fontSize: "var(--font-size-extra-small)", color: "var(--app-text-muted)" }}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {/* Step 2: Confirmation — only shown after a user is selected */}
            {selectedTransferTarget && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Selected user summary card */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    background: "var(--app-bg-surface-muted)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--app-border)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "999px",
                      overflow: "hidden",
                      background: "var(--app-bg-surface)",
                      border: "1px solid var(--app-border)",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={proxyMediaUrl(selectedTransferTarget.avatar_url) ?? "/reziphay-logo.png"}
                      alt={buildTransferTargetLabel(selectedTransferTarget)}
                      fill
                      sizes="40px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem", flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "var(--font-size-small)",
                        fontWeight: 700,
                        color: "var(--app-text-strong)",
                      }}
                    >
                      {t.transferTargetLabel}: {buildTransferTargetLabel(selectedTransferTarget)}
                    </span>
                    <span style={{ fontSize: "var(--font-size-extra-small)", color: "var(--app-text-muted)" }}>
                      {selectedTransferTarget.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTransferTarget(null);
                      setTransferComboValue("");
                      setTransferConfirmed(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "var(--font-size-extra-small)",
                      color: "var(--app-text-muted)",
                      flexShrink: 0,
                      padding: "0.25rem",
                    }}
                  >
                    {t.transferChangeTarget}
                  </button>
                </div>

                {/* Brand being transferred */}
                {(persistedBrand ?? brand) && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--font-size-small)",
                      color: "var(--app-text-muted)",
                    }}
                  >
                    <strong style={{ color: "var(--app-text-strong)" }}>{t.transferBrandLabel}:</strong>{" "}
                    {(persistedBrand ?? brand)?.name}
                  </p>
                )}

                {/* Explicit confirmation checkbox */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={transferConfirmed}
                    onChange={(e) => setTransferConfirmed(e.target.checked)}
                    style={{ marginTop: "0.125rem", flexShrink: 0, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "var(--font-size-small)", color: "var(--app-text-strong)", lineHeight: 1.5 }}>
                    {t.transferConfirmCheckbox}
                  </span>
                </label>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetTransferModalState}>
              {t.transferCancel}
            </AlertDialogCancel>
            <Button
              variant="primary"
              disabled={!selectedTransferTarget || !transferConfirmed || transferLoading}
              isLoading={transferLoading}
              onClick={handleTransferConfirm}
            >
              {t.transferConfirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete modal */}
      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) resetDeleteModalState();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteModalTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteModalDescription}</AlertDialogDescription>
          </AlertDialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {/* ── Switch row: "Also delete all services" ─────────────────── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "var(--app-bg-surface-strong)",
                borderRadius: "var(--general-border-radius-card)",
                border: "1px solid var(--app-border-soft)",
              }}
            >
              <span style={{ fontSize: "var(--font-size-small)", fontWeight: 600, color: "var(--app-text-strong)" }}>
                {t.deleteWithServices}
              </span>
              <Switch
                checked={deleteAlsoServices}
                onChange={(e) => setDeleteAlsoServices(e.target.checked)}
              />
            </div>

            {/* ── Service-handling options (visible when switch is OFF) ───── */}
            {!deleteAlsoServices && (
              <>
                {/* Disabled radio group — Service domain not built yet */}
                <div
                  role="radiogroup"
                  aria-label={t.deleteServicesTransferToMe}
                  style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
                >
                  {/* Option 1: transfer to self (disabled) */}
                  <div
                    role="radio"
                    aria-checked="false"
                    aria-disabled="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.625rem 0.875rem",
                      background: "var(--app-bg-surface-strong)",
                      border: "1px solid var(--app-border-soft)",
                      borderRadius: "var(--general-border-radius-card)",
                      opacity: 0.45,
                      cursor: "not-allowed",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "1rem",
                        height: "1rem",
                        borderRadius: "999px",
                        border: "2px solid var(--app-border-soft)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "var(--font-size-small)", color: "var(--app-text-strong)" }}>
                      {t.deleteServicesTransferToMe}
                    </span>
                  </div>

                  {/* Option 2: transfer to another USO (disabled) */}
                  <div
                    role="radio"
                    aria-checked="false"
                    aria-disabled="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.625rem 0.875rem",
                      background: "var(--app-bg-surface-strong)",
                      border: "1px solid var(--app-border-soft)",
                      borderRadius: "var(--general-border-radius-card)",
                      opacity: 0.45,
                      cursor: "not-allowed",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "1rem",
                        height: "1rem",
                        borderRadius: "999px",
                        border: "2px solid var(--app-border-soft)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "var(--font-size-small)", color: "var(--app-text-strong)" }}>
                      {t.deleteServicesTransferToOther}
                    </span>
                  </div>
                </div>

                {/* ── Warning banner ──────────────────────────────────────── */}
                <div
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.625rem",
                    padding: "0.75rem 1rem",
                    background: "var(--app-warning-bg)",
                    border: "1px solid var(--app-warning-border)",
                    borderRadius: "var(--general-border-radius-card)",
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: "0.0625rem", color: "var(--app-warning-strong)" }}>
                    <Icon icon="warning" size={16} color="current" />
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--font-size-small)",
                      color: "var(--app-text-strong)",
                      lineHeight: 1.6,
                    }}
                  >
                    {t.deleteServiceTransferNote}
                  </p>
                </div>
              </>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetDeleteModalState}>
              {t.deleteCancel}
            </AlertDialogCancel>
            <Button
              variant="primary"
              disabled={deleteLoading || !deleteAlsoServices}
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
