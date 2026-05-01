"use client";

import { isAxiosError } from "axios";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { FormFooter, FormFooterSpacer } from "@/components/molecules/form-footer";
import { PageSurfaceHeader } from "@/components/molecules/page-surface-header";
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
import styles from "./branch-page.module.css";
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

type BranchPageProps = {
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

function formatMemberName(m: Pick<TeamWorkspaceMember, "first_name" | "last_name">) {
  return `${m.first_name} ${m.last_name}`.trim();
}

function getInitials(m: Pick<TeamWorkspaceMember, "first_name" | "last_name">) {
  return `${m.first_name[0] ?? ""}${m.last_name[0] ?? ""}`.toUpperCase();
}

function getMemberStatusLabel(status: TeamWorkspaceMember["status"], t: { branchPendingStatus: string; branchRejectedStatus: string; branchRemovedStatus: string }) {
  if (status === "PENDING") return t.branchPendingStatus;
  if (status === "REJECTED") return t.branchRejectedStatus;
  if (status === "REMOVED") return t.branchRemovedStatus;
  return status;
}

function sortMembers(members: TeamWorkspaceMember[]) {
  return [...members].sort((a, b) => {
    if (a.role !== b.role) return a.role === "OWNER" ? -1 : 1;
    return formatMemberName(a).localeCompare(formatMemberName(b));
  });
}

export function BranchPage({
  open,
  onOpenChange,
  initial,
  brandId,
  onSave,
}: BranchPageProps) {
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const accessToken = session.accessToken;
  const visualInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<number | null>(null);

  const [draft, setDraft] = useState<BranchDraft>(() => initial ?? createEmptyBranch());
  const [errors, setErrors] = useState<Partial<Record<keyof BranchDraft | string, string>>>({});
  const [teamState, setTeamState] = useState<"idle" | "loading" | "ready" | "error">(
    initial?.id && brandId && accessToken ? "loading" : "idle",
  );
  const [team, setTeam] = useState<BranchTeamDetail | null>(null);
  const [teamFeedback, setTeamFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchComboValue, setSearchComboValue] = useState("");
  const [searchItems, setSearchItems] = useState<ComboboxOption[]>([]);
  const [searchItemsMap, setSearchItemsMap] = useState<Map<string, UserSearchResult>>(new Map());
  const [selectedSearchTarget, setSelectedSearchTarget] = useState<UserSearchResult | null>(null);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [inviteUserId, setInviteUserId] = useState<string | null>(null);
  const [memberActionId, setMemberActionId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initial ?? createEmptyBranch());
    setErrors({});
    setTeam(null);
    setTeamState(initial?.id && brandId && accessToken ? "loading" : "idle");
    setTeamFeedback(null);
    setCropTarget(null);
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
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

  async function refreshTeam(opts?: { showLoading?: boolean }) {
    if (!brandId || !branchId || !accessToken) return null;
    if (opts?.showLoading) setTeamState("loading");
    const next = await fetchBranchTeamDetail(brandId, branchId, accessToken);
    setTeam(next);
    setTeamState("ready");
    return next;
  }

  useEffect(() => {
    if (!teamEnabled || !brandId || !branchId || !accessToken) return;
    let active = true;
    async function load() {
      try {
        const next = await fetchBranchTeamDetail(brandId!, branchId!, accessToken!);
        if (!active) return;
        setTeam(next);
        setTeamState("ready");
      } catch {
        if (!active) return;
        setTeamState("error");
      }
    }
    void load();
    return () => { active = false; };
  }, [accessToken, branchId, brandId, teamEnabled]);

  const acceptedMembers = useMemo(() => sortMembers(team?.members.accepted ?? []), [team]);
  const pendingMembers = useMemo(() => sortMembers(team?.members.pending ?? []), [team]);
  const archivedMembers = useMemo(
    () => sortMembers([...(team?.members.rejected ?? []), ...(team?.members.removed ?? [])]),
    [team],
  );

  useEffect(() => () => { if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current); }, []);

  function updateField<K extends keyof BranchDraft>(key: K, value: BranchDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addBreak() {
    setDraft((prev) => ({ ...prev, breaks: [...prev.breaks, { id: crypto.randomUUID(), start: "", end: "" }] }));
  }

  function removeBreak(index: number) {
    setDraft((prev) => ({ ...prev, breaks: prev.breaks.filter((_, i) => i !== index) }));
  }

  function updateBreak(index: number, field: "start" | "end", value: string) {
    setDraft((prev) => {
      const next = [...prev.breaks];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, breaks: next };
    });
  }

  function handleVisualChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (visualInputRef.current) visualInputRef.current.value = "";
    if (!file) return;
    setCropTarget({ file, aspectRatio: "1:1" });
  }

  function handleVisualCrop(croppedFile: File) {
    if (draft.photoPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(draft.photoPreviewUrl);
    setDraft((prev) => ({ ...prev, photoFile: croppedFile, photoPreviewUrl: URL.createObjectURL(croppedFile), photoRemoved: false }));
    setCropTarget(null);
  }

  function handleRemoveVisual() {
    if (draft.photoPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(draft.photoPreviewUrl);
    setDraft((prev) => ({ ...prev, photoFile: null, photoPreviewUrl: null, photoRemoved: true }));
  }

  function validate() {
    const errs: Partial<Record<string, string>> = {};
    if (!draft.name.trim()) errs.name = t.requiredMessage;
    if (!draft.address1.trim()) errs.address1 = t.requiredMessage;
    if (!draft.is_24_7) {
      if (!draft.opening?.trim()) errs.opening = t.openingRequiredMessage;
      else if (!isValidTime24(draft.opening)) errs.opening = "HH:mm";
      if (!draft.closing?.trim()) errs.closing = t.closingRequiredMessage;
      else if (!isValidTime24(draft.closing)) errs.closing = "HH:mm";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(draft);
    onOpenChange(false);
  }

  function handleClose() {
    setErrors({});
    onOpenChange(false);
  }

  function resolveTeamError(error: unknown, fallback: string) {
    if (isAxiosError(error)) {
      const msg = translateBackendErrorMessage(error.response?.data?.message, messages.backendErrors);
      if (msg) return msg;
    }
    return fallback;
  }

  async function handleRetryTeam() {
    setTeamFeedback(null);
    try {
      await refreshTeam({ showLoading: true });
    } catch (err) {
      setTeamState("error");
      setTeamFeedback({ tone: "error", message: resolveTeamError(err, t.branchTeamError) });
    }
  }

  async function handleInvite(user: UserSearchResult) {
    if (!brandId || !branchId || !accessToken) return;
    setInviteUserId(user.id);
    setTeamFeedback(null);
    try {
      await inviteBranchTeamMember(brandId, branchId, user.id, accessToken);
      await refreshTeam();
      setSearchInputValue(""); setSearchComboValue(""); setSearchItems([]); setSearchItemsMap(new Map()); setSelectedSearchTarget(null); setSearchState("idle");
      setTeamFeedback({ tone: "success", message: t.branchInviteSuccess });
    } catch (err) {
      setTeamFeedback({ tone: "error", message: resolveTeamError(err, t.branchTeamError) });
    } finally {
      setInviteUserId(null);
    }
  }

  function handleSearchInput(e: React.FormEvent<HTMLInputElement>) {
    const query = (e.target as HTMLInputElement).value.trim();
    setSearchInputValue(query);
    setSearchComboValue("");
    setSelectedSearchTarget(null);
    setTeamFeedback(null);
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    if (!teamEnabled || !team || !accessToken || query.length < 2) {
      setSearchItems([]); setSearchItemsMap(new Map()); setSearchState("idle"); return;
    }
    setSearchState("loading");
    const token = accessToken;
    const memberIds = new Set([...acceptedMembers, ...pendingMembers].map((m) => m.user_id));
    searchTimerRef.current = window.setTimeout(async () => {
      try {
        const results = await searchUsoUsers(query, token);
        const filtered = results.filter((u) => !memberIds.has(u.id) && u.id !== session.user?.id);
        setSearchItemsMap(new Map(filtered.map((u) => [u.id, u])));
        setSearchItems(filtered.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim(), description: u.email, keywords: [u.email ?? "", u.first_name, u.last_name] })));
        setSearchState("done");
      } catch {
        setSearchItems([]); setSearchItemsMap(new Map()); setSearchState("error");
      }
    }, 260);
  }

  function handleSearchValueChange(value: string | string[]) {
    const id = Array.isArray(value) ? value[0] : value;
    setSearchComboValue(id ?? "");
    setSelectedSearchTarget(searchItemsMap.get(id ?? "") ?? null);
    setTeamFeedback(null);
  }

  async function handleRemove(member: TeamWorkspaceMember) {
    if (!brandId || !branchId || !accessToken) return;
    setMemberActionId(member.membership_id); setTeamFeedback(null);
    try {
      await removeBranchTeamMember(brandId, branchId, member.membership_id, accessToken);
      await refreshTeam();
      setTeamFeedback({ tone: "success", message: t.branchMemberRemoveSuccess });
    } catch (err) {
      setTeamFeedback({ tone: "error", message: resolveTeamError(err, t.branchTeamError) });
    } finally {
      setMemberActionId(null);
    }
  }

  async function handleReinvite(member: TeamWorkspaceMember) {
    if (!brandId || !branchId || !accessToken) return;
    setMemberActionId(member.membership_id); setTeamFeedback(null);
    try {
      await inviteBranchTeamMember(brandId, branchId, member.user_id, accessToken);
      await refreshTeam();
      setTeamFeedback({ tone: "success", message: t.branchReinviteSuccess });
    } catch (err) {
      setTeamFeedback({ tone: "error", message: resolveTeamError(err, t.branchTeamError) });
    } finally {
      setMemberActionId(null);
    }
  }

  const isEditing = Boolean(initial?.id);
  const pageTitle = isEditing ? t.branchEditModalTitle : t.branchModalTitle;

  // Prefer new local blob → existing server cover
  const resolvedPhotoUrl =
    draft.photoPreviewUrl ??
    (draft.cover_url && !draft.photoRemoved ? proxyMediaUrl(draft.cover_url) : null);
  const hasPhoto = Boolean(resolvedPhotoUrl);
  const visualStyle = resolvedPhotoUrl ? { backgroundImage: `url(${resolvedPhotoUrl})` } : undefined;

  if (!open) return null;

  return (
    <>
      <div className={styles.page} aria-label={pageTitle}>
        <div className={styles.scrollArea}>
          <div className={styles.wrapper}>

            <PageSurfaceHeader
              title={pageTitle}
              subtitle={draft.name.trim() || undefined}
              onBack={handleClose}
              actions={
                <>
                <Button variant="outline" size="small" onClick={handleClose}>
                  {t.branchCancel}
                </Button>
                <Button variant="primary" size="small" onClick={handleSave}>
                  {t.branchSave}
                </Button>
                </>
              }
            />

            {/* ── Two-column shell — same as brand-form .desktopShell ── */}
            <div className={styles.form}>
              <div className={styles.desktopShell}>

                {/* ── Sidebar ── */}
                <div className={styles.sidebarStack}>

                  {/* Photo / preview section */}
                  <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionHeaderText}>
                        <h2 className={styles.sectionTitle}>{t.branchVisualTitle}</h2>
                        <p className={styles.sectionHint}>{t.branchVisualDescription}</p>
                      </div>
                      <span
                        className={styles.photoBadge}
                        data-ready={hasPhoto ? "true" : "false"}
                      >
                        {hasPhoto ? t.branchVisualReady : t.branchVisualEmpty}
                      </span>
                    </div>

                    {/* Preview visual */}
                    <div className={styles.previewVisual} style={visualStyle}>
                      {hasPhoto ? (
                        <div className={styles.previewVisualOverlay}>
                          <strong className={styles.previewVisualName}>
                            {draft.name.trim() || t.branchFieldNamePlaceholder}
                          </strong>
                        </div>
                      ) : (
                        <div className={styles.previewVisualDefault}>
                          <div className={styles.previewDefaultIcon}>
                            <Icon icon="account_tree" size={20} color="current" />
                          </div>
                          <div className={styles.previewDefaultMeta}>
                            <strong className={styles.previewDefaultName}>
                              {draft.name.trim() || t.branchFieldNamePlaceholder}
                            </strong>
                            {draft.address1.trim() ? (
                              <span className={styles.previewDefaultAddr}>{draft.address1.trim()}</span>
                            ) : null}
                            <span className={styles.previewDefaultHint}>{t.branchVisualEmpty}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <input ref={visualInputRef} type="file" accept="image/*" hidden onChange={handleVisualChange} />
                    <div className={styles.photoActions}>
                      <Button
                        variant="outline"
                        size="small"
                        icon={hasPhoto ? "edit" : "add_photo_alternate"}
                        onClick={() => visualInputRef.current?.click()}
                      >
                        {hasPhoto ? t.branchVisualReplace : t.branchVisualAdd}
                      </Button>
                      {hasPhoto ? (
                        <Button variant="ghost" size="small" icon="delete" onClick={handleRemoveVisual}>
                          {t.branchVisualRemove}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                </div>

                {/* ── Main stack ── */}
                <div className={styles.mainStack}>

                  {/* Section 1: Basic info */}
                  <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.stepBadge}>1</span>
                      <div className={styles.sectionHeaderText}>
                        <h2 className={styles.sectionTitle}>{t.basicInfoSection}</h2>
                        <p className={styles.sectionHint}>
                          {isEditing ? t.branchSubtitleEdit : t.branchSubtitleNew}
                        </p>
                      </div>
                    </div>

                    <div className={styles.fieldRow}>
                      <Field>
                        <FieldLabel required>{t.branchFieldName}</FieldLabel>
                        <Input
                          autoFocus
                          value={draft.name}
                          placeholder={t.branchFieldNamePlaceholder}
                          aria-invalid={Boolean(errors.name)}
                          onChange={(e) => updateField("name", e.target.value)}
                        />
                        {errors.name ? <p className={styles.fieldError}>{errors.name}</p> : null}
                      </Field>
                    </div>

                    <div className={styles.fieldRow}>
                      <Field>
                        <FieldLabel>{t.branchFieldDescription}</FieldLabel>
                        <RichTextEditor
                          value={draft.description ?? ""}
                          placeholder={t.branchFieldDescriptionPlaceholder}
                          onChange={(html) => updateField("description", html)}
                        />
                      </Field>
                    </div>

                    <div className={styles.fieldGrid2}>
                      <Field>
                        <FieldLabel required>{t.branchFieldAddress1}</FieldLabel>
                        <Input
                          value={draft.address1}
                          placeholder={t.branchFieldAddress1Placeholder}
                          aria-invalid={Boolean(errors.address1)}
                          onChange={(e) => updateField("address1", e.target.value)}
                        />
                        {errors.address1 ? <p className={styles.fieldError}>{errors.address1}</p> : null}
                      </Field>
                      <Field>
                        <FieldLabel>{t.branchFieldAddress2}</FieldLabel>
                        <Input
                          value={draft.address2 ?? ""}
                          placeholder={t.branchFieldAddress2Placeholder}
                          onChange={(e) => updateField("address2", e.target.value)}
                        />
                      </Field>
                    </div>

                    <div className={styles.fieldGrid2}>
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
                  </div>

                  {/* Section 2: Availability */}
                  <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.stepBadge}>2</span>
                      <div className={styles.sectionHeaderText}>
                        <h2 className={styles.sectionTitle}>{t.branchAvailabilitySection}</h2>
                        <p className={styles.sectionHint}>{t.detailTableAvailability}</p>
                      </div>
                    </div>

                    <div className={styles.switchRow}>
                      <div className={styles.switchMeta}>
                        <span className={styles.switchLabel}>{t.branchField247}</span>
                        <p className={styles.switchHint}>{t.detailTableAvailability}</p>
                      </div>
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

                    {!draft.is_24_7 ? (
                      <>
                        <div className={styles.fieldGrid2}>
                          <Field>
                            <FieldLabel required>{t.branchFieldOpening}</FieldLabel>
                            <TimeInput
                              value={draft.opening ?? ""}
                              placeholder="09:00"
                              aria-invalid={Boolean(errors.opening)}
                              onChange={(value) => updateField("opening", value)}
                            />
                            {errors.opening ? <p className={styles.fieldError}>{errors.opening}</p> : null}
                          </Field>
                          <Field>
                            <FieldLabel required>{t.branchFieldClosing}</FieldLabel>
                            <TimeInput
                              value={draft.closing ?? ""}
                              placeholder="18:00"
                              aria-invalid={Boolean(errors.closing)}
                              onChange={(value) => updateField("closing", value)}
                            />
                            {errors.closing ? <p className={styles.fieldError}>{errors.closing}</p> : null}
                          </Field>
                        </div>

                        <div className={styles.breaksBlock}>
                          <div className={styles.breaksHeader}>
                            <p className={styles.breaksLabel}>{t.branchFieldBreaks}</p>
                            <Button variant="outline" size="small" icon="add" onClick={addBreak}>
                              {t.branchAddBreak}
                            </Button>
                          </div>
                          {draft.breaks.map((br, index) => (
                            <div key={br.id ?? index} className={styles.breakRow}>
                              <Field>
                                <FieldLabel>{t.branchFieldOpening}</FieldLabel>
                                <TimeInput value={br.start} placeholder="12:00"
                                  onChange={(value) => updateBreak(index, "start", value)} />
                              </Field>
                              <Field>
                                <FieldLabel>{t.branchFieldClosing}</FieldLabel>
                                <TimeInput value={br.end} placeholder="13:00"
                                  onChange={(value) => updateBreak(index, "end", value)} />
                              </Field>
                              <Button variant="unstyled" type="button" className={styles.removeBreakBtn}
                                aria-label={t.branchRemoveBreak} onClick={() => removeBreak(index)}>
                                <Icon icon="delete" size={15} color="current" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Section 3: Team */}
                  <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.stepBadge}>3</span>
                      <div className={styles.sectionHeaderText}>
                        <h2 className={styles.sectionTitle}>{t.branchTeamTitle}</h2>
                        <p className={styles.sectionHint}>{t.branchTeamDescription}</p>
                      </div>
                    </div>

                    {!teamEnabled ? (
                      <div className={styles.teamLocked}>
                        <div className={styles.teamLockedIcon}>
                          <Icon icon="lock" size={14} color="current" />
                        </div>
                        <div className={styles.teamLockedText}>
                          <strong>{t.branchTeamLockedTitle}</strong>
                          <p>{t.branchTeamLockedBody}</p>
                        </div>
                      </div>
                    ) : teamState === "loading" ? (
                      <div className={styles.stateCard}>
                        <span>{t.branchTeamLoading}</span>
                      </div>
                    ) : teamState === "error" ? (
                      <div className={styles.stateCard}>
                        <span>{t.branchTeamError}</span>
                        <Button variant="outline" size="small" icon="refresh"
                          onClick={() => { void handleRetryTeam(); }}>
                          {t.branchTeamRetry}
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.teamPanel}>
                        {/* Search / invite */}
                        <div className={styles.inviteBlock}>
                          <Field>
                            <FieldLabel>{t.branchSearchLabel}</FieldLabel>
                            <Combobox
                              items={searchItems}
                              value={searchComboValue}
                              placeholder={t.branchSearchPlaceholder}
                              emptyMessage={
                                searchState === "loading" ? t.branchSearchLoading
                                  : searchState === "error" ? t.branchTeamError
                                    : searchInputValue.length >= 2 ? t.branchSearchEmpty
                                      : t.branchSearchHint
                              }
                              onValueChange={handleSearchValueChange}
                              onInput={handleSearchInput}
                              renderItem={(item) => {
                                const user = searchItemsMap.get(item.value);
                                const avatarUrl = proxyMediaUrl(user?.avatar_url);
                                return (
                                  <div className={styles.memberIdentity}>
                                    <div className={styles.avatar}
                                      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                                      data-has-image={avatarUrl ? "true" : "false"}>
                                      {!avatarUrl && user ? getInitials({ first_name: user.first_name, last_name: user.last_name } as TeamWorkspaceMember) : null}
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

                          {!selectedSearchTarget ? (
                            <p className={styles.searchState}>
                              {searchState === "loading" ? t.branchSearchLoading
                                : searchState === "error" ? t.branchTeamError
                                  : searchInputValue.length < 2 ? t.branchSearchIdle
                                    : searchItems.length === 0 ? t.branchSearchEmpty
                                      : t.branchSearchReady}
                            </p>
                          ) : null}

                          {selectedSearchTarget ? (
                            <div className={styles.selectedUser}>
                              <div className={styles.memberIdentity}>
                                <div className={styles.avatar}
                                  style={proxyMediaUrl(selectedSearchTarget.avatar_url) ? { backgroundImage: `url(${proxyMediaUrl(selectedSearchTarget.avatar_url)})` } : undefined}
                                  data-has-image={proxyMediaUrl(selectedSearchTarget.avatar_url) ? "true" : "false"}>
                                  {!proxyMediaUrl(selectedSearchTarget.avatar_url)
                                    ? getInitials({ first_name: selectedSearchTarget.first_name, last_name: selectedSearchTarget.last_name } as TeamWorkspaceMember) : null}
                                </div>
                                <div className={styles.memberMeta}>
                                  <strong>{`${selectedSearchTarget.first_name} ${selectedSearchTarget.last_name}`.trim()}</strong>
                                  <span>{selectedSearchTarget.email}</span>
                                </div>
                              </div>
                              <Button variant="primary" size="small" icon="person_add"
                                isLoading={inviteUserId === selectedSearchTarget.id}
                                onClick={() => { void handleInvite(selectedSearchTarget); }}>
                                {t.branchInvite}
                              </Button>
                            </div>
                          ) : null}

                          {teamFeedback ? (
                            <StatusBanner variant={teamFeedback.tone === "success" ? "success" : "error"}>
                              {teamFeedback.message}
                            </StatusBanner>
                          ) : null}
                        </div>

                        {/* Member groups */}
                        <div className={styles.memberGroups}>
                          {/* Accepted */}
                          <div className={styles.memberGroup}>
                            <div className={styles.memberGroupHeader}>
                              <h4 className={styles.memberGroupTitle}>{t.branchAcceptedTitle}</h4>
                              <span className={styles.memberGroupCount}>{acceptedMembers.length}</span>
                            </div>
                            {acceptedMembers.length === 0 ? (
                              <p className={styles.emptyNote}>{t.branchNoAccepted}</p>
                            ) : (
                              <div className={styles.memberList}>
                                {acceptedMembers.map((member) => {
                                  const avatarUrl = proxyMediaUrl(member.avatar_url);
                                  return (
                                    <article key={member.membership_id} className={styles.memberRow}>
                                      <div className={styles.memberIdentity}>
                                        <div className={styles.avatar}
                                          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                                          data-has-image={avatarUrl ? "true" : "false"}>
                                          {!avatarUrl ? getInitials(member) : null}
                                        </div>
                                        <div className={styles.memberMeta}>
                                          <strong>{formatMemberName(member)}</strong>
                                          <span>{member.email}</span>
                                        </div>
                                      </div>
                                      <div className={styles.memberRowEnd}>
                                        <span className={styles.roleBadge}>
                                          {member.role === "OWNER" ? t.branchOwnerRole : t.branchMemberRole}
                                        </span>
                                        {member.role !== "OWNER" ? (
                                          <Button variant="ghost" size="small" icon="person_remove"
                                            isLoading={memberActionId === member.membership_id}
                                            onClick={() => { void handleRemove(member); }}>
                                            {t.branchMemberRemove}
                                          </Button>
                                        ) : null}
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Pending */}
                          <div className={styles.memberGroup}>
                            <div className={styles.memberGroupHeader}>
                              <h4 className={styles.memberGroupTitle}>{t.branchPendingTitle}</h4>
                              <span className={styles.memberGroupCount}>{pendingMembers.length}</span>
                            </div>
                            {pendingMembers.length === 0 ? (
                              <p className={styles.emptyNote}>{t.branchNoPending}</p>
                            ) : (
                              <div className={styles.memberList}>
                                {pendingMembers.map((member) => {
                                  const avatarUrl = proxyMediaUrl(member.avatar_url);
                                  return (
                                    <article key={member.membership_id} className={styles.memberRow}>
                                      <div className={styles.memberIdentity}>
                                        <div className={styles.avatar}
                                          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                                          data-has-image={avatarUrl ? "true" : "false"}>
                                          {!avatarUrl ? getInitials(member) : null}
                                        </div>
                                        <div className={styles.memberMeta}>
                                          <strong>{formatMemberName(member)}</strong>
                                          <span>{member.email}</span>
                                        </div>
                                      </div>
                                      <div className={styles.memberRowEnd}>
                                        <span className={styles.pendingBadge}>{t.branchPendingStatus}</span>
                                        <Button variant="ghost" size="small" icon="close"
                                          isLoading={memberActionId === member.membership_id}
                                          onClick={() => { void handleRemove(member); }}>
                                          {t.branchCancelInvite}
                                        </Button>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Archived */}
                          {archivedMembers.length > 0 ? (
                            <div className={styles.memberGroup}>
                              <div className={styles.memberGroupHeader}>
                                <h4 className={styles.memberGroupTitle}>{t.branchArchiveTitle}</h4>
                                <span className={styles.memberGroupCount}>{archivedMembers.length}</span>
                              </div>
                              <div className={styles.memberList}>
                                {archivedMembers.map((member) => {
                                  const avatarUrl = proxyMediaUrl(member.avatar_url);
                                  return (
                                    <article key={member.membership_id} className={styles.memberRow}>
                                      <div className={styles.memberIdentity}>
                                        <div className={styles.avatar}
                                          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                                          data-has-image={avatarUrl ? "true" : "false"}>
                                          {!avatarUrl ? getInitials(member) : null}
                                        </div>
                                        <div className={styles.memberMeta}>
                                          <strong>{formatMemberName(member)}</strong>
                                          <span>{member.email}</span>
                                        </div>
                                      </div>
                                      <div className={styles.memberRowEnd}>
                                        <span className={styles.archivedBadge}>
                                          {getMemberStatusLabel(member.status, t)}
                                        </span>
                                        <Button variant="ghost" size="small" icon="refresh"
                                          isLoading={memberActionId === member.membership_id}
                                          onClick={() => { void handleReinvite(member); }}>
                                          {t.branchReinvite}
                                        </Button>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile footer */}
                  <div className={styles.mobileFooter}>
                    <FormFooter>
                      <Button variant="outline" onClick={handleClose}>
                        {t.branchCancel}
                      </Button>
                      <FormFooterSpacer />
                      <Button variant="primary" onClick={handleSave}>
                        {t.branchSave}
                      </Button>
                    </FormFooter>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {cropTarget ? (
        <AvatarCropDialog
          file={cropTarget.file}
          aspectRatio={cropTarget.aspectRatio}
          open={true}
          onConfirm={handleVisualCrop}
          onClose={() => setCropTarget(null)}
        />
      ) : null}
    </>
  );
}
