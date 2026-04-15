"use client";

import { isAxiosError } from "axios";
import {
  startTransition,
  useDeferredValue,
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
import {
  Field,
  FieldDescription,
  FieldLabel,
  Input,
} from "@/components/atoms/input";
import { Switch } from "@/components/atoms/switch";
import { Icon } from "@/components/icon";
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

type StudioCopy = {
  subtitleNew: string;
  subtitleEdit: string;
  visualTitle: string;
  visualDescription: string;
  visualPendingTitle: string;
  visualPendingBody: string;
  visualPromptHint: string;
  visualAddAction: string;
  visualReplaceAction: string;
  visualRemoveAction: string;
  visualFrontendOnly: string;
  visualReadyBadge: string;
  visualEmptyBadge: string;
  teamTitle: string;
  teamDescription: string;
  teamUnlockedTitle: string;
  teamUnlockedBody: string;
  teamLoading: string;
  teamError: string;
  retryTeam: string;
  searchLabel: string;
  searchHint: string;
  searchPlaceholder: string;
  searchIdle: string;
  searchLoading: string;
  searchReady: string;
  searchEmpty: string;
  inviteAction: string;
  inviteSuccess: string;
  removeAction: string;
  removeSuccess: string;
  reinviteAction: string;
  reinviteSuccess: string;
  cancelInviteAction: string;
  acceptedTitle: string;
  pendingTitle: string;
  archiveTitle: string;
  noAccepted: string;
  noPending: string;
  noArchive: string;
  ownerRole: string;
  memberRole: string;
  pendingStatus: string;
  rejectedStatus: string;
  removedStatus: string;
  branchIdentityTitle: string;
  teamCreatedAfterSave: string;
  coverPlannedBadge: string;
  teamLiveBadge: string;
};

const EN_COPY: StudioCopy = {
  subtitleNew:
    "Create the branch foundation first, then attach the future media and team layer.",
  subtitleEdit:
    "Edit this branch as an operational unit with its own visual identity and team logic.",
  visualTitle: "Branch visual identity",
  visualDescription:
    "Each branch now supports its own dedicated cover photo, separate from the brand shell.",
  visualPendingTitle: "Add a branch cover",
  visualPendingBody:
    "Upload a 16:9 cover to make this branch feel like its own operational space.",
  visualPromptHint:
    "Covers are now saved to the backend with `branch_cover` media usage.",
  visualAddAction: "Add branch photo",
  visualReplaceAction: "Replace photo",
  visualRemoveAction: "Remove photo",
  visualFrontendOnly:
    "This cover will persist with the branch. Removing it sends `cover_media_id: null` to the backend.",
  visualReadyBadge: "Cover ready",
  visualEmptyBadge: "No cover yet",
  teamTitle: "Branch team",
  teamDescription:
    "Team ownership belongs to the branch itself. Invite and manage USO members directly from this modal.",
  teamUnlockedTitle: "Team activates after the branch exists",
  teamUnlockedBody:
    "Save the branch first. The brand owner becomes the default team owner automatically, then you can invite other USO users.",
  teamLoading: "Loading branch team...",
  teamError: "Branch team could not be loaded.",
  retryTeam: "Retry team",
  searchLabel: "Find a service owner",
  searchHint:
    "Search by name, email, or phone. Accepted and pending members are hidden from the results.",
  searchPlaceholder: "Search by name, email, or phone",
  searchIdle: "Start typing to search USO users.",
  searchLoading: "Searching users...",
  searchReady: "Choose a user to send a branch invitation.",
  searchEmpty: "No matching users found for this branch.",
  inviteAction: "Invite to branch",
  inviteSuccess: "Invitation sent to the branch team.",
  removeAction: "Remove from branch",
  removeSuccess: "Branch team membership updated.",
  reinviteAction: "Re-invite",
  reinviteSuccess: "Invitation sent again.",
  cancelInviteAction: "Cancel invite",
  acceptedTitle: "Accepted team",
  pendingTitle: "Pending invitations",
  archiveTitle: "Archived states",
  noAccepted: "Only the owner is attached right now.",
  noPending: "No pending invitations yet.",
  noArchive: "Rejected and removed members will appear here.",
  ownerRole: "Owner",
  memberRole: "Member",
  pendingStatus: "Pending",
  rejectedStatus: "Rejected",
  removedStatus: "Removed",
  branchIdentityTitle: "Branch identity",
  teamCreatedAfterSave: "Team is created automatically after the branch is saved.",
  coverPlannedBadge: "Media next",
  teamLiveBadge: "Team live",
};

const TR_COPY: StudioCopy = {
  subtitleNew:
    "Önce şube temelini kur, sonra gelecekteki medya ve takım katmanını bunun üstüne ekle.",
  subtitleEdit:
    "Bu şubeyi artık kendi görsel kimliği ve takım mantığı olan operasyonel bir birim gibi düzenle.",
  visualTitle: "Şube görsel kimliği",
  visualDescription:
    "Her şube artık brand kabuğundan ayrı kendi cover fotoğrafını taşıyabiliyor.",
  visualPendingTitle: "Şube kapağı ekle",
  visualPendingBody:
    "Bu şubeyi kendi operasyon alanı gibi hissettirmek için 16:9 bir kapak yükle.",
  visualPromptHint:
    "Kapaklar artık backend'e `branch_cover` media usage ile kaydoluyor.",
  visualAddAction: "Şube fotoğrafı ekle",
  visualReplaceAction: "Fotoğrafı değiştir",
  visualRemoveAction: "Fotoğrafı kaldır",
  visualFrontendOnly:
    "Bu kapak artık branch ile birlikte kalıcı olarak saklanır. Kaldırmak backend'e `cover_media_id: null` gönderir.",
  visualReadyBadge: "Kapak hazır",
  visualEmptyBadge: "Henüz kapak yok",
  teamTitle: "Şube takımı",
  teamDescription:
    "Takım sahipliği doğrudan şubeye aittir. USO kullanıcılarını buradan davet edip yönetebilirsin.",
  teamUnlockedTitle: "Takım, branch kaydedildikten sonra aktif olur",
  teamUnlockedBody:
    "Önce branch'i kaydet. Brand owner otomatik olarak varsayılan takım sahibi olur, sonra diğer USO kullanıcılarını davet edebilirsin.",
  teamLoading: "Şube takımı yükleniyor...",
  teamError: "Şube takımı yüklenemedi.",
  retryTeam: "Takımı yenile",
  searchLabel: "Bir service owner bul",
  searchHint:
    "İsim, email veya telefonla ara. Kabul edilmiş ve bekleyen üyeler sonuçlarda gizlenir.",
  searchPlaceholder: "İsim, email veya telefon ara",
  searchIdle: "USO aramak için yazmaya başla.",
  searchLoading: "Kullanıcılar aranıyor...",
  searchReady: "Şubeye davet göndermek için bir kullanıcı seç.",
  searchEmpty: "Bu şube için eşleşen kullanıcı bulunamadı.",
  inviteAction: "Şubeye davet et",
  inviteSuccess: "Şube takımına davet gönderildi.",
  removeAction: "Şubeden çıkar",
  removeSuccess: "Şube takım üyeliği güncellendi.",
  reinviteAction: "Yeniden davet et",
  reinviteSuccess: "Davet yeniden gönderildi.",
  cancelInviteAction: "Daveti iptal et",
  acceptedTitle: "Kabul edilen takım",
  pendingTitle: "Bekleyen davetler",
  archiveTitle: "Arşiv durumları",
  noAccepted: "Şu anda yalnızca owner bağlı.",
  noPending: "Henüz bekleyen davet yok.",
  noArchive: "Reddedilen ve kaldırılan üyeler burada görünür.",
  ownerRole: "Sahip",
  memberRole: "Üye",
  pendingStatus: "Beklemede",
  rejectedStatus: "Reddedildi",
  removedStatus: "Kaldırıldı",
  branchIdentityTitle: "Şube kimliği",
  teamCreatedAfterSave: "Takım, branch kaydedildikten sonra otomatik oluşturulur.",
  coverPlannedBadge: "Medya sıradaki",
  teamLiveBadge: "Takım aktif",
};

const AZ_COPY: StudioCopy = {
  subtitleNew:
    "Əvvəl filialın əsasını qur, sonra gələcək media və komanda qatını bunun üzərinə əlavə et.",
  subtitleEdit:
    "Bu filialı artıq öz vizual kimliyi və komanda məntiqi olan əməliyyat vahidi kimi redaktə et.",
  visualTitle: "Filial vizual kimliyi",
  visualDescription:
    "Hər filial artıq brand qabığından ayrı öz cover fotosuna sahib ola bilir.",
  visualPendingTitle: "Filial cover-i əlavə et",
  visualPendingBody:
    "Bu filialı ayrıca əməliyyat sahəsi kimi göstərmək üçün 16:9 cover yüklə.",
  visualPromptHint:
    "Cover-lər artıq backend-ə `branch_cover` media usage ilə yazılır.",
  visualAddAction: "Filial fotosu əlavə et",
  visualReplaceAction: "Fotonu dəyiş",
  visualRemoveAction: "Fotonu sil",
  visualFrontendOnly:
    "Bu cover artıq filial ilə birlikdə daimi saxlanır. Silmək backend-ə `cover_media_id: null` göndərir.",
  visualReadyBadge: "Cover hazırdır",
  visualEmptyBadge: "Hələ cover yoxdur",
  teamTitle: "Filial komandası",
  teamDescription:
    "Komanda sahibliyi birbaşa filiala aiddir. USO istifadəçilərini buradan dəvət edib idarə edə bilərsən.",
  teamUnlockedTitle: "Komanda filial save olunduqdan sonra aktiv olur",
  teamUnlockedBody:
    "Əvvəl filialı save et. Brand owner avtomatik olaraq default komanda sahibi olacaq, sonra digər USO istifadəçilərini dəvət edə bilərsən.",
  teamLoading: "Filial komandası yüklənir...",
  teamError: "Filial komandası yüklənmədi.",
  retryTeam: "Komandanı yenilə",
  searchLabel: "Bir service owner tap",
  searchHint:
    "Ad, email və ya telefon ilə axtar. Qəbul olunmuş və gözləyən üzvlər nəticələrdə gizlənir.",
  searchPlaceholder: "Ad, email və ya telefon axtar",
  searchIdle: "USO axtarmaq üçün yazmağa başla.",
  searchLoading: "İstifadəçilər axtarılır...",
  searchReady: "Filiala dəvət göndərmək üçün bir istifadəçi seç.",
  searchEmpty: "Bu filial üçün uyğun istifadəçi tapılmadı.",
  inviteAction: "Filiala dəvət et",
  inviteSuccess: "Filial komandasına dəvət göndərildi.",
  removeAction: "Filialdan çıxar",
  removeSuccess: "Filial komanda üzvlüyü yeniləndi.",
  reinviteAction: "Yenidən dəvət et",
  reinviteSuccess: "Dəvət yenidən göndərildi.",
  cancelInviteAction: "Dəvəti ləğv et",
  acceptedTitle: "Qəbul olunmuş komanda",
  pendingTitle: "Gözləyən dəvətlər",
  archiveTitle: "Arxiv vəziyyətləri",
  noAccepted: "Hazırda yalnız owner qoşulub.",
  noPending: "Hələ gözləyən dəvət yoxdur.",
  noArchive: "Rədd olunan və silinən üzvlər burada görünür.",
  ownerRole: "Sahib",
  memberRole: "Üzv",
  pendingStatus: "Gözləyir",
  rejectedStatus: "Rədd edildi",
  removedStatus: "Silindi",
  branchIdentityTitle: "Filial kimliyi",
  teamCreatedAfterSave: "Komanda filial save olunduqdan sonra avtomatik yaradılır.",
  coverPlannedBadge: "Media növbəti",
  teamLiveBadge: "Komanda aktivdir",
};

function getCopy(locale: string) {
  if (locale.startsWith("az")) return AZ_COPY;
  if (locale.startsWith("tr")) return TR_COPY;
  return EN_COPY;
}

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
  copy: StudioCopy,
) {
  if (status === "PENDING") return copy.pendingStatus;
  if (status === "REJECTED") return copy.rejectedStatus;
  if (status === "REMOVED") return copy.removedStatus;
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
  const { locale, messages } = useLocale();
  const t = messages.brands;
  const copy = useMemo(() => getCopy(locale), [locale]);
  const session = useAppSelector(selectAuthSession);
  const accessToken = session.accessToken;
  const visualInputRef = useRef<HTMLInputElement>(null);
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
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery.trim());
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
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
    setSearchQuery("");
    setSearchResults([]);
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

  useEffect(() => {
    if (!teamEnabled || deferredQuery.length < 2 || !team || !accessToken) {
      return;
    }

    const resolvedAccessToken: string = accessToken;

    let active = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const memberIds = new Set(
          [...acceptedMembers, ...pendingMembers].map((member) => member.user_id),
        );
        const results = await searchUsoUsers(deferredQuery, resolvedAccessToken);

        if (!active) {
          return;
        }

        startTransition(() => {
          setSearchResults(
            results.filter(
              (user) =>
                !memberIds.has(user.id) && user.id !== session.user?.id,
            ),
          );
          setSearchState("done");
        });
      } catch {
        if (!active) {
          return;
        }

        setSearchResults([]);
        setSearchState("error");
      }
    }, 260);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [
    acceptedMembers,
    accessToken,
    deferredQuery,
    pendingMembers,
    session.user?.id,
    team,
    teamEnabled,
  ]);

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
    if (!file) return;

    if (draft.photoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(draft.photoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setDraft((prev) => ({
      ...prev,
      photoFile: file,
      photoPreviewUrl: previewUrl,
      photoRemoved: false,
    }));

    if (visualInputRef.current) {
      visualInputRef.current.value = "";
    }
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
      }

      if (!draft.closing?.trim()) {
        nextErrors.closing = t.closingRequiredMessage;
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
        message: resolveTeamError(error, copy.teamError),
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
      setSearchQuery("");
      setSearchResults([]);
      setSearchState("idle");
      setTeamFeedback({ tone: "success", message: copy.inviteSuccess });
    } catch (error) {
      setTeamFeedback({
        tone: "error",
        message: resolveTeamError(error, copy.teamError),
      });
    } finally {
      setInviteUserId(null);
    }
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
      setTeamFeedback({ tone: "success", message: copy.removeSuccess });
    } catch (error) {
      setTeamFeedback({
        tone: "error",
        message: resolveTeamError(error, copy.teamError),
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
      setTeamFeedback({ tone: "success", message: copy.reinviteSuccess });
    } catch (error) {
      setTeamFeedback({
        tone: "error",
        message: resolveTeamError(error, copy.teamError),
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
                {isEditing ? copy.subtitleEdit : copy.subtitleNew}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className={styles.body}>
          <section className={styles.stageGrid}>
            <article className={styles.stageCard}>
              <div className={styles.stageCardHeader}>
                <div>
                  <h3 className={styles.stageTitle}>{copy.branchIdentityTitle}</h3>
                  <p className={styles.stageLead}>
                    {draft.name.trim() || t.branchFieldNamePlaceholder}
                  </p>
                </div>
                <span className={styles.stageBadge}>
                  {draft.photoPreviewUrl
                    ? copy.visualReadyBadge
                    : teamEnabled
                      ? copy.teamLiveBadge
                      : copy.coverPlannedBadge}
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
                  <h3 className={styles.stageTitle}>{copy.visualTitle}</h3>
                  <p className={styles.stageLead}>{copy.visualDescription}</p>
                </div>
                <span className={styles.stageBadge}>
                  {draft.photoPreviewUrl
                    ? copy.visualReadyBadge
                    : copy.visualEmptyBadge}
                </span>
              </div>

              <div className={styles.visualFrame} style={visualStyle}>
                {draft.photoPreviewUrl ? (
                  <div className={styles.visualOverlay}>
                    <strong>{draft.name.trim() || t.branchFieldNamePlaceholder}</strong>
                    <span>{copy.visualReadyBadge}</span>
                  </div>
                ) : (
                  <div className={styles.visualEmpty}>
                    <div className={styles.visualEmptyIcon}>
                      <Icon icon="sell" size={22} color="current" />
                    </div>
                    <div className={styles.visualEmptyText}>
                      <strong>{copy.visualPendingTitle}</strong>
                      <p>{copy.visualPendingBody}</p>
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
                    ? copy.visualReplaceAction
                    : copy.visualAddAction}
                </Button>
                {draft.photoPreviewUrl ? (
                  <Button
                    variant="ghost"
                    size="small"
                    icon="delete"
                    onClick={handleRemoveVisual}
                  >
                    {copy.visualRemoveAction}
                  </Button>
                ) : null}
              </div>

              <p className={styles.visualNote}>{copy.visualPromptHint}</p>
              <p className={styles.visualFrontendOnly}>
                {copy.visualFrontendOnly}
              </p>
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
                <Input
                  value={draft.description ?? ""}
                  placeholder={t.branchFieldDescriptionPlaceholder}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
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
                      <Input
                        type="text"
                        value={draft.opening ?? ""}
                        placeholder="09:00"
                        maxLength={5}
                        aria-invalid={Boolean(errors.opening)}
                        onChange={(event) =>
                          updateField("opening", event.target.value)
                        }
                      />
                      {errors.opening ? (
                        <p className={styles.errorText}>{errors.opening}</p>
                      ) : null}
                    </Field>

                    <Field>
                      <FieldLabel required>{t.branchFieldClosing}</FieldLabel>
                      <Input
                        type="text"
                        value={draft.closing ?? ""}
                        placeholder="18:00"
                        maxLength={5}
                        aria-invalid={Boolean(errors.closing)}
                        onChange={(event) =>
                          updateField("closing", event.target.value)
                        }
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
                          <FieldLabel>Start</FieldLabel>
                          <Input
                            type="text"
                            value={branchBreak.start}
                            placeholder="12:00"
                            maxLength={5}
                            onChange={(event) =>
                              updateBreak(index, "start", event.target.value)
                            }
                          />
                        </Field>
                        <Field>
                          <FieldLabel>End</FieldLabel>
                          <Input
                            type="text"
                            value={branchBreak.end}
                            placeholder="13:00"
                            maxLength={5}
                            onChange={(event) =>
                              updateBreak(index, "end", event.target.value)
                            }
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
                </>
              ) : null}
            </div>
          </section>

          <section className={styles.teamSection}>
            <div className={styles.formSectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>{copy.teamTitle}</h3>
                <p className={styles.sectionLead}>{copy.teamDescription}</p>
              </div>
              <span className={styles.stageBadge}>{copy.teamLiveBadge}</span>
            </div>

            {!teamEnabled ? (
              <div className={styles.teamLocked}>
                <div className={styles.teamLockedIcon}>
                  <Icon icon="groups" size={18} color="current" />
                </div>
                <div className={styles.teamLockedText}>
                  <strong>{copy.teamUnlockedTitle}</strong>
                  <p>{copy.teamUnlockedBody}</p>
                  <span>{copy.teamCreatedAfterSave}</span>
                </div>
              </div>
            ) : teamState === "loading" ? (
              <div className={styles.teamStateCard}>{copy.teamLoading}</div>
            ) : teamState === "error" ? (
              <div className={styles.teamStateCard}>
                <strong>{copy.teamError}</strong>
                <Button
                  variant="outline"
                  size="small"
                  icon="refresh"
                  onClick={() => {
                    void handleRetryTeam();
                  }}
                >
                  {copy.retryTeam}
                </Button>
              </div>
            ) : (
              <div className={styles.teamPanel}>
                <Field>
                  <FieldLabel>{copy.searchLabel}</FieldLabel>
                  <Input
                    value={searchQuery}
                    placeholder={copy.searchPlaceholder}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSearchQuery(nextValue);
                      if (nextValue.trim().length < 2) {
                        setSearchResults([]);
                        setSearchState("idle");
                      } else {
                        setSearchState("loading");
                      }
                      setTeamFeedback(null);
                    }}
                  />
                  <FieldDescription>{copy.searchHint}</FieldDescription>
                </Field>

                {teamFeedback ? (
                  <div
                    className={`${styles.feedback} ${
                      teamFeedback.tone === "success"
                        ? styles.feedbackSuccess
                        : styles.feedbackError
                    }`}
                  >
                    {teamFeedback.message}
                  </div>
                ) : null}

                <div className={styles.searchState}>
                  {searchState === "loading"
                    ? copy.searchLoading
                    : searchState === "error"
                      ? copy.teamError
                      : deferredQuery.length < 2
                        ? copy.searchIdle
                        : searchResults.length === 0
                          ? copy.searchEmpty
                          : copy.searchReady}
                </div>

                {searchResults.length > 0 ? (
                  <div className={styles.searchList}>
                    {searchResults.map((result) => {
                      const avatarUrl = proxyMediaUrl(result.avatar_url);

                      return (
                        <article key={result.id} className={styles.memberCard}>
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
                              {!avatarUrl
                                ? getInitials({
                                    first_name: result.first_name,
                                    last_name: result.last_name,
                                  } as TeamWorkspaceMember)
                                : null}
                            </div>
                            <div className={styles.memberMeta}>
                              <strong>
                                {`${result.first_name} ${result.last_name}`.trim()}
                              </strong>
                              <span>{result.email}</span>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="small"
                            icon="add"
                            isLoading={inviteUserId === result.id}
                            onClick={() => {
                              void handleInvite(result);
                            }}
                          >
                            {copy.inviteAction}
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                ) : null}

                <div className={styles.teamGroups}>
                  <div className={styles.teamGroup}>
                    <h4>{copy.acceptedTitle}</h4>
                    {acceptedMembers.length === 0 ? (
                      <div className={styles.emptyCard}>{copy.noAccepted}</div>
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
                                    ? copy.ownerRole
                                    : copy.memberRole}
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
                                  {copy.removeAction}
                                </Button>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.teamGroup}>
                    <h4>{copy.pendingTitle}</h4>
                    {pendingMembers.length === 0 ? (
                      <div className={styles.emptyCard}>{copy.noPending}</div>
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
                                  {copy.pendingStatus}
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
                                {copy.cancelInviteAction}
                              </Button>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.teamGroup}>
                    <h4>{copy.archiveTitle}</h4>
                    {archivedMembers.length === 0 ? (
                      <div className={styles.emptyCard}>{copy.noArchive}</div>
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
                                  {getMemberStatusLabel(member.status, copy)}
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
                                {copy.reinviteAction}
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
    </AlertDialog>
  );
}
