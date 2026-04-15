"use client";

import { isAxiosError } from "axios";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Field, FieldDescription, FieldLabel, Input } from "@/components/atoms/input";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import {
  fetchBrandTeamWorkspace,
  inviteBranchTeamMember,
  removeBranchTeamMember,
  searchUsoUsers,
  type BrandTeamWorkspace as BrandTeamWorkspaceData,
  type TeamMemberStatus,
  type TeamWorkspaceBranch,
  type TeamWorkspaceMember,
  type UserSearchResult,
} from "@/lib/brands-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { Brand } from "@/types/brand";
import type { AuthenticatedUser } from "@/types";
import styles from "./brand-team-workspace.module.css";

type BrandTeamWorkspaceProps = {
  brand: Pick<Brand, "id" | "branches">;
  currentUser: Pick<
    AuthenticatedUser,
    "id" | "first_name" | "last_name" | "email" | "avatar_url"
  >;
  initialWorkspace: BrandTeamWorkspaceData;
};

type WorkspaceCopy = {
  badge: string;
  title: string;
  description: string;
  liveState: string;
  noBranchesTitle: string;
  noBranchesDescription: string;
  addBranch: string;
  editBrand: string;
  openBrand: string;
  branchesRailTitle: string;
  branchesRailLead: string;
  branchCountLabel: string;
  branchMemberCount: string;
  branchPendingCount: string;
  acceptedMetric: string;
  pendingMetric: string;
  laneMetric: string;
  laneMetricHint: string;
  branchLeadLabel: string;
  availabilityLabel: string;
  addressLabel: string;
  contactLabel: string;
  noContact: string;
  allDay: string;
  inviteTitle: string;
  inviteDescription: string;
  inviteSearchLabel: string;
  inviteSearchDescription: string;
  inviteSearchPlaceholder: string;
  searchIdle: string;
  searchLoading: string;
  searchReady: string;
  searchEmpty: string;
  searchError: string;
  inviteAction: string;
  inviteSuccess: string;
  removeSuccess: string;
  reinviteSuccess: string;
  acceptedTitle: string;
  pendingTitle: string;
  archiveTitle: string;
  noAccepted: string;
  noPending: string;
  noArchive: string;
  ownerRole: string;
  memberRole: string;
  statusAccepted: string;
  statusPending: string;
  statusRejected: string;
  statusRemoved: string;
  cancelInvite: string;
  removeMember: string;
  restoreInvite: string;
  reinviteMember: string;
  liveApiBadge: string;
  workspaceRefreshError: string;
  futureTitle: string;
  futureDescription: string;
  futureListOne: string;
  futureListTwo: string;
  futureListThree: string;
};

const EN_COPY: WorkspaceCopy = {
  badge: "Branch team workspace",
  title: "Build the branch roster before services launch",
  description:
    "Each branch already has its own team shell in the backend. Use this workspace to invite service owners into the right branch before the future service domain starts attaching ownership to them.",
  liveState:
    "This screen now reflects the real backend team state. Pending invitations are actionable from the invited USO's notification page.",
  noBranchesTitle: "This brand has no branches yet",
  noBranchesDescription:
    "The team layer sits on top of branches. Add at least one branch first, then return here to shape the branch roster.",
  addBranch: "Add branch",
  editBrand: "Edit brand",
  openBrand: "Open brand profile",
  branchesRailTitle: "Branch lanes",
  branchesRailLead:
    "Teams are attached to branches, not directly to the brand. Pick a branch and decide which accepted USO members will eventually publish services there.",
  branchCountLabel: "Branches",
  branchMemberCount: "accepted",
  branchPendingCount: "pending",
  acceptedMetric: "Accepted members",
  pendingMetric: "Pending invites",
  laneMetric: "Future service lanes",
  laneMetricHint: "Each accepted USO may later own multiple services inside the same branch.",
  branchLeadLabel: "Branch owner",
  availabilityLabel: "Availability",
  addressLabel: "Address",
  contactLabel: "Contact",
  noContact: "No contact details yet",
  allDay: "24/7",
  inviteTitle: "Invite a USO into this branch",
  inviteDescription:
    "Search existing service owners and send a real team invitation. They will see the invite in Notifications and can accept or reject it there.",
  inviteSearchLabel: "Find a service owner",
  inviteSearchDescription:
    "Search by name, email, or phone. Users already accepted or already pending in this branch are hidden from the results.",
  inviteSearchPlaceholder: "Search by name, email, or phone",
  searchIdle: "Start typing to search service owners.",
  searchLoading: "Searching service owners...",
  searchReady: "Select a service owner to send a real invitation.",
  searchEmpty: "No matching service owners were found for this branch.",
  searchError: "The search request could not be completed.",
  inviteAction: "Send invite",
  inviteSuccess: "Invitation sent successfully.",
  removeSuccess: "Team member status updated successfully.",
  reinviteSuccess: "Invitation was sent again.",
  acceptedTitle: "Accepted roster",
  pendingTitle: "Pending invitations",
  archiveTitle: "Archived states",
  noAccepted: "Only the branch owner is accepted right now.",
  noPending: "No pending invitations yet.",
  noArchive: "Rejected or removed invitations will appear here.",
  ownerRole: "Owner",
  memberRole: "Member",
  statusAccepted: "Accepted",
  statusPending: "Pending",
  statusRejected: "Rejected",
  statusRemoved: "Removed",
  cancelInvite: "Cancel invite",
  removeMember: "Remove member",
  restoreInvite: "Restore invite",
  reinviteMember: "Re-invite",
  liveApiBadge: "Live API",
  workspaceRefreshError: "The latest team state could not be loaded.",
  futureTitle: "Service module will attach here next",
  futureDescription:
    "This page still does not create services. It prepares the people and branch boundaries that the future service ownership model will depend on.",
  futureListOne: "Individual services will stay outside the brand model and attach directly to an address.",
  futureListTwo: "Brand services will attach to a branch, not directly to the brand shell.",
  futureListThree: "Team services will belong to accepted branch members once the service module is launched.",
};

const TR_COPY: WorkspaceCopy = {
  ...EN_COPY,
  badge: "Şube ekip alanı",
  title: "Servisler açılmadan önce şube kadrosunu kur",
  description:
    "Her şubenin backend içinde artık kendi team kabuğu var. Bu alanı, gelecekte servis sahipliğinin bağlanacağı USO üyelerini doğru şubelere yerleştirmek için kullan.",
  liveState:
    "Bu ekran artık gerçek backend team durumunu gösterir. Bekleyen davetler, davet edilen USO'nun Bildirimler ekranında aksiyon alabilir.",
  noBranchesTitle: "Bu markada henüz şube yok",
  noBranchesDescription:
    "Ekip katmanı şubelerin üstüne oturur. Önce en az bir şube ekleyin, sonra buraya dönüp ekip yapısını kurun.",
  addBranch: "Şube ekle",
  editBrand: "Markayı düzenle",
  openBrand: "Marka profilini aç",
  branchesRailTitle: "Şube alanları",
  branchesRailLead:
    "Takımlar doğrudan markaya değil, şubelere bağlanır. Bir şube seç ve ileride orada servis yayınlayacak kabul edilmiş USO üyelerini netleştir.",
  branchCountLabel: "Şube",
  branchMemberCount: "kabul edildi",
  branchPendingCount: "beklemede",
  acceptedMetric: "Kabul edilen üyeler",
  pendingMetric: "Bekleyen davetler",
  laneMetric: "Gelecek servis kanalları",
  laneMetricHint:
    "Kabul edilen her USO ileride aynı şube içinde birden fazla servisin sahibi olabilir.",
  branchLeadLabel: "Şube sahibi",
  availabilityLabel: "Çalışma durumu",
  addressLabel: "Adres",
  contactLabel: "İletişim",
  noContact: "Henüz iletişim detayı yok",
  allDay: "7/24",
  inviteTitle: "Bu şubeye bir USO davet et",
  inviteDescription:
    "Mevcut service owner'ları ara ve gerçek team daveti gönder. Kullanıcı bu daveti Bildirimler ekranında görüp kabul ya da red verebilir.",
  inviteSearchLabel: "Bir service owner bul",
  inviteSearchDescription:
    "İsim, email veya telefonla ara. Bu şubede zaten kabul edilmiş ya da bekleyen kullanıcılar sonuçlarda gizlenir.",
  inviteSearchPlaceholder: "İsim, email veya telefon ara",
  searchIdle: "Service owner aramak için yazmaya başlayın.",
  searchLoading: "Service owner aranıyor...",
  searchReady: "Gerçek bir davet göndermek için bir service owner seçin.",
  searchEmpty: "Bu şube için eşleşen bir service owner bulunamadı.",
  searchError: "Arama isteği tamamlanamadı.",
  inviteAction: "Davet gönder",
  inviteSuccess: "Davet başarıyla gönderildi.",
  removeSuccess: "Takım üyesi durumu güncellendi.",
  reinviteSuccess: "Davet yeniden gönderildi.",
  acceptedTitle: "Kabul edilen kadro",
  pendingTitle: "Bekleyen davetler",
  archiveTitle: "Arşiv durumları",
  noAccepted: "Şu an yalnızca şube sahibi kabul edilmiş durumda.",
  noPending: "Henüz bekleyen davet yok.",
  noArchive: "Reddedilen veya kaldırılan davetler burada görünür.",
  ownerRole: "Sahip",
  memberRole: "Üye",
  statusAccepted: "Kabul edildi",
  statusPending: "Beklemede",
  statusRejected: "Reddedildi",
  statusRemoved: "Kaldırıldı",
  cancelInvite: "Daveti iptal et",
  removeMember: "Üyeyi kaldır",
  restoreInvite: "Daveti geri aç",
  reinviteMember: "Tekrar davet et",
  liveApiBadge: "Canlı API",
  workspaceRefreshError: "Güncel takım durumu yüklenemedi.",
  futureTitle: "Servis modülü bir sonraki adımda buraya bağlanacak",
  futureDescription:
    "Bu sayfa hâlâ servis oluşturmaz. Sadece gelecekteki service ownership yapısının dayanacağı kişi ve şube sınırlarını hazırlar.",
  futureListOne:
    "Bireysel servisler brand dışında kalacak ve doğrudan bir adrese bağlanacak.",
  futureListTwo:
    "Brand servisleri doğrudan brand kabuğuna değil, bir şubeye bağlanacak.",
  futureListThree:
    "Team servisleri, servis modülü açıldığında kabul edilmiş şube üyelerine ait olacak.",
};

const AZ_COPY: WorkspaceCopy = {
  ...EN_COPY,
  badge: "Filial komanda sahəsi",
  title: "Servislər açılmadan əvvəl filial heyətini qur",
  description:
    "Hər filial üçün backend daxilində artıq real team quruluşu var. Bu sahəni, gələcəkdə service sahibliyinin bağlanacağı USO üzvlərini doğru filiallara toplamaq üçün istifadə et.",
  liveState:
    "Bu ekran artıq backenddəki real team vəziyyətini göstərir. Gözləyən dəvətlər dəvət olunan USO-nun Bildirişlər səhifəsində cavablandırılır.",
  noBranchesTitle: "Bu brenddə hələ filial yoxdur",
  noBranchesDescription:
    "Komanda qatını filialların üzərinə qururuq. Əvvəl ən azı bir filial əlavə et, sonra bura qayıdıb komanda quruluşunu hazırla.",
  addBranch: "Filial əlavə et",
  editBrand: "Brendi redaktə et",
  openBrand: "Brend profilini aç",
  branchesRailTitle: "Filial xətləri",
  branchesRailLead:
    "Komandalar birbaşa brendə yox, filiala bağlanır. Bir filial seç və gələcəkdə orada service yaradacaq qəbul olunmuş USO üzvlərini müəyyən et.",
  branchCountLabel: "Filial",
  branchMemberCount: "qəbul edilib",
  branchPendingCount: "gözləyir",
  acceptedMetric: "Qəbul olunan üzvlər",
  pendingMetric: "Gözləyən dəvətlər",
  laneMetric: "Gələcək service xətləri",
  laneMetricHint:
    "Qəbul olunan hər USO sonradan eyni filial daxilində bir neçə service sahibi ola bilər.",
  branchLeadLabel: "Filial sahibi",
  availabilityLabel: "İş rejimi",
  addressLabel: "Ünvan",
  contactLabel: "Əlaqə",
  noContact: "Hələ əlaqə məlumatı yoxdur",
  allDay: "24/7",
  inviteTitle: "Bu filiala bir USO dəvət et",
  inviteDescription:
    "Mövcud service owner-ları axtar və real team dəvəti göndər. İstifadəçi bu dəvəti Bildirişlər səhifəsində qəbul və ya rədd edə bilər.",
  inviteSearchLabel: "Bir service owner tap",
  inviteSearchDescription:
    "Ad, email və ya telefon ilə axtar. Bu filialda artıq qəbul olunmuş və ya gözləyən istifadəçilər nəticələrdə gizlənir.",
  inviteSearchPlaceholder: "Ad, email və ya telefon axtar",
  searchIdle: "Service owner axtarmaq üçün yazmağa başla.",
  searchLoading: "Service owner axtarılır...",
  searchReady: "Real dəvət göndərmək üçün bir service owner seç.",
  searchEmpty: "Bu filial üçün uyğun service owner tapılmadı.",
  searchError: "Axtarış sorğusu tamamlanmadı.",
  inviteAction: "Dəvət göndər",
  inviteSuccess: "Dəvət uğurla göndərildi.",
  removeSuccess: "Komanda üzvünün vəziyyəti yeniləndi.",
  reinviteSuccess: "Dəvət yenidən göndərildi.",
  acceptedTitle: "Qəbul olunmuş heyət",
  pendingTitle: "Gözləyən dəvətlər",
  archiveTitle: "Arxiv vəziyyətləri",
  noAccepted: "Hazırda yalnız filial sahibi qəbul olunub.",
  noPending: "Hələ gözləyən dəvət yoxdur.",
  noArchive: "Rədd olunan və ya silinən dəvətlər burada görünür.",
  ownerRole: "Sahib",
  memberRole: "Üzv",
  statusAccepted: "Qəbul edildi",
  statusPending: "Gözləyir",
  statusRejected: "Rədd edildi",
  statusRemoved: "Silindi",
  cancelInvite: "Dəvəti ləğv et",
  removeMember: "Üzvü sil",
  restoreInvite: "Dəvəti bərpa et",
  reinviteMember: "Yenidən dəvət et",
  liveApiBadge: "Canlı API",
  workspaceRefreshError: "Aktual komanda vəziyyəti yüklənmədi.",
  futureTitle: "Service modulu növbəti addımda bura bağlanacaq",
  futureDescription:
    "Bu səhifə hələ service yaratmır. Sadəcə gələcək service ownership məntiqinin əsaslanacağı insanları və filial sərhədlərini hazırlayır.",
  futureListOne:
    "Fərdi servicelər brenddən kənarda qalacaq və birbaşa address-ə bağlanacaq.",
  futureListTwo:
    "Brend serviceləri birbaşa brend qabığına yox, konkret filiala bağlanacaq.",
  futureListThree:
    "Team serviceləri service modulu açıldıqda qəbul olunmuş filial üzvlərinə məxsus olacaq.",
};

function getCopy(locale: string): WorkspaceCopy {
  if (locale.startsWith("az")) {
    return AZ_COPY;
  }

  if (locale.startsWith("tr")) {
    return TR_COPY;
  }

  return EN_COPY;
}

function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

function formatAvailability(branch: TeamWorkspaceBranch, copy: WorkspaceCopy) {
  if (branch.availability.is_24_7) {
    return copy.allDay;
  }

  if (branch.availability.opening && branch.availability.closing) {
    return `${branch.availability.opening} - ${branch.availability.closing}`;
  }

  return "—";
}

function formatAddress(branch: TeamWorkspaceBranch) {
  return [branch.address.address1, branch.address.address2].filter(Boolean).join(", ");
}

function getStatusLabel(status: TeamMemberStatus, copy: WorkspaceCopy) {
  switch (status) {
    case "ACCEPTED":
      return copy.statusAccepted;
    case "PENDING":
      return copy.statusPending;
    case "REJECTED":
      return copy.statusRejected;
    case "REMOVED":
      return copy.statusRemoved;
    default:
      return status;
  }
}

function getInitials(
  member: Pick<TeamWorkspaceMember, "first_name" | "last_name">,
) {
  return `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`.toUpperCase();
}

function sortMembers(members: TeamWorkspaceMember[]) {
  return [...members].sort((left, right) => {
    if (left.role !== right.role) {
      return left.role === "OWNER" ? -1 : 1;
    }

    const leftName = formatName(left.first_name, left.last_name);
    const rightName = formatName(right.first_name, right.last_name);

    return leftName.localeCompare(rightName);
  });
}

function flattenBranchMembers(branch: TeamWorkspaceBranch) {
  return [
    ...branch.members.accepted,
    ...branch.members.pending,
    ...branch.members.rejected,
    ...branch.members.removed,
  ];
}

function getApiErrorMessage(
  error: unknown,
  fallback: string,
  translations: Record<string, string>,
) {
  if (isAxiosError(error)) {
    const translatedMessage = translateBackendErrorMessage(
      error.response?.data?.message,
      translations,
    );

    if (translatedMessage) {
      return translatedMessage;
    }
  }

  return fallback;
}

export function BrandTeamWorkspace({
  brand,
  currentUser,
  initialWorkspace,
}: BrandTeamWorkspaceProps) {
  const router = useRouter();
  const { locale, messages } = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const session = useAppSelector(selectAuthSession);
  const accessToken = session.accessToken;
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [activeBranchId, setActiveBranchId] = useState<string>(
    initialWorkspace.branches[0]?.branch_id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery.trim());
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchState, setSearchState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [inviteUserId, setInviteUserId] = useState<string | null>(null);
  const [memberActionId, setMemberActionId] = useState<string | null>(null);

  const branches = useMemo(() => workspace.branches ?? [], [workspace.branches]);

  useEffect(() => {
    if (!branches.some((branchItem) => branchItem.branch_id === activeBranchId)) {
      setActiveBranchId(branches[0]?.branch_id ?? "");
    }
  }, [activeBranchId, branches]);

  const activeBranch = useMemo(
    () =>
      branches.find((branchItem) => branchItem.branch_id === activeBranchId) ?? null,
    [activeBranchId, branches],
  );

  const brandBranchMap = useMemo(
    () => new Map((brand.branches ?? []).map((branchItem) => [branchItem.id, branchItem])),
    [brand.branches],
  );

  const activeBrandBranch = activeBranch
    ? (brandBranchMap.get(activeBranch.branch_id) ?? null)
    : null;

  const activeBranchMembers = useMemo(
    () => (activeBranch ? sortMembers(flattenBranchMembers(activeBranch)) : []),
    [activeBranch],
  );

  const acceptedMembers = useMemo(
    () => activeBranchMembers.filter((member) => member.status === "ACCEPTED"),
    [activeBranchMembers],
  );

  const pendingMembers = useMemo(
    () => activeBranchMembers.filter((member) => member.status === "PENDING"),
    [activeBranchMembers],
  );

  const archivedMembers = useMemo(
    () =>
      activeBranchMembers.filter(
        (member) => member.status === "REJECTED" || member.status === "REMOVED",
      ),
    [activeBranchMembers],
  );

  const globalMetrics = useMemo(() => {
    return branches.reduce(
      (summary, branchItem) => ({
        accepted: summary.accepted + branchItem.members.accepted.length,
        pending: summary.pending + branchItem.members.pending.length,
      }),
      { accepted: 0, pending: 0 },
    );
  }, [branches]);

  useEffect(() => {
    if (!accessToken || deferredQuery.length < 2 || !activeBranch) {
      return;
    }

    let active = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const memberIds = new Set(
          flattenBranchMembers(activeBranch)
            .filter(
              (member) =>
                member.status === "ACCEPTED" || member.status === "PENDING",
            )
            .map((member) => member.user_id),
        );

        const results = await searchUsoUsers(deferredQuery, accessToken);
        if (!active) {
          return;
        }

        const filtered = results.filter(
          (user) => !memberIds.has(user.id) && user.id !== currentUser.id,
        );

        startTransition(() => {
          setSearchResults(filtered);
          setSearchState("done");
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setSearchResults([]);
        setSearchState("error");
        setFeedback({
          tone: "error",
          message: getApiErrorMessage(
            error,
            copy.searchError,
            messages.backendErrors,
          ),
        });
      }
    }, 280);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, activeBranch, copy.searchError, currentUser.id, deferredQuery, messages.backendErrors]);

  async function refreshWorkspace() {
    if (!accessToken) {
      throw new Error(copy.workspaceRefreshError);
    }

    const nextWorkspace = await fetchBrandTeamWorkspace(brand.id, accessToken);
    setWorkspace(nextWorkspace);
    return nextWorkspace;
  }

  async function handleInvite(user: UserSearchResult) {
    if (!accessToken || !activeBranch) {
      setFeedback({
        tone: "error",
        message: copy.workspaceRefreshError,
      });
      return;
    }

    setInviteUserId(user.id);
    setFeedback(null);

    try {
      await inviteBranchTeamMember(
        brand.id,
        activeBranch.branch_id,
        user.id,
        accessToken,
      );
      await refreshWorkspace();
      setSearchQuery("");
      setSearchResults([]);
      setSearchState("idle");
      setFeedback({
        tone: "success",
        message: copy.inviteSuccess,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getApiErrorMessage(
          error,
          copy.workspaceRefreshError,
          messages.backendErrors,
        ),
      });
    } finally {
      setInviteUserId(null);
    }
  }

  async function handleRemove(memberId: string) {
    if (!accessToken || !activeBranch) {
      setFeedback({
        tone: "error",
        message: copy.workspaceRefreshError,
      });
      return;
    }

    setMemberActionId(memberId);
    setFeedback(null);

    try {
      await removeBranchTeamMember(
        brand.id,
        activeBranch.branch_id,
        memberId,
        accessToken,
      );
      await refreshWorkspace();
      setFeedback({
        tone: "success",
        message: copy.removeSuccess,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getApiErrorMessage(
          error,
          copy.workspaceRefreshError,
          messages.backendErrors,
        ),
      });
    } finally {
      setMemberActionId(null);
    }
  }

  async function handleReinvite(member: TeamWorkspaceMember) {
    if (!accessToken || !activeBranch) {
      setFeedback({
        tone: "error",
        message: copy.workspaceRefreshError,
      });
      return;
    }

    setMemberActionId(member.membership_id);
    setFeedback(null);

    try {
      await inviteBranchTeamMember(
        brand.id,
        activeBranch.branch_id,
        member.user_id,
        accessToken,
      );
      await refreshWorkspace();
      setFeedback({
        tone: "success",
        message: copy.reinviteSuccess,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getApiErrorMessage(
          error,
          copy.workspaceRefreshError,
          messages.backendErrors,
        ),
      });
    } finally {
      setMemberActionId(null);
    }
  }

  if (branches.length === 0) {
    return (
      <div className={styles.emptyShell}>
        <Badge icon="hub" variant="outline" className={styles.heroBadge}>
          {copy.badge}
        </Badge>
        <h1 className={styles.emptyTitle}>{copy.noBranchesTitle}</h1>
        <p className={styles.emptyDescription}>{copy.noBranchesDescription}</p>
        <div className={styles.emptyActions}>
          <Button
            variant="primary"
            icon="edit_square"
            onClick={() => router.push(`/brands?progress=edit&id=${brand.id}`)}
          >
            {copy.addBranch}
          </Button>
          <Button
            variant="outline"
            icon="sell"
            onClick={() => router.push(`/brands?id=${brand.id}`)}
          >
            {copy.openBrand}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <Badge icon="groups" variant="outline" className={styles.heroBadge}>
            {copy.badge}
          </Badge>
          <h1 className={styles.heroTitle}>{copy.title}</h1>
          <p className={styles.heroDescription}>{copy.description}</p>
        </div>

        <div className={styles.heroActions}>
          <Button
            variant="primary"
            icon="edit_square"
            onClick={() => router.push(`/brands?progress=edit&id=${brand.id}`)}
          >
            {copy.editBrand}
          </Button>
          <Button
            variant="outline"
            icon="sell"
            onClick={() => router.push(`/brands?id=${brand.id}`)}
          >
            {copy.openBrand}
          </Button>
        </div>
      </section>

      <section className={styles.metaGrid}>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{copy.branchCountLabel}</span>
          <strong className={styles.metaValue}>{branches.length}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{copy.acceptedMetric}</span>
          <strong className={styles.metaValue}>{globalMetrics.accepted}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{copy.pendingMetric}</span>
          <strong className={styles.metaValue}>{globalMetrics.pending}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{copy.laneMetric}</span>
          <strong className={styles.metaValue}>{globalMetrics.accepted}</strong>
          <p className={styles.metaHint}>{copy.laneMetricHint}</p>
        </article>
      </section>

      <div className={styles.shell}>
        <aside className={styles.rail}>
          <div className={styles.railHeader}>
            <h2 className={styles.railTitle}>{copy.branchesRailTitle}</h2>
            <p className={styles.railLead}>{copy.branchesRailLead}</p>
          </div>

          <div className={styles.branchList}>
            {branches.map((branchItem) => {
              const acceptedCount = branchItem.members.accepted.length;
              const pendingCount = branchItem.members.pending.length;

              return (
                <button
                  key={branchItem.branch_id}
                  type="button"
                  className={`${styles.branchButton} ${
                    branchItem.branch_id === activeBranchId ? styles.branchButtonActive : ""
                  }`}
                  onClick={() => {
                    setActiveBranchId(branchItem.branch_id);
                    setSearchQuery("");
                    setSearchResults([]);
                    setSearchState("idle");
                    setFeedback(null);
                  }}
                >
                  <div className={styles.branchButtonTop}>
                    <span className={styles.branchName}>{branchItem.branch_name}</span>
                    <Badge
                      variant="outline"
                      icon="groups"
                      className={styles.branchBadge}
                    >
                      {acceptedCount}
                    </Badge>
                  </div>
                  <p className={styles.branchAddress}>{formatAddress(branchItem)}</p>
                  <div className={styles.branchStats}>
                    <span>{acceptedCount} {copy.branchMemberCount}</span>
                    <span>{pendingCount} {copy.branchPendingCount}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className={styles.main}>
          {activeBranch ? (
            <>
              <section className={styles.branchHero}>
                <div className={styles.branchHeroHeader}>
                  <div>
                    <h2 className={styles.branchHeroTitle}>{activeBranch.branch_name}</h2>
                    <p className={styles.branchHeroLead}>
                      {formatAddress(activeBranch)}
                    </p>
                  </div>
                  <Badge icon="workspace_premium" variant="outline">
                    {copy.branchLeadLabel}: {formatName(currentUser.first_name, currentUser.last_name)}
                  </Badge>
                </div>

                <div className={styles.branchHeroGrid}>
                  <div className={styles.branchFact}>
                    <span className={styles.branchFactLabel}>{copy.availabilityLabel}</span>
                    <strong className={styles.branchFactValue}>
                      {formatAvailability(activeBranch, copy)}
                    </strong>
                  </div>
                  <div className={styles.branchFact}>
                    <span className={styles.branchFactLabel}>{copy.addressLabel}</span>
                    <strong className={styles.branchFactValue}>
                      {formatAddress(activeBranch)}
                    </strong>
                  </div>
                  <div className={styles.branchFact}>
                    <span className={styles.branchFactLabel}>{copy.contactLabel}</span>
                    <strong className={styles.branchFactValue}>
                      {activeBrandBranch?.phone || activeBrandBranch?.email || copy.noContact}
                    </strong>
                  </div>
                </div>
              </section>

              <section className={styles.banner}>
                <Icon icon="lan" size={16} color="current" />
                <p>{copy.liveState}</p>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>{copy.inviteTitle}</h3>
                    <p className={styles.sectionLead}>{copy.inviteDescription}</p>
                  </div>
                  <Badge variant="outline" icon="lan">
                    {copy.liveApiBadge}
                  </Badge>
                </div>

                <div className={styles.invitePanel}>
                  <Field className={styles.inviteField}>
                    <FieldLabel>{copy.inviteSearchLabel}</FieldLabel>
                    <Input
                      value={searchQuery}
                      placeholder={copy.inviteSearchPlaceholder}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setSearchQuery(nextValue);
                        if (nextValue.trim().length < 2) {
                          setSearchResults([]);
                          setSearchState("idle");
                        } else if (accessToken) {
                          setSearchState("loading");
                        }
                        setFeedback(null);
                      }}
                    />
                    <FieldDescription>
                      {copy.inviteSearchDescription}
                    </FieldDescription>
                  </Field>

                  {feedback ? (
                    <div
                      className={`${styles.feedback} ${
                        feedback.tone === "success"
                          ? styles.feedbackSuccess
                          : styles.feedbackError
                      }`}
                    >
                      {feedback.message}
                    </div>
                  ) : null}

                  <div className={styles.searchState}>
                    {searchState === "loading"
                      ? copy.searchLoading
                      : searchState === "error"
                        ? copy.searchError
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
                          <article key={result.id} className={styles.searchCard}>
                            <div className={styles.memberIdentity}>
                              <div
                                className={styles.avatar}
                                style={
                                  avatarUrl
                                    ? {
                                        backgroundImage: `url(${avatarUrl})`,
                                      }
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
                                <strong className={styles.memberName}>
                                  {formatName(result.first_name, result.last_name)}
                                </strong>
                                <span className={styles.memberEmail}>
                                  {result.email}
                                </span>
                              </div>
                            </div>

                            <Button
                              variant="primary"
                              size="small"
                              icon="person_add"
                              isLoading={inviteUserId === result.id}
                              onClick={() => handleInvite(result)}
                            >
                              {copy.inviteAction}
                            </Button>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{copy.acceptedTitle}</h3>
                </div>

                {acceptedMembers.length === 0 ? (
                  <div className={styles.emptyCard}>{copy.noAccepted}</div>
                ) : (
                  <div className={styles.memberGrid}>
                    {acceptedMembers.map((member) => {
                      const avatarUrl = proxyMediaUrl(member.avatar_url);

                      return (
                        <article key={member.membership_id} className={styles.memberCard}>
                          <div className={styles.memberHeader}>
                            <div className={styles.memberIdentity}>
                              <div
                                className={styles.avatar}
                                style={
                                  avatarUrl
                                    ? {
                                        backgroundImage: `url(${avatarUrl})`,
                                      }
                                    : undefined
                                }
                                data-has-image={avatarUrl ? "true" : "false"}
                              >
                                {!avatarUrl ? getInitials(member) : null}
                              </div>
                              <div className={styles.memberMeta}>
                                <strong className={styles.memberName}>
                                  {formatName(member.first_name, member.last_name)}
                                </strong>
                                <span className={styles.memberEmail}>
                                  {member.email}
                                </span>
                              </div>
                            </div>

                            <div className={styles.memberPills}>
                              <Badge variant="outline">
                                {member.role === "OWNER"
                                  ? copy.ownerRole
                                  : copy.memberRole}
                              </Badge>
                              <Badge variant="outline">
                                {copy.statusAccepted}
                              </Badge>
                            </div>
                          </div>

                          {member.role !== "OWNER" ? (
                            <div className={styles.memberActions}>
                              <Button
                                variant="outline"
                                size="small"
                                icon="person_remove"
                                isLoading={memberActionId === member.membership_id}
                                onClick={() => handleRemove(member.membership_id)}
                              >
                                {copy.removeMember}
                              </Button>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{copy.pendingTitle}</h3>
                </div>

                {pendingMembers.length === 0 ? (
                  <div className={styles.emptyCard}>{copy.noPending}</div>
                ) : (
                  <div className={styles.memberGrid}>
                    {pendingMembers.map((member) => {
                      const avatarUrl = proxyMediaUrl(member.avatar_url);

                      return (
                        <article key={member.membership_id} className={styles.memberCard}>
                          <div className={styles.memberHeader}>
                            <div className={styles.memberIdentity}>
                              <div
                                className={styles.avatar}
                                style={
                                  avatarUrl
                                    ? {
                                        backgroundImage: `url(${avatarUrl})`,
                                      }
                                    : undefined
                                }
                                data-has-image={avatarUrl ? "true" : "false"}
                              >
                                {!avatarUrl ? getInitials(member) : null}
                              </div>
                              <div className={styles.memberMeta}>
                                <strong className={styles.memberName}>
                                  {formatName(member.first_name, member.last_name)}
                                </strong>
                                <span className={styles.memberEmail}>
                                  {member.email}
                                </span>
                              </div>
                            </div>

                            <div className={styles.memberPills}>
                              <Badge variant="outline">
                                {copy.memberRole}
                              </Badge>
                              <Badge variant="outline">
                                {copy.statusPending}
                              </Badge>
                            </div>
                          </div>

                          <div className={styles.memberActions}>
                            <Button
                              variant="ghost"
                              size="small"
                              icon="close"
                              isLoading={memberActionId === member.membership_id}
                              onClick={() => handleRemove(member.membership_id)}
                            >
                              {copy.cancelInvite}
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{copy.archiveTitle}</h3>
                </div>

                {archivedMembers.length === 0 ? (
                  <div className={styles.emptyCard}>{copy.noArchive}</div>
                ) : (
                  <div className={styles.memberGrid}>
                    {archivedMembers.map((member) => {
                      const avatarUrl = proxyMediaUrl(member.avatar_url);

                      return (
                        <article key={member.membership_id} className={styles.memberCard}>
                          <div className={styles.memberHeader}>
                            <div className={styles.memberIdentity}>
                              <div
                                className={styles.avatar}
                                style={
                                  avatarUrl
                                    ? {
                                        backgroundImage: `url(${avatarUrl})`,
                                      }
                                    : undefined
                                }
                                data-has-image={avatarUrl ? "true" : "false"}
                              >
                                {!avatarUrl ? getInitials(member) : null}
                              </div>
                              <div className={styles.memberMeta}>
                                <strong className={styles.memberName}>
                                  {formatName(member.first_name, member.last_name)}
                                </strong>
                                <span className={styles.memberEmail}>
                                  {member.email}
                                </span>
                              </div>
                            </div>

                            <div className={styles.memberPills}>
                              <Badge variant="outline">
                                {getStatusLabel(member.status, copy)}
                              </Badge>
                            </div>
                          </div>

                          <div className={styles.memberActions}>
                            <Button
                              variant="outline"
                              size="small"
                              icon="refresh"
                              isLoading={memberActionId === member.membership_id}
                              onClick={() => handleReinvite(member)}
                            >
                              {member.status === "REMOVED"
                                ? copy.restoreInvite
                                : copy.reinviteMember}
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className={styles.futurePanel}>
                <div className={styles.futureHeader}>
                  <div className={styles.futureIcon}>
                    <Icon icon="room_service" size={18} color="current" />
                  </div>
                  <div>
                    <h3 className={styles.futureTitle}>{copy.futureTitle}</h3>
                    <p className={styles.futureDescription}>
                      {copy.futureDescription}
                    </p>
                  </div>
                </div>

                <div className={styles.futureList}>
                  <div className={styles.futureItem}>{copy.futureListOne}</div>
                  <div className={styles.futureItem}>{copy.futureListTwo}</div>
                  <div className={styles.futureItem}>{copy.futureListThree}</div>
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
