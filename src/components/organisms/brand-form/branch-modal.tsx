"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/atoms/alert-dialog";
import { Button } from "@/components/atoms/button";
import { Field, FieldLabel, Input } from "@/components/atoms/input";
import { Switch } from "@/components/atoms/switch";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import type { Branch } from "@/types/brand";
import styles from "./branch-modal.module.css";

type BranchDraft = Omit<Branch, "id" | "brand_id"> & { id?: string };

type BranchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: BranchDraft;
  onSave: (branch: BranchDraft) => void;
};

function createEmptyBranch(): BranchDraft {
  return {
    name: "",
    description: "",
    address1: "",
    address2: "",
    phone: "",
    email: "",
    is_24_7: false,
    opening: "",
    closing: "",
    breaks: [],
  };
}

export function BranchModal({
  open,
  onOpenChange,
  initial,
  onSave,
}: BranchModalProps) {
  const { messages } = useLocale();
  const t = messages.brands;

  const [draft, setDraft] = useState<BranchDraft>(
    initial ?? createEmptyBranch(),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof BranchDraft | string, string>>>({});

  // Reset draft whenever the modal opens or switches to a different branch
  useEffect(() => {
    if (open) {
      setDraft(initial ?? createEmptyBranch());
      setErrors({});
    }
  }, [open, initial]);

  function updateField<K extends keyof BranchDraft>(
    key: K,
    value: BranchDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addBreak() {
    setDraft((prev) => ({
      ...prev,
      breaks: [...prev.breaks, { id: crypto.randomUUID(), start: "", end: "" }],
    }));
  }

  function removeBreak(index: number) {
    setDraft((prev) => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index),
    }));
  }

  function updateBreak(
    index: number,
    field: "start" | "end",
    value: string,
  ) {
    setDraft((prev) => {
      const next = [...prev.breaks];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, breaks: next };
    });
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<string, string>> = {};

    if (!draft.name.trim()) {
      nextErrors.name = t.requiredMessage;
    }

    if (!draft.address1.trim()) {
      nextErrors.address1 = t.requiredMessage;
    }

    if (!draft.is_24_7) {
      if (!draft.opening?.trim()) {
        nextErrors.opening = t.openingRequiredMessage;
      }
      if (!draft.closing?.trim()) {
        nextErrors.closing = t.closingRequiredMessage;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(draft);
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setErrors({});
    }
    onOpenChange(next);
  }

  const isEditing = !!initial?.id;
  const modalTitle = isEditing ? t.branchEditModalTitle : t.branchModalTitle;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.branchModalDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className={styles.form}>
          {/* Name */}
          <Field>
            <FieldLabel required>{t.branchFieldName}</FieldLabel>
            <Input
              data-alert-dialog-autofocus
              value={draft.name}
              placeholder={t.branchFieldNamePlaceholder}
              aria-invalid={!!errors.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {errors.name && (
              <p style={{ margin: 0, fontSize: "var(--font-size-extra-small)", color: "var(--app-error, #ef4444)" }}>
                {errors.name}
              </p>
            )}
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel>{t.branchFieldDescription}</FieldLabel>
            <Input
              value={draft.description ?? ""}
              placeholder={t.branchFieldDescriptionPlaceholder}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </Field>

          {/* Address */}
          <Field>
            <FieldLabel required>{t.branchFieldAddress1}</FieldLabel>
            <Input
              value={draft.address1}
              placeholder={t.branchFieldAddress1Placeholder}
              aria-invalid={!!errors.address1}
              onChange={(e) => updateField("address1", e.target.value)}
            />
            {errors.address1 && (
              <p style={{ margin: 0, fontSize: "var(--font-size-extra-small)", color: "var(--app-error, #ef4444)" }}>
                {errors.address1}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>{t.branchFieldAddress2}</FieldLabel>
            <Input
              value={draft.address2 ?? ""}
              placeholder={t.branchFieldAddress2Placeholder}
              onChange={(e) => updateField("address2", e.target.value)}
            />
          </Field>

          {/* Contact */}
          <div className={styles.row}>
            <Field>
              <FieldLabel>{t.branchFieldPhone}</FieldLabel>
              <Input
                type="tel"
                value={draft.phone ?? ""}
                placeholder={t.branchFieldPhonePlaceholder}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>{t.branchFieldEmail}</FieldLabel>
              <Input
                type="email"
                value={draft.email ?? ""}
                placeholder={t.branchFieldEmailPlaceholder}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </Field>
          </div>

          {/* 24/7 toggle */}
          <div className={styles.switchRow}>
            <span className={styles.switchLabel}>{t.branchField247}</span>
            <Switch
              checked={draft.is_24_7}
              onChange={(e) => {
                updateField("is_24_7", e.target.checked);
                if (e.target.checked) {
                  setErrors((prev) => ({ ...prev, opening: undefined, closing: undefined }));
                }
              }}
            />
          </div>

          {/* Hours (only when not 24/7) */}
          {!draft.is_24_7 && (
            <div className={styles.row}>
              <Field>
                <FieldLabel required>{t.branchFieldOpening}</FieldLabel>
                <Input
                  type="text"
                  value={draft.opening ?? ""}
                  placeholder="09:00"
                  maxLength={5}
                  aria-invalid={!!errors.opening}
                  onChange={(e) => updateField("opening", e.target.value)}
                />
                {errors.opening && (
                  <p style={{ margin: 0, fontSize: "var(--font-size-extra-small)", color: "var(--app-error, #ef4444)" }}>
                    {errors.opening}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel required>{t.branchFieldClosing}</FieldLabel>
                <Input
                  type="text"
                  value={draft.closing ?? ""}
                  placeholder="18:00"
                  maxLength={5}
                  aria-invalid={!!errors.closing}
                  onChange={(e) => updateField("closing", e.target.value)}
                />
                {errors.closing && (
                  <p style={{ margin: 0, fontSize: "var(--font-size-extra-small)", color: "var(--app-error, #ef4444)" }}>
                    {errors.closing}
                  </p>
                )}
              </Field>
            </div>
          )}

          {/* Breaks */}
          {!draft.is_24_7 && (
            <div className={styles.breaksSection}>
              <div className={styles.breaksSectionHeader}>
                <p className={styles.breaksSectionTitle}>{t.branchFieldBreaks}</p>
                <Button
                  variant="outline"
                  size="small"
                  icon="add"
                  onClick={addBreak}
                >
                  {t.branchAddBreak}
                </Button>
              </div>

              {draft.breaks.map((br, index) => (
                <div key={br.id ?? index} className={styles.breakRow}>
                  <Field>
                    <FieldLabel>Start</FieldLabel>
                    <Input
                      type="text"
                      value={br.start}
                      placeholder="12:00"
                      maxLength={5}
                      onChange={(e) => updateBreak(index, "start", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>End</FieldLabel>
                    <Input
                      type="text"
                      value={br.end}
                      placeholder="13:00"
                      maxLength={5}
                      onChange={(e) => updateBreak(index, "end", e.target.value)}
                    />
                  </Field>
                  <button
                    type="button"
                    className={styles.removeBreakBtn}
                    aria-label={t.branchRemoveBreak}
                    onClick={() => removeBreak(index)}
                  >
                    <Icon icon="delete" size={16} color="current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t.branchCancel}</AlertDialogCancel>
          <Button variant="primary" onClick={handleSave}>
            {t.branchSave}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
