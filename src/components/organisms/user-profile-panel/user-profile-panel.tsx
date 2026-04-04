"use client";

import { useEffect, useMemo, type FormEvent } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Combobox,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  type ComboboxOption,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import {
  findCountryByValue,
  getCountryLabel,
  getCountryOptions,
} from "@/lib/countries";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelEditingAccount,
  hydrateAccountProfile,
  selectAccountState,
  setAccountDraftField,
  startEditingAccount,
  submitAccountUpdate,
} from "@/store/account";
import type { AccountUserProfile, UserProfile } from "@/types";
import styles from "./user-profile-panel.module.css";

type UserProfilePanelProps = {
  user: AccountUserProfile;
  canEdit?: boolean;
};

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
  const countryOptions: readonly ComboboxOption[] = useMemo(
    () => getCountryOptions(locale),
    [locale],
  );

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroIdentity}>
          <span className={styles.avatarLarge}>{initials}</span>
          <div className={styles.heroText}>
            <h1 className={styles.fullName}>
              {profile.first_name} {profile.last_name}
            </h1>
            <p className={styles.heroEmail}>{profile.email}</p>
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
        <Alert
          className={styles.feedback}
          variant={feedback.variant}
          icon={feedback.icon}
        >
          <AlertTitle>{feedback.title}</AlertTitle>
          <AlertDescription>{feedback.description}</AlertDescription>
        </Alert>
      ) : null}

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
