"use client";

import { isAxiosError } from "axios";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms/alert-dialog";
import { Button } from "@/components/atoms/button";
import { AvatarCropDialog } from "@/components/molecules/avatar-crop-dialog/avatar-crop-dialog";
import {
  Combobox,
  type ComboboxOption,
} from "@/components/atoms/combobox";
import {
  Field,
  FieldDescription,
  FieldLabel,
  Input,
} from "@/components/atoms/input";
import { Switch } from "@/components/atoms/switch";
import { Icon } from "@/components/icon";
import { RichTextEditor } from "@/components/molecules/rich-text-editor/rich-text-editor";
import { StatusBanner } from "@/components/molecules/status-banner";
import { useLocale } from "@/components/providers/locale-provider";
import {
  fetchBranchTeamDetail,
  inviteBranchTeamMember,
  removeBranchTeamMember,
  searchUsoUsers,
  type BranchTeamDetail,
  type TeamWorkspaceMember,
  type UserSearchResult,
} from "@/lib/brands-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { Branch } from "@/types/brand";
import styles from "./branch-modal.module.css";
import {
  isValidTime24,
  TimeInput,
} from "./time-input";

type BranchDraft = Omit<Branch, "id" | "brand_id"> & {
  id?: string;
  photoFile?: File | null;
  photoPreviewUrl?: string | null;
  photoRemoved?: boolean;
};

type BranchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: BranchDraft;
  brandId?: string | null;
  onSave: (branch: BranchDraft) => void;
};

type CropTarget = {
  file: File;
  aspectRatio: "1:1";
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
    photoFile: null,
    photoPreviewUrl: null,
    photoRemoved: false,
  };
}

function formatMemberName(
  member: Pick<TeamWorkspaceMember, "first_name" | "last_name">,
) {
  return `${member.first_name} ${member.last_name}`.trim();
}

function getInitials(
  member: Pick<TeamWorkspaceMember, "first_name" | "last_name">,
) {
  return `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`.toUpperCase();
}

function getMemberStatusLabel(
  status: TeamWorkspaceMember["status"],
  t: { branchPendingStatus: string; branchRejectedStatus: string; branchRemovedStatus: string },
) {
  if (status === "PENDING") return t.branchPendingStatus;
  if (status === "REJECTED") return t.branchRejectedStatus;
  if (status === "REMOVED") return t.branchRemovedStatus;
  return status;
}

function sortMembers(members: TeamWorkspaceMember[]) {
  return [...members].sort((left, right) => {
    if (left.role !== right.role) {
      return left.role === "OWNER" ? -1 : 1;
    }

    return formatMemberName(left).localeCompare(formatMemberName(right));
  });
}

export function BranchModal({
  open,
  onOpenChange,
  initial,
  brandId,
  onSave,
}: BranchModalProps) {
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const accessToken = session.accessToken;
  const visualInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<number | null>(null);
  const [draft, setDraft] = useState<BranchDraft>(() => initial ?? createEmptyBranch());
  const [errors, setErrors] = useState<
    Partial<Record<keyof BranchDraft | string, string>>
  >({});
  const [teamState, setTeamState] = useState<"idle" | "loading" | "ready" | "error">(
    initial?.id && brandId && accessToken ? "loading" : "idle",
  );
  const [team, setTeam] = useState<BranchTeamDetail | null>(null);
  const [teamFeedback, setTeamFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchComboValue, setSearchComboValue] = useState("");
  const [searchItems, setSearchItems] = useState<ComboboxOption[]>([]);
  const [searchItemsMap, setSearchItemsMap] = useState<
    Map<string, UserSearchResult>
  >(new Map());
  const [selectedSearchTarget, setSelectedSearchTarget] =
    useState<UserSearchResult | null>(null);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [inviteUserId, setInviteUserId] = useState<string | null>(null);
  const [memberActionId, setMemberActionId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initial ?? createEmptyBranch());
    setErrors({});
    setTeam(null);
    setTeamState(initial?.id && brandId && accessToken ? "loading" : "idle");
    setTeamFeedback(null);
    setCropTarget(null);
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }
    setSearchInputValue("");
    setSearchComboValue("");
    setSearchItems([]);
    setSearchItemsMap(new Map());
    setSelectedSearchTarget(null);
    setSearchState("idle");
    setInviteUserId(null);
    setMemberActionId(null);
  }, [accessToken, brandId, initial, open]);

  const teamEnabled = Boolean(open && brandId && draft.id && accessToken);
  const branchId = draft.id ?? null;

  async function refreshTeam(options?: { showLoading?: boolean }) {
    if (!brandId || !branchId || !accessToken) {
      return null;
    }

    const resolvedBrandId: string = brandId;
    const resolvedBranchId: string = branchId;
    const resolvedAccessToken: string = accessToken;
    if (options?.showLoading) {
      setTeamState("loading");
    }

    const nextTeam = await fetchBranchTeamDetail(
      resolvedBrandId,
      resolvedBranchId,
      resolvedAccessToken,
    );
    setTeam(nextTeam);
    setTeamState("ready");
    return nextTeam;
  }

  useEffect(() => {
    if (!teamEnabled || !brandId || !branchId || !accessToken) {
      return;
    }

    const resolvedBrandId: string = brandId;
    const resolvedBranchId: string = branchId;
    const resolvedAccessToken: string = accessToken;

    let active = true;

    async function loadTeam() {
      try {
        const nextTeam = await fetchBranchTeamDetail(
          resolvedBrandId,
          resolvedBranchId,
          resolvedAccessToken,
        );

        if (!active) {
          return;
        }

        setTeam(nextTeam);
        setTeamState("ready");
      } catch {
        if (!active) {
          return;
        }

        setTeamState("error");
      }
    }

    void loadTeam();

    return () => {
      active = false;
    };
  }, [accessToken, branchId, brandId, teamEnabled]);

  const acceptedMembers = useMemo(
    () => sortMembers(team?.members.accepted ?? []),
    [team],
  );
  const pendingMembers = useMemo(
    () => sortMembers(team?.members.pending ?? []),
    [team],
  );
  const archivedMembers = useMemo(
    () =>
      sortMembers([
        ...(team?.members.rejected ?? []),
        ...(team?.members.removed ?? []),
      ]),
    [team],
  );

  useEffect(
    () => () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
      }
    },
    [],
  );

  function updateField<K extends keyof BranchDraft>(key: K, value: BranchDraft[K]) {
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
      breaks: prev.breaks.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateBreak(index: number, field: "start" | "end", value: string) {
    setDraft((prev) => {
      const nextBreaks = [...prev.breaks];
      nextBreaks[index] = { ...nextBreaks[index], [field]: value };
      return { ...prev, breaks: nextBreaks };
    });
  }

  function handleVisualChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (visualInputRef.current) {
      visualInputRef.current.value = "";
    }

    if (!file) return;

    setCropTarget({
      file,
      aspectRatio: "1:1",
    });
  }

  function handleVisualCrop(croppedFile: File) {
    if (draft.photoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(draft.photoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(croppedFile);
    setDraft((prev) => ({
      ...prev,
      photoFile: croppedFile,
      photoPreviewUrl: previewUrl,
      photoRemoved: false,
    }));
    setCropTarget(null);
  }

  function handleRemoveVisual() {
    if (draft.photoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(draft.photoPreviewUrl);
    }

    setDraft((prev) => ({
      ...prev,
      photoFile: null,
      photoPreviewUrl: null,
      photoRemoved: true,
    }));
  }

  function validate() {
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
      } else if (!isValidTime24(draft.opening)) {
        nextErrors.opening = "HH:mm";
      }

      if (!draft.closing?.trim()) {
        nextErrors.closing = t.closingRequiredMessage;
      } else if (!isValidTime24(draft.closing)) {
        nextErrors.closing = "HH:mm";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      return;
    }

    onSave(draft);
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setErrors({});
    }

    onOpenChange(nextOpen);
  }

  function resolveTeamError(error: unknown, fallback: string) {
    if (isAxiosError(error)) {
      const translated = translateBackendErrorMessage(
        error.response?.data?.message,
        messages.backendErrors,
      );

      if (translated) {
        return translated;
      }
    }

    return fallback;
  }

  async function handleRetryTeam() {
    setTeamFeedback(null);

    try {
      await refreshTeam({ showLoading: true });
    } catch (error) {
      setTeamState("error");
      setTeamFeedback({
        tone: "error",
        message: resolveTeamError(error, t.branchTeamError),
      });
    }
  }

  async function handleInvite(user: UserSearchResult) {
    if (!brandId || !branchId || !accessToken) {
      return;
    }

    const resolvedBrandId: string = brandId;
    const resolvedBranchId: string = branchId;
    const resolvedAccessToken: string = accessToken;

    setInviteUserId(user.id);
    setTeamFeedback(null);

    try {
      await inviteBranchTeamMember(
        resolvedBrandId,
        resolvedBranchId,
        user.id,
        resolvedAccessToken,
      );
      await refreshTeam();
      setSearchInputValue("");
      setSearchComboValue("");
      setSearchItems([]);
      setSearchItemsMap(new Map());
      setSelectedSearchTarget(null);
      setSearchState("idle");
      setTeamFeedback({ tone: "success", message: t.branchInviteSuccess });
    } catch (error) {
      setTeamFeedback({
        tone: "error",
        message: resolveTeamError(error, t.branchTeamError),
      });
    } finally {
      setInviteUserId(null);
    }
  }

  function handleSearchInput(event: React.FormEvent<HTMLInputElement>) {
    const query = (event.target as HTMLInputElement).value.trim();
    setSearchInputValue(query);
    setSearchComboValue("");
    setSelectedSearchTarget(null);
    setTeamFeedback(null);

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }

    if (!teamEnabled || !team || !accessToken || query.length < 2) {
      setSearchItems([]);
      setSearchItemsMap(new Map());
      setSearchState("idle");
      return;
    }

    setSearchState("loading");
    const resolvedAccessToken: string = accessToken;
    const memberIds = new Set(
      [...acceptedMembers, ...pendingMembers].map((member) => member.user_id),
    );

    searchTimerRef.current = window.setTimeout(async () => {
      try {
        const results = await searchUsoUsers(query, resolvedAccessToken);
        const filteredResults = results.filter(
          (user) => !memberIds.has(user.id) && user.id !== session.user?.id,
        );

        setSearchItemsMap(new Map(filteredResults.map((user) => [user.id, user])));
        setSearchItems(
          filteredResults.map((user) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name}`.trim(),
            description: user.email,
            keywords: [user.email ?? "", user.first_name, user.last_name],
          })),
        );
        setSearchState("done");
      } catch {
        setSearchItems([]);
        setSearchItemsMap(new Map());
        setSearchState("error");
      }
    }, 260);
  }

  function handleSearchValueChange(value: string | string[]) {
    const userId = Array.isArray(value) ? value[0] : value;
    setSearchComboValue(userId ?? "");
    setSelectedSearchTarget(searchItemsMap.get(userId ?? "") ?? null);
    setTeamFeedback(null);
  }

  async function handleRemove(member: TeamWorkspaceMember) {
    if (!brandId || !branchId || !accessToken) {
      return;
    }

    const resolvedBrandId: string = brandId;
    const resolvedBranchId: string = branchId;
    const resolvedAccessToken: string = accessToken;

    setMemberActionId(member.membership_id);
    setTeamFeedback(null);

    try {
      await removeBranchTeamMember(
        resolvedBrandId,
        resolvedBranchId,
        member.membership_id,
        resolvedAccessToken,
      );
      await refreshTeam();
      setTeamFeedback({ tone: "success", message: t.branchMemberRemoveSuccess });
    } catch (error) {
      setTeamFeedback({
        tone: "error",
        message: resolveTeamError(error, t.branchTeamError),
      });
    } finally {
      setMemberActionId(null);
    }
  }

  async function handleReinvite(member: TeamWorkspaceMember) {
    if (!brandId || !branchId || !accessToken) {
      return;
    }

    const resolvedBrandId: string = brandId;
    const resolvedBranchId: string = branchId;
    const resolvedAccessToken: string = accessToken;

    setMemberActionId(member.membership_id);
    setTeamFeedback(null);

    try {
      await inviteBranchTeamMember(
        resolvedBrandId,
        resolvedBranchId,
        member.user_id,
        resolvedAccessToken,
      );
      await refreshTeam();
      setTeamFeedback({ tone: "success", message: t.branchReinviteSuccess });
    } catch (error) {
      setTeamFeedback({
        tone: "error",
        message: resolveTeamError(error, t.branchTeamError),
      });
    } finally {
      setMemberActionId(null);
    }
  }

  const isEditing = Boolean(initial?.id);
  const modalTitle = isEditing ? t.branchEditModalTitle : t.branchModalTitle;
  const visualStyle = draft.photoPreviewUrl
    ? { backgroundImage: `url(${draft.photoPreviewUrl})` }
    : undefined;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={styles.dialogContent}>
        <AlertDialogHeader className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerIcon}>
              <Icon icon="account_tree" size={18} color="current" />
            </div>
            <div className={styles.headerText}>
              <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {isEditing ? t.branchSubtitleEdit : t.branchSubtitleNew}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className={styles.body}>
          <section className={styles.stageGrid}>
            <article className={styles.stageCard}>
              <div className={styles.stageCardHeader}>
                <div>
                  <h3 className={styles.stageTitle}>{t.branchIdentityTitle}</h3>
                  <p className={styles.stageLead}>
                    {draft.name.trim() || t.branchFieldNamePlaceholder}
                  </p>
                </div>
                <span className={styles.stageBadge}>
                  {draft.photoPreviewUrl
                    ? t.branchVisualReady
                    : teamEnabled
                      ? t.branchTeamLiveBadge
                      : t.branchCoverPlannedBadge}
                </span>
              </div>

              <div className={styles.identityPreview}>
                <div className={styles.identityIcon}>
                  <Icon icon="account_tree" size={28} color="current" />
                </div>
                <div className={styles.identityMeta}>
                  <strong>{draft.name.trim() || "Branch"}</strong>
                  <span>
                    {draft.address1.trim() || t.branchFieldAddress1Placeholder}
                  </span>
                </div>
              </div>

              <div className={styles.identityFacts}>
                <div className={styles.identityFact}>
                  <span>{t.detailTableAvailability}</span>
                  <strong>
                    {draft.is_24_7
                      ? t.branchField247
                      : draft.opening && draft.closing
                        ? `${draft.opening} - ${draft.closing}`
                        : "—"}
                  </strong>
                </div>
                <div className={styles.identityFact}>
                  <span>{t.detailTableContact}</span>
                  <strong>{draft.phone || draft.email || "—"}</strong>
                </div>
              </div>
            </article>

            <article className={styles.stageCard}>
              <div className={styles.stageCardHeader}>
                <div>
                  <h3 className={styles.stageTitle}>{t.branchVisualTitle}</h3>
                  <p className={styles.stageLead}>{t.branchVisualDescription}</p>
                </div>
                <span className={styles.stageBadge}>
                  {draft.photoPreviewUrl
                    ? t.branchVisualReady
                    : t.branchVisualEmpty}
                </span>
              </div>

              <div className={styles.visualFrame} style={visualStyle}>
                {draft.photoPreviewUrl ? (
                  <div className={styles.visualOverlay}>
                    <strong>{draft.name.trim() || t.branchFieldNamePlaceholder}</strong>
                    <span>{t.branchVisualReady}</span>
                  </div>
                ) : (
                  <div className={styles.visualEmpty}>
                    <div className={styles.visualEmptyIcon}>
                      <Icon icon="sell" size={22} color="current" />
                    </div>
                    <div className={styles.visualEmptyText}>
                      <strong>{t.branchVisualPendingTitle}</strong>
                      <p>{t.branchVisualPendingBody}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.visualActions}>
                <input
                  ref={visualInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleVisualChange}
                />
                <Button
                  variant="outline"
                  size="small"
                  icon={draft.photoPreviewUrl ? "edit" : "add"}
                  onClick={() => visualInputRef.current?.click()}
                >
                  {draft.photoPreviewUrl
                    ? t.branchVisualReplace
                    : t.branchVisualAdd}
                </Button>
                {draft.photoPreviewUrl ? (
                  <Button
                    variant="ghost"
                    size="small"
                    icon="delete"
                    onClick={handleRemoveVisual}
                  >
                    {t.branchVisualRemove}
                  </Button>
                ) : null}
              </div>
            </article>
          </section>

          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <h3 className={styles.sectionTitle}>{t.basicInfoSection}</h3>
            </div>

            <div className={styles.form}>
              <Field>
                <FieldLabel required>{t.branchFieldName}</FieldLabel>
                <Input
                  data-alert-dialog-autofocus
                  value={draft.name}
                  placeholder={t.branchFieldNamePlaceholder}
                  aria-invalid={Boolean(errors.name)}
                  onChange={(event) => updateField("name", event.target.value)}
                />
                {errors.name ? (
                  <p className={styles.errorText}>{errors.name}</p>
                ) : null}
              </Field>

              <Field>
                <FieldLabel>{t.branchFieldDescription}</FieldLabel>
                <RichTextEditor
                  value={draft.description ?? ""}
                  placeholder={t.branchFieldDescriptionPlaceholder}
                  onChange={(html) => updateField("description", html)}
                />
              </Field>

              <div className={styles.row}>
                <Field>
                  <FieldLabel required>{t.branchFieldAddress1}</FieldLabel>
                  <Input
                    value={draft.address1}
                    placeholder={t.branchFieldAddress1Placeholder}
                    aria-invalid={Boolean(errors.address1)}
                    onChange={(event) =>
                      updateField("address1", event.target.value)
                    }
                  />
                  {errors.address1 ? (
                    <p className={styles.errorText}>{errors.address1}</p>
                  ) : null}
                </Field>

                <Field>
                  <FieldLabel>{t.branchFieldAddress2}</FieldLabel>
                  <Input
                    value={draft.address2 ?? ""}
                    placeholder={t.branchFieldAddress2Placeholder}
                    onChange={(event) =>
                      updateField("address2", event.target.value)
                    }
                  />
                </Field>
              </div>

              <div className={styles.row}>
                <Field>
                  <FieldLabel>{t.branchFieldPhone}</FieldLabel>
                  <Input
                    type="tel"
                    value={draft.phone ?? ""}
                    placeholder={t.branchFieldPhonePlaceholder}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>{t.branchFieldEmail}</FieldLabel>
                  <Input
                    type="email"
                    value={draft.email ?? ""}
                    placeholder={t.branchFieldEmailPlaceholder}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </Field>
              </div>

              <div className={styles.switchRow}>
                <div>
                  <span className={styles.switchLabel}>{t.branchField247}</span>
                  <p className={styles.switchHint}>{t.detailTableAvailability}</p>
                </div>
                <Switch
                  checked={draft.is_24_7}
                  onChange={(event) => {
                    updateField("is_24_7", event.target.checked);
                    if (event.target.checked) {
                      setErrors((prev) => ({
                        ...prev,
                        opening: undefined,
                        closing: undefined,
                      }));
                    }
                  }}
                />
              </div>

              {!draft.is_24_7 ? (
                <>
                  <div className={styles.row}>
                    <Field>
                      <FieldLabel required>{t.branchFieldOpening}</FieldLabel>
                      <TimeInput
                        value={draft.opening ?? ""}
                        placeholder="09:00"
                        aria-invalid={Boolean(errors.opening)}
                        onChange={(value) => updateField("opening", value)}
                      />
                      {errors.opening ? (
                        <p className={styles.errorText}>{errors.opening}</p>
                      ) : null}
                    </Field>

                    <Field>
                      <FieldLabel required>{t.branchFieldClosing}</FieldLabel>
                      <TimeInput
                        value={draft.closing ?? ""}
                        placeholder="18:00"
                        aria-invalid={Boolean(errors.closing)}
                        onChange={(value) => updateField("closing", value)}
                      />
                      {errors.closing ? (
                        <p className={styles.errorText}>{errors.closing}</p>
                      ) : null}
                    </Field>
                  </div>

                  <div className={styles.breaksSection}>
                    <div className={styles.breaksSectionHeader}>
                      <p className={styles.breaksSectionTitle}>
                        {t.branchFieldBreaks}
                      </p>
                      <Button
                        variant="outline"
                        size="small"
                        icon="add"
                        onClick={addBreak}
                      >
                        {t.branchAddBreak}
                      </Button>
                    </div>

                    {draft.breaks.map((branchBreak, index) => (
                      <div key={branchBreak.id ?? index} className={styles.breakRow}>
                        <Field>
                          <FieldLabel>{t.branchFieldOpening}</FieldLabel>
                          <TimeInput
                            value={branchBreak.start}
                            placeholder="12:00"
                            onChange={(value) => updateBreak(index, "start", value)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>{t.branchFieldClosing}</FieldLabel>
                          <TimeInput
                            value={branchBreak.end}
                            placeholder="13:00"
                            onChange={(value) => updateBreak(index, "end", value)}
                          />
                        </Field>
                        <Button
                          variant="unstyled"
                          type="button"
                          className={styles.removeBreakBtn}
                          aria-label={t.branchRemoveBreak}
                          onClick={() => removeBreak(index)}
                        >
                          <Icon icon="delete" size={16} color="current" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <section className={styles.teamSection}>
            <div className={styles.formSectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>{t.branchTeamTitle}</h3>
                <p className={styles.sectionLead}>{t.branchTeamDescription}</p>
              </div>
              <span className={styles.stageBadge}>{t.branchTeamLiveBadge}</span>
            </div>

            {!teamEnabled ? (
              <div className={styles.teamLocked}>
                <div className={styles.teamLockedIcon}>
                  <Icon icon="groups" size={18} color="current" />
                </div>
                <div className={styles.teamLockedText}>
                  <strong>{t.branchTeamLockedTitle}</strong>
                  <p>{t.branchTeamLockedBody}</p>
                  <span>{t.branchTeamAfterSave}</span>
                </div>
              </div>
            ) : teamState === "loading" ? (
              <div className={styles.teamStateCard}>{t.branchTeamLoading}</div>
            ) : teamState === "error" ? (
              <div className={styles.teamStateCard}>
                <strong>{t.branchTeamError}</strong>
                <Button
                  variant="outline"
                  size="small"
                  icon="refresh"
                  onClick={() => {
                    void handleRetryTeam();
                  }}
                >
                  {t.branchTeamRetry}
                </Button>
              </div>
            ) : (
              <div className={styles.teamPanel}>
                <Field>
                  <FieldLabel>{t.branchSearchLabel}</FieldLabel>
                  <Combobox
                    items={searchItems}
                    value={searchComboValue}
                    placeholder={t.branchSearchPlaceholder}
                    emptyMessage={
                      searchState === "loading"
                        ? t.branchSearchLoading
                        : searchState === "error"
                          ? t.branchTeamError
                          : searchInputValue.length >= 2
                            ? t.branchSearchEmpty
                            : t.branchSearchHint
                    }
                    onValueChange={handleSearchValueChange}
                    onInput={handleSearchInput}
                    renderItem={(item) => {
                      const user = searchItemsMap.get(item.value);
                      const avatarUrl = proxyMediaUrl(user?.avatar_url);

                      return (
                        <div className={styles.memberIdentity}>
                          <div
                            className={styles.avatar}
                            style={
                              avatarUrl
                                ? { backgroundImage: `url(${avatarUrl})` }
                                : undefined
                            }
                            data-has-image={avatarUrl ? "true" : "false"}
                          >
                            {!avatarUrl && user
                              ? getInitials({
                                  first_name: user.first_name,
                                  last_name: user.last_name,
                                } as TeamWorkspaceMember)
                              : null}
                          </div>
                          <div className={styles.memberMeta}>
                            <strong>{item.label}</strong>
                            {item.description ? <span>{item.description}</span> : null}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <FieldDescription>{t.branchSearchHint}</FieldDescription>
                </Field>

                {teamFeedback ? (
                  <StatusBanner variant={teamFeedback.tone === "success" ? "success" : "error"}>
                    {teamFeedback.message}
                  </StatusBanner>
                ) : null}

                {!selectedSearchTarget ? (
                  <div className={styles.searchState}>
                    {searchState === "loading"
                      ? t.branchSearchLoading
                      : searchState === "error"
                        ? t.branchTeamError
                        : searchInputValue.length < 2
                          ? t.branchSearchIdle
                          : searchItems.length === 0
                            ? t.branchSearchEmpty
                            : t.branchSearchReady}
                  </div>
                ) : null}

                {selectedSearchTarget ? (
                  <div className={styles.searchList}>
                    <article
                      key={selectedSearchTarget.id}
                      className={styles.memberCard}
                    >
                      <div className={styles.memberIdentity}>
                        <div
                          className={styles.avatar}
                          style={
                            proxyMediaUrl(selectedSearchTarget.avatar_url)
                              ? {
                                  backgroundImage: `url(${proxyMediaUrl(
                                    selectedSearchTarget.avatar_url,
                                  )})`,
                                }
                              : undefined
                          }
                          data-has-image={
                            proxyMediaUrl(selectedSearchTarget.avatar_url)
                              ? "true"
                              : "false"
                          }
                        >
                          {!proxyMediaUrl(selectedSearchTarget.avatar_url)
                            ? getInitials({
                                first_name: selectedSearchTarget.first_name,
                                last_name: selectedSearchTarget.last_name,
                              } as TeamWorkspaceMember)
                            : null}
                        </div>
                        <div className={styles.memberMeta}>
                          <strong>
                            {`${selectedSearchTarget.first_name} ${selectedSearchTarget.last_name}`.trim()}
                          </strong>
                          <span>{selectedSearchTarget.email}</span>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="small"
                        icon="add"
                        isLoading={inviteUserId === selectedSearchTarget.id}
                        onClick={() => {
                          void handleInvite(selectedSearchTarget);
                        }}
                      >
                        {t.branchInvite}
                      </Button>
                    </article>
                  </div>
                ) : null}

                <div className={styles.teamGroups}>
                  <div className={styles.teamGroup}>
                    <h4>{t.branchAcceptedTitle}</h4>
                    {acceptedMembers.length === 0 ? (
                      <div className={styles.emptyCard}>{t.branchNoAccepted}</div>
                    ) : (
                      <div className={styles.memberGrid}>
                        {acceptedMembers.map((member) => {
                          const avatarUrl = proxyMediaUrl(member.avatar_url);

                          return (
                            <article key={member.membership_id} className={styles.memberCard}>
                              <div className={styles.memberIdentity}>
                                <div
                                  className={styles.avatar}
                                  style={
                                    avatarUrl
                                      ? { backgroundImage: `url(${avatarUrl})` }
                                      : undefined
                                  }
                                  data-has-image={avatarUrl ? "true" : "false"}
                                >
                                  {!avatarUrl ? getInitials(member) : null}
                                </div>
                                <div className={styles.memberMeta}>
                                  <strong>{formatMemberName(member)}</strong>
                                  <span>{member.email}</span>
                                </div>
                              </div>
                              <div className={styles.memberPills}>
                                <span className={styles.roleBadge}>
                                  {member.role === "OWNER"
                                    ? t.branchOwnerRole
                                    : t.branchMemberRole}
                                </span>
                              </div>
                              {member.role !== "OWNER" ? (
                                <Button
                                  variant="outline"
                                  size="small"
                                  icon="delete"
                                  isLoading={memberActionId === member.membership_id}
                                  onClick={() => {
                                    void handleRemove(member);
                                  }}
                                >
                                  {t.branchMemberRemove}
                                </Button>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.teamGroup}>
                    <h4>{t.branchPendingTitle}</h4>
                    {pendingMembers.length === 0 ? (
                      <div className={styles.emptyCard}>{t.branchNoPending}</div>
                    ) : (
                      <div className={styles.memberGrid}>
                        {pendingMembers.map((member) => {
                          const avatarUrl = proxyMediaUrl(member.avatar_url);

                          return (
                            <article key={member.membership_id} className={styles.memberCard}>
                              <div className={styles.memberIdentity}>
                                <div
                                  className={styles.avatar}
                                  style={
                                    avatarUrl
                                      ? { backgroundImage: `url(${avatarUrl})` }
                                      : undefined
                                  }
                                  data-has-image={avatarUrl ? "true" : "false"}
                                >
                                  {!avatarUrl ? getInitials(member) : null}
                                </div>
                                <div className={styles.memberMeta}>
                                  <strong>{formatMemberName(member)}</strong>
                                  <span>{member.email}</span>
                                </div>
                              </div>
                              <div className={styles.memberPills}>
                                <span className={styles.roleBadge}>
                                  {t.branchPendingStatus}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="small"
                                icon="close"
                                isLoading={memberActionId === member.membership_id}
                                onClick={() => {
                                  void handleRemove(member);
                                }}
                              >
                                {t.branchCancelInvite}
                              </Button>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.teamGroup}>
                    <h4>{t.branchArchiveTitle}</h4>
                    {archivedMembers.length === 0 ? (
                      <div className={styles.emptyCard}>{t.branchNoArchive}</div>
                    ) : (
                      <div className={styles.memberGrid}>
                        {archivedMembers.map((member) => {
                          const avatarUrl = proxyMediaUrl(member.avatar_url);

                          return (
                            <article key={member.membership_id} className={styles.memberCard}>
                              <div className={styles.memberIdentity}>
                                <div
                                  className={styles.avatar}
                                  style={
                                    avatarUrl
                                      ? { backgroundImage: `url(${avatarUrl})` }
                                      : undefined
                                  }
                                  data-has-image={avatarUrl ? "true" : "false"}
                                >
                                  {!avatarUrl ? getInitials(member) : null}
                                </div>
                                <div className={styles.memberMeta}>
                                  <strong>{formatMemberName(member)}</strong>
                                  <span>{member.email}</span>
                                </div>
                              </div>
                              <div className={styles.memberPills}>
                                <span className={styles.roleBadge}>
                                  {getMemberStatusLabel(member.status, t)}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="small"
                                icon="refresh"
                                isLoading={memberActionId === member.membership_id}
                                onClick={() => {
                                  void handleReinvite(member);
                                }}
                              >
                                {t.branchReinvite}
                              </Button>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <AlertDialogFooter className={styles.footer}>
          <AlertDialogCancel>{t.branchCancel}</AlertDialogCancel>
          <Button variant="primary" onClick={handleSave}>
            {t.branchSave}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
      {cropTarget ? (
        <AvatarCropDialog
          file={cropTarget.file}
          aspectRatio={cropTarget.aspectRatio}
          open={true}
          onConfirm={handleVisualCrop}
          onClose={() => setCropTarget(null)}
        />
      ) : null}
    </AlertDialog>
  );
}
