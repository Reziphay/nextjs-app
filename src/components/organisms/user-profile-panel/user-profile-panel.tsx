"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Combobox,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  type ComboboxOption,
} from "@/components/atoms";
import {
  AvatarCropDialog,
  FeedbackPopup,
  UserAvatar,
} from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
import {
  findCountryByValue,
  getCountryLabel,
  getCountryOptions,
} from "@/lib/countries";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelEditingAccount,
  dismissAccountFeedback,
  hydrateAccountProfile,
  selectAccountState,
  setAccountDraftField,
  startEditingAccount,
  submitAccountUpdate,
  removeAccountAvatar,
  uploadAccountAvatar,
} from "@/store/account";
import type { AccountUserProfile, UserProfile } from "@/types";
import styles from "./user-profile-panel.module.css";

type UserProfilePanelProps = {
  user: AccountUserProfile;
  canEdit?: boolean;
};

type PendingCropImage = {
  src: string;
  name: string;
} | null;

function hasPrivateProfileFields(
  profile: AccountUserProfile,
): profile is UserProfile {
  return "email_verified" in profile;
}

function formatDate(value: string | Date, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale === "az" ? "az-Latn-AZ" : locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPhoneWithPrefix(phone: string | null, prefix?: string | null) {
  if (!phone) {
    return null;
  }

  const normalizedPrefix = prefix?.trim();

  if (!normalizedPrefix) {
    return phone;
  }

  return `${normalizedPrefix}${phone}`;
}

export function UserProfilePanel({
  user,
  canEdit = false,
}: UserProfilePanelProps) {
  const dispatch = useAppDispatch();
  const { messages, locale } = useLocale();
  const accountState = useAppSelector(selectAccountState);
  const p = messages.profile;
  const profile = canEdit ? (accountState.profile ?? user) : user;
  const editableProfile =
    canEdit && hasPrivateProfileFields(profile) ? profile : null;
  const draft = accountState.draft;
  const errors = canEdit ? accountState.errors : {};
  const feedback = canEdit ? accountState.feedback : null;
  const isEditing = canEdit ? accountState.isEditing : false;
  const isSaving = canEdit ? accountState.status === "loading" : false;
  const isAvatarUploading =
    canEdit && accountState.avatarUploadStatus === "loading";
  const hasAvatar = Boolean(profile.avatar_url);
  const countryOptions: readonly ComboboxOption[] = useMemo(
    () => getCountryOptions(locale),
    [locale],
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingCropImage, setPendingCropImage] =
    useState<PendingCropImage>(null);

  useEffect(() => {
    if (!canEdit || !hasPrivateProfileFields(user)) {
      return;
    }

    dispatch(
      hydrateAccountProfile({
        profile: user,
        canEdit,
      }),
    );
  }, [canEdit, dispatch, user]);

  useEffect(() => {
    if (!pendingCropImage?.src.startsWith("blob:")) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(pendingCropImage.src);
    };
  }, [pendingCropImage]);

  const typeLabel: Record<string, string> = {
    uso: p.typeUso,
    ucr: p.typeUcr,
    admin: p.typeAdmin,
  };
  const isEmailLocked = Boolean(editableProfile?.email_verified);
  const isPhoneLocked = Boolean(
    editableProfile?.phone_verified && editableProfile?.phone,
  );

  const initials = `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase();
  const avatarSrc = canEdit
    ? (accountState.avatarPreviewUrl ?? profile.avatar_url ?? null)
    : (profile.avatar_url ?? null);
  const derivedPhonePrefix =
    findCountryByValue(draft.country || editableProfile?.country || "")?.prefix ??
    editableProfile?.country_prefix ??
    "—";
  const formattedPhone =
    formatPhoneWithPrefix(
      editableProfile?.phone ?? null,
      editableProfile?.country_prefix ??
        findCountryByValue(editableProfile?.country ?? "")?.prefix,
    ) ?? p.phoneMissing;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await dispatch(submitAccountUpdate({ locale })).unwrap();
    } catch {
      return;
    }
  }

  function handleOpenAvatarPicker() {
    if (!canEdit || !isEditing || isAvatarUploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file || !canEdit || !isEditing) {
      return;
    }

    setPendingCropImage({
      src: URL.createObjectURL(file),
      name: file.name,
    });
  }

  function handleCloseCropDialog() {
    setPendingCropImage(null);
  }

  function handleChooseDifferentAvatar() {
    setPendingCropImage(null);

    window.setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  }

  async function handleConfirmCroppedAvatar(file: File) {
    await dispatch(
      uploadAccountAvatar({
        file,
        locale,
      }),
    );
  }

  async function handleRemoveAvatar() {
    await dispatch(removeAccountAvatar({ locale }));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroIdentity}>
          <UserAvatar
            initials={initials}
            src={avatarSrc}
            alt={`${profile.first_name} ${profile.last_name} — ${p.photoAlt}`}
            size="xl"
            editable={canEdit && isEditing}
            isUploading={isAvatarUploading}
            editLabel={
              isAvatarUploading
                ? p.uploadingPhoto
                : hasAvatar
                  ? p.changePhoto
                  : p.uploadPhoto
            }
            className={styles.heroAvatar}
            onEditClick={handleOpenAvatarPicker}
          />
          {canEdit && isEditing ? (
            <input
              ref={fileInputRef}
              className={styles.fileInput}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleAvatarChange}
            />
          ) : null}
          <div className={styles.heroText}>
            <h1 className={styles.fullName}>
              {profile.first_name} {profile.last_name}
            </h1>
            <p className={styles.heroEmail}>{profile.email}</p>
            {canEdit && isEditing && hasAvatar ? (
              <div className={styles.photoActions}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="small"
                      type="button"
                      icon="delete"
                      disabled={isAvatarUploading}
                    >
                      {p.removePhoto}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    size="sm"
                    className={styles.removePhotoDialog}
                  >
                    <AlertDialogMedia
                      tone="destructive"
                      className={styles.removePhotoDialogMedia}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 6H5H21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 6L18.133 18.142C18.0588 19.1813 17.1939 20 16.152 20H7.84795C6.80608 20 5.94116 19.1813 5.86698 18.142L5 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 11V17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 11V17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </AlertDialogMedia>
                    <AlertDialogHeader className={styles.removePhotoDialogHeader}>
                      <AlertDialogTitle className={styles.removePhotoDialogTitle}>
                        {p.removePhotoConfirmTitle}
                      </AlertDialogTitle>
                      <AlertDialogDescription
                        className={styles.removePhotoDialogDescription}
                      >
                        {p.removePhotoConfirmDescription}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className={styles.removePhotoDialogFooter}>
                      <AlertDialogCancel>{p.cropPhotoCancel}</AlertDialogCancel>
                      <AlertDialogAction
                        destructive
                        onClick={() => {
                          void handleRemoveAvatar();
                        }}
                      >
                        {p.removePhotoConfirmAction}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : null}
          </div>
        </div>

        {canEdit ? (
          <div className={styles.heroActions}>
            {isEditing ? (
              <Button
                variant="outline"
                type="button"
                onClick={() => dispatch(cancelEditingAccount())}
              >
                {p.cancelEditing}
              </Button>
            ) : (
              <Button
                variant="outline"
                type="button"
                icon="edit_square"
                onClick={() => dispatch(startEditingAccount())}
              >
                {p.editProfile}
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {feedback ? (
        <FeedbackPopup
          title={feedback.title}
          description={feedback.description}
          variant={feedback.variant}
          icon={feedback.icon}
          closeLabel={p.dismissFeedback}
          onClose={() => dispatch(dismissAccountFeedback())}
        />
      ) : null}

      <AvatarCropDialog
        imageName={pendingCropImage?.name ?? "avatar"}
        imageSrc={pendingCropImage?.src ?? null}
        open={Boolean(pendingCropImage)}
        onClose={handleCloseCropDialog}
        onConfirm={handleConfirmCroppedAvatar}
        onChooseDifferentPicture={handleChooseDifferentAvatar}
      />

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h2 className={styles.cardTitle}>{p.personalInfo}</h2>
              {canEdit && isEditing ? (
                <p className={styles.cardLead}>{p.editDescription}</p>
              ) : null}
            </div>
          </div>

          {canEdit && isEditing ? (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
                <Field
                  className={styles.formField}
                  data-invalid={errors.first_name ? "" : undefined}
                >
                  <FieldLabel htmlFor="account_first_name" required>
                    {p.firstName}
                  </FieldLabel>
                  <Input
                    id="account_first_name"
                    value={draft.first_name}
                    aria-invalid={errors.first_name ? "true" : undefined}
                    onChange={(event) => {
                      dispatch(
                        setAccountDraftField({
                          field: "first_name",
                          value: event.target.value,
                        }),
                      );
                    }}
                  />
                  {errors.first_name ? (
                    <FieldDescription>{errors.first_name}</FieldDescription>
                  ) : null}
                </Field>

                <Field
                  className={styles.formField}
                  data-invalid={errors.last_name ? "" : undefined}
                >
                  <FieldLabel htmlFor="account_last_name" required>
                    {p.lastName}
                  </FieldLabel>
                  <Input
                    id="account_last_name"
                    value={draft.last_name}
                    aria-invalid={errors.last_name ? "true" : undefined}
                    onChange={(event) => {
                      dispatch(
                        setAccountDraftField({
                          field: "last_name",
                          value: event.target.value,
                        }),
                      );
                    }}
                  />
                  {errors.last_name ? (
                    <FieldDescription>{errors.last_name}</FieldDescription>
                  ) : null}
                </Field>

                <Field
                  className={styles.formField}
                  data-invalid={errors.birthday ? "" : undefined}
                >
                  <FieldLabel htmlFor="account_birthday" required>
                    {p.birthday}
                  </FieldLabel>
                  <Input
                    id="account_birthday"
                    type="date"
                    value={draft.birthday}
                    aria-invalid={errors.birthday ? "true" : undefined}
                    onChange={(event) => {
                      dispatch(
                        setAccountDraftField({
                          field: "birthday",
                          value: event.target.value,
                        }),
                      );
                    }}
                  />
                  {errors.birthday ? (
                    <FieldDescription>{errors.birthday}</FieldDescription>
                  ) : null}
                </Field>

                <Field
                  className={styles.formField}
                  data-invalid={errors.country ? "" : undefined}
                >
                  <FieldLabel htmlFor="account_country" required>
                    {p.country}
                  </FieldLabel>
                  <Combobox
                    className={styles.formCombobox}
                    id="account_country"
                    items={countryOptions}
                    value={draft.country}
                    aria-invalid={errors.country ? "true" : undefined}
                    onValueChange={(value) => {
                      if (typeof value === "string") {
                        dispatch(
                          setAccountDraftField({
                            field: "country",
                            value,
                          }),
                        );
                      }
                    }}
                  />
                  {errors.country ? (
                    <FieldDescription>{errors.country}</FieldDescription>
                  ) : null}
                </Field>

                <Field
                  className={`${styles.formField} ${styles.formFieldFull}`}
                  data-invalid={errors.email ? "" : undefined}
                  data-disabled={isEmailLocked ? "" : undefined}
                >
                  <FieldLabel htmlFor="account_email" required>
                    {p.email}
                  </FieldLabel>
                  <Input
                    id="account_email"
                    type="email"
                    value={draft.email}
                    disabled={isEmailLocked}
                    aria-invalid={errors.email ? "true" : undefined}
                    onChange={(event) => {
                      dispatch(
                        setAccountDraftField({
                          field: "email",
                          value: event.target.value,
                        }),
                      );
                    }}
                  />
                  {errors.email || isEmailLocked ? (
                    <FieldDescription>
                      {errors.email ?? p.emailLockedDescription}
                    </FieldDescription>
                  ) : null}
                </Field>

                <Field
                  className={`${styles.formField} ${styles.formFieldFull}`}
                  data-invalid={errors.phone ? "" : undefined}
                  data-disabled={isPhoneLocked ? "" : undefined}
                >
                  <FieldLabel htmlFor="account_phone">{p.phone}</FieldLabel>
                  <div className={styles.phoneRow}>
                    <div className={styles.phonePrefix}>{derivedPhonePrefix}</div>
                    <Input
                      id="account_phone"
                      type="tel"
                      value={draft.phone}
                      placeholder={p.phonePlaceholder}
                      disabled={isPhoneLocked}
                      aria-invalid={errors.phone ? "true" : undefined}
                      onChange={(event) => {
                        dispatch(
                          setAccountDraftField({
                            field: "phone",
                            value: event.target.value,
                          }),
                        );
                      }}
                    />
                  </div>
                  <FieldDescription>
                    {errors.phone ??
                      (isPhoneLocked
                        ? p.phoneLockedDescription
                        : `${p.phonePrefix}: ${derivedPhonePrefix}`)}
                  </FieldDescription>
                </Field>
              </div>

              <div className={styles.formActions}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => dispatch(cancelEditingAccount())}
                  disabled={isSaving}
                >
                  {p.cancelEditing}
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  icon="save"
                  isLoading={isSaving}
                >
                  {isSaving ? p.savingChanges : p.saveChanges}
                </Button>
              </div>
            </form>
          ) : (
            <dl className={styles.list}>
              <div className={styles.row}>
                <dt className={styles.label}>{p.firstName}</dt>
                <dd className={styles.value}>{profile.first_name}</dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.label}>{p.lastName}</dt>
                <dd className={styles.value}>{profile.last_name}</dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.label}>{p.email}</dt>
                <dd className={styles.value}>{profile.email}</dd>
              </div>
              {editableProfile ? (
                <>
                  <div className={styles.row}>
                    <dt className={styles.label}>{p.birthday}</dt>
                    <dd className={styles.value}>
                      {formatDate(editableProfile.birthday, locale)}
                    </dd>
                  </div>
                  <div className={styles.row}>
                    <dt className={styles.label}>{p.country}</dt>
                    <dd className={styles.value}>
                      {getCountryLabel(editableProfile.country, locale)}
                    </dd>
                  </div>
                  <div className={styles.row}>
                    <dt className={styles.label}>{p.phone}</dt>
                    <dd
                      className={`${styles.value} ${!editableProfile.phone ? styles.valueMuted : ""}`}
                    >
                      {formattedPhone}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{p.accountInfo}</h2>
          <dl className={styles.list}>
            <div className={styles.row}>
              <dt className={styles.label}>{p.userType}</dt>
              <dd className={styles.value}>
                <span className={styles.typeBadge}>{typeLabel[profile.type] ?? profile.type}</span>
              </dd>
            </div>
            {editableProfile ? (
              <div className={styles.row}>
                <dt className={styles.label}>{p.email}</dt>
                <dd className={styles.value}>
                  <span
                    className={`${styles.verifiedBadge} ${editableProfile.email_verified ? styles.verifiedBadgeYes : styles.verifiedBadgeNo}`}
                  >
                    {editableProfile.email_verified
                      ? p.emailVerified
                      : p.emailNotVerified}
                  </span>
                </dd>
              </div>
            ) : null}
            {editableProfile ? (
              <div className={styles.row}>
                <dt className={styles.label}>{p.phone}</dt>
                <dd className={styles.value}>
                  <span
                    className={`${styles.verifiedBadge} ${editableProfile.phone_verified ? styles.verifiedBadgeYes : styles.verifiedBadgeNo}`}
                  >
                    {editableProfile.phone_verified
                      ? p.phoneVerified
                      : p.phoneNotVerified}
                  </span>
                </dd>
              </div>
            ) : null}
            <div className={styles.row}>
              <dt className={styles.label}>{p.memberSince}</dt>
              <dd className={styles.value}>{formatDate(profile.created_at, locale)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
