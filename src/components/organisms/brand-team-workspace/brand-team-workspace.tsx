"use client";

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
  searchUsoUsers,
  type UserSearchResult,
} from "@/lib/brands-api";
import {
  readBrandTeamWorkspace,
  writeBrandTeamWorkspace,
  type BrandTeamWorkspaceState,
  type TeamMemberRecord,
  type TeamMemberStatus,
} from "@/lib/team-workspace-storage";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { Brand } from "@/types/brand";
import type { AuthenticatedUser } from "@/types";
import styles from "./brand-team-workspace.module.css";

type BrandTeamWorkspaceProps = {
  brand: Brand;
  currentUser: Pick<
    AuthenticatedUser,
    "id" | "first_name" | "last_name" | "email" | "avatar_url"
  >;
};

type WorkspaceCopy = {
  badge: string;
  title: string;
  description: string;
  browserState: string;
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
  searchEmpty: string;
  inviteAction: string;
  inviteSuccess: string;
  inviteReadonly: string;
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
  previewAccept: string;
  previewReject: string;
  cancelInvite: string;
  removeMember: string;
  restoreInvite: string;
  reinviteMember: string;
  futureTitle: string;
  futureDescription: string;
  futureListOne: string;
  futureListTwo: string;
  futureListThree: string;
};

const EN_COPY: WorkspaceCopy = {
  badge: "Branch team workspace",
  title: "Shape the team before services go live",
  description:
    "Each branch will eventually host service owners, not just services. Use this workspace to decide who belongs in each branch before the service module lands.",
  browserState:
    "Until the backend endpoints are ready, invite state is saved only in this browser for planning and UI validation.",
  noBranchesTitle: "This brand has no branches yet",
  noBranchesDescription:
    "The team layer sits on top of branches. Add at least one branch first, then return here to shape the branch roster.",
  addBranch: "Add branch",
  editBrand: "Edit brand",
  openBrand: "Open brand profile",
  branchesRailTitle: "Branch lanes",
  branchesRailLead:
    "Teams are attached to branches, not directly to the brand. Pick a branch and prepare the people who will eventually publish services there.",
  branchCountLabel: "Branches",
  branchMemberCount: "accepted",
  branchPendingCount: "pending",
  acceptedMetric: "Accepted members",
  pendingMetric: "Pending invites",
  laneMetric: "Future service lanes",
  laneMetricHint: "Each accepted USO may later publish multiple services in this branch.",
  branchLeadLabel: "Default lead",
  availabilityLabel: "Availability",
  addressLabel: "Address",
  contactLabel: "Contact",
  noContact: "No contact details yet",
  allDay: "24/7",
  inviteTitle: "Invite a USO into this branch",
  inviteDescription:
    "Search existing service owners and prepare the branch team now. Backend ownership, notifications, and accept/reject flows will connect in the next step.",
  inviteSearchLabel: "Find a service owner",
  inviteSearchDescription:
    "Search by name, email, or phone. Users already accepted or already pending for this branch are hidden from the result list.",
  inviteSearchPlaceholder: "Search by name, email, or phone",
  searchIdle: "Start typing to search service owners.",
  searchLoading: "Searching service owners...",
  searchEmpty: "No matching service owners were found for this branch.",
  inviteAction: "Add to team plan",
  inviteSuccess: "The service owner was added to the local team plan.",
  inviteReadonly:
    "Invite actions will become real API mutations after the backend team module is connected.",
  acceptedTitle: "Accepted roster",
  pendingTitle: "Pending invitations",
  archiveTitle: "Archived states",
  noAccepted: "Only the branch owner is attached right now.",
  noPending: "No pending invitations yet.",
  noArchive: "Rejected or removed invites will appear here.",
  ownerRole: "Owner",
  memberRole: "Member",
  statusAccepted: "Accepted",
  statusPending: "Pending",
  statusRejected: "Rejected",
  statusRemoved: "Removed",
  previewAccept: "Preview accept",
  previewReject: "Preview reject",
  cancelInvite: "Cancel",
  removeMember: "Remove",
  restoreInvite: "Restore",
  reinviteMember: "Re-invite",
  futureTitle: "Service module will attach here next",
  futureDescription:
    "This page does not create services yet. It only prepares the people and branch boundaries that the future service domain will depend on.",
  futureListOne: "Individual services will stay outside the brand model and attach directly to an address.",
  futureListTwo: "Brand services will attach to a branch, not directly to the brand shell.",
  futureListThree: "Team services will belong to accepted branch members once the service module is launched.",
};

const TR_COPY: WorkspaceCopy = {
  ...EN_COPY,
  badge: "Şube ekip alanı",
  title: "Hizmetler canlıya çıkmadan önce ekibi kur",
  description:
    "Her şube sonunda yalnızca hizmet değil, hizmet sahibi de barındıracak. Bu alanı, servis modülü gelmeden önce her şubede kimlerin yer alacağını netleştirmek için kullan.",
  browserState:
    "Backend endpoint'leri hazır olana kadar davet durumları yalnızca bu tarayıcıda saklanır; amaç planlama ve UI doğrulamasıdır.",
  noBranchesTitle: "Bu markada henüz şube yok",
  noBranchesDescription:
    "Ekip katmanı şubelerin üstüne oturur. Önce en az bir şube ekleyin, sonra buraya dönüp ekip yapısını kurun.",
  addBranch: "Şube ekle",
  editBrand: "Markayı düzenle",
  openBrand: "Marka profilini aç",
  branchesRailTitle: "Şube alanları",
  branchesRailLead:
    "Takımlar doğrudan markaya değil, şubelere bağlanır. Bir şube seç ve ileride orada hizmet yayınlayacak kişileri hazırla.",
  branchCountLabel: "Şube",
  branchMemberCount: "kabul edildi",
  branchPendingCount: "beklemede",
  acceptedMetric: "Kabul edilen üyeler",
  pendingMetric: "Bekleyen davetler",
  laneMetric: "Gelecek servis kanalları",
  laneMetricHint:
    "Kabul edilen her USO ileride bu şube içinde birden fazla hizmet yayınlayabilir.",
  branchLeadLabel: "Varsayılan lider",
  availabilityLabel: "Çalışma durumu",
  addressLabel: "Adres",
  contactLabel: "İletişim",
  noContact: "Henüz iletişim detayı yok",
  allDay: "7/24",
  inviteTitle: "Bu şubeye bir USO davet et",
  inviteDescription:
    "Mevcut service owner'ları ara ve şube takımını şimdiden hazırla. Sahiplik, bildirim ve kabul/red akışı backend bağlandığında gerçek hale gelecek.",
  inviteSearchLabel: "Bir service owner bul",
  inviteSearchDescription:
    "İsim, email veya telefonla ara. Bu şubede zaten kabul edilmiş ya da bekleyen kullanıcılar sonuçlarda gizlenir.",
  inviteSearchPlaceholder: "İsim, email veya telefon ara",
  searchIdle: "Service owner aramak için yazmaya başlayın.",
  searchLoading: "Service owner aranıyor...",
  searchEmpty: "Bu şube için eşleşen bir service owner bulunamadı.",
  inviteAction: "Takım planına ekle",
  inviteSuccess: "Service owner yerel takım planına eklendi.",
  inviteReadonly:
    "Davet işlemleri backend team modülü bağlandıktan sonra gerçek API isteğine dönüşecek.",
  acceptedTitle: "Kabul edilen kadro",
  pendingTitle: "Bekleyen davetler",
  archiveTitle: "Arşiv durumları",
  noAccepted: "Şu an yalnızca şube sahibi bağlı.",
  noPending: "Henüz bekleyen davet yok.",
  noArchive: "Reddedilen veya kaldırılan davetler burada görünür.",
  ownerRole: "Sahip",
  memberRole: "Üye",
  statusAccepted: "Kabul edildi",
  statusPending: "Beklemede",
  statusRejected: "Reddedildi",
  statusRemoved: "Kaldırıldı",
  previewAccept: "Kabulü önizle",
  previewReject: "Reddi önizle",
  cancelInvite: "İptal et",
  removeMember: "Kaldır",
  restoreInvite: "Geri al",
  reinviteMember: "Tekrar davet et",
  futureTitle: "Servis modülü bir sonraki adımda buraya bağlanacak",
  futureDescription:
    "Bu sayfa henüz servis oluşturmaz. Sadece gelecekteki service domain'inin dayanacağı kişi ve şube sınırlarını hazırlar.",
  futureListOne:
    "Bireysel hizmetler brand dışında kalacak ve doğrudan adrese bağlanacak.",
  futureListTwo:
    "Brand altındaki hizmetler doğrudan brand'e değil, bir şubeye bağlanacak.",
  futureListThree:
    "Team hizmetleri, servis modülü açıldığında kabul edilmiş şube üyelerine ait olacak.",
};

const AZ_COPY: WorkspaceCopy = {
  ...EN_COPY,
  badge: "Filial komanda sahəsi",
  title: "Servislər açılmadan əvvəl komandanı qur",
  description:
    "Hər filial gələcəkdə yalnız service deyil, service owner-ları da daşıyacaq. Bu sahəni service modulu gəlməzdən əvvəl hansı şəxslərin hansı filialda olacağını hazırlamaq üçün istifadə et.",
  browserState:
    "Backend endpoint-ləri hazır olana qədər dəvət vəziyyətləri yalnız bu brauzerdə saxlanılır; məqsəd planlama və UI doğrulamasıdır.",
  noBranchesTitle: "Bu brenddə hələ filial yoxdur",
  noBranchesDescription:
    "Komanda qatını filialların üzərinə qururuq. Əvvəl ən azı bir filial əlavə et, sonra bura qayıdıb komanda quruluşunu hazırla.",
  addBranch: "Filial əlavə et",
  editBrand: "Brendi redaktə et",
  openBrand: "Brend profilini aç",
  branchesRailTitle: "Filial xətləri",
  branchesRailLead:
    "Komandalar birbaşa brendə yox, filiala bağlanır. Bir filial seç və gələcəkdə orada service yaradacaq insanları hazırla.",
  branchCountLabel: "Filial",
  branchMemberCount: "qəbul edilib",
  branchPendingCount: "gözləyir",
  acceptedMetric: "Qəbul olunan üzvlər",
  pendingMetric: "Gözləyən dəvətlər",
  laneMetric: "Gələcək service xətləri",
  laneMetricHint:
    "Qəbul olunan hər USO sonradan bu filial daxilində bir neçə service yarada bilər.",
  branchLeadLabel: "Varsayılan lider",
  availabilityLabel: "İş rejimi",
  addressLabel: "Ünvan",
  contactLabel: "Əlaqə",
  noContact: "Hələ əlaqə məlumatı yoxdur",
  allDay: "24/7",
  inviteTitle: "Bu filiala bir USO dəvət et",
  inviteDescription:
    "Mövcud service owner-ları axtar və filial komandasını indidən qur. Sahibliyin, bildirişin və qəbul/rədd axınının real hissəsi backend bağlananda tamamlanacaq.",
  inviteSearchLabel: "Bir service owner tap",
  inviteSearchDescription:
    "Ad, email və ya telefon ilə axtar. Bu filialda artıq qəbul olunmuş və ya gözləyən istifadəçilər nəticələrdə gizlədilir.",
  inviteSearchPlaceholder: "Ad, email və ya telefon axtar",
  searchIdle: "Service owner axtarmaq üçün yazmağa başla.",
  searchLoading: "Service owner axtarılır...",
  searchEmpty: "Bu filial üçün uyğun service owner tapılmadı.",
  inviteAction: "Komanda planına əlavə et",
  inviteSuccess: "Service owner lokal komanda planına əlavə olundu.",
  inviteReadonly:
    "Dəvət əməliyyatları backend team modulu bağlandıqdan sonra real API sorğusuna çevriləcək.",
  acceptedTitle: "Qəbul olunmuş heyət",
  pendingTitle: "Gözləyən dəvətlər",
  archiveTitle: "Arxiv vəziyyətləri",
  noAccepted: "Hazırda yalnız filial sahibi qoşulub.",
  noPending: "Hələ gözləyən dəvət yoxdur.",
  noArchive: "Rədd olunan və ya silinən dəvətlər burada görünəcək.",
  ownerRole: "Sahib",
  memberRole: "Üzv",
  statusAccepted: "Qəbul edildi",
  statusPending: "Gözləyir",
  statusRejected: "Rədd edildi",
  statusRemoved: "Silindi",
  previewAccept: "Qəbulu önizlə",
  previewReject: "Rəddi önizlə",
  cancelInvite: "Ləğv et",
  removeMember: "Sil",
  restoreInvite: "Geri qaytar",
  reinviteMember: "Yenidən dəvət et",
  futureTitle: "Service modulu növbəti addımda bura bağlanacaq",
  futureDescription:
    "Bu səhifə hələ service yaratmır. Sadəcə gələcək service domain-in əsaslanacağı insanlar və filial sərhədlərini hazırlayır.",
  futureListOne:
    "Fərdi servicelər brenddən kənarda qalacaq və birbaşa address-ə bağlanacaq.",
  futureListTwo:
    "Brend altındakı servicelər birbaşa brendə yox, konkret filiala bağlanacaq.",
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

function formatAvailability(
  branch: NonNullable<Brand["branches"]>[number],
  copy: WorkspaceCopy,
) {
  if (branch.is_24_7) {
    return copy.allDay;
  }

  if (branch.opening && branch.closing) {
    return `${branch.opening} - ${branch.closing}`;
  }

  return "—";
}

function formatAddress(branch: NonNullable<Brand["branches"]>[number]) {
  return [branch.address1, branch.address2].filter(Boolean).join(", ");
}

function getStatusLabel(status: TeamMemberStatus, copy: WorkspaceCopy) {
  switch (status) {
    case "accepted":
      return copy.statusAccepted;
    case "pending":
      return copy.statusPending;
    case "rejected":
      return copy.statusRejected;
    case "removed":
      return copy.statusRemoved;
    default:
      return status;
  }
}

function getInitials(member: Pick<TeamMemberRecord, "first_name" | "last_name">) {
  return `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`.toUpperCase();
}

function sortMembers(members: TeamMemberRecord[]) {
  return [...members].sort((left, right) => {
    if (left.role !== right.role) {
      return left.role === "owner" ? -1 : 1;
    }

    return left.first_name.localeCompare(right.first_name);
  });
}

export function BrandTeamWorkspace({
  brand,
  currentUser,
}: BrandTeamWorkspaceProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const session = useAppSelector(selectAuthSession);
  const accessToken = session.accessToken;
  const branches = useMemo(() => brand.branches ?? [], [brand.branches]);
  const [workspace, setWorkspace] = useState<BrandTeamWorkspaceState>(() =>
    readBrandTeamWorkspace(brand, currentUser),
  );
  const [activeBranchId, setActiveBranchId] = useState<string>(
    branches[0]?.id ?? "",
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

  useEffect(() => {
    writeBrandTeamWorkspace(brand.id, workspace);
  }, [brand.id, workspace]);

  const activeBranch = useMemo(
    () => branches.find((branch) => branch.id === activeBranchId) ?? null,
    [activeBranchId, branches],
  );

  const activeBranchMembers = useMemo(
    () =>
      sortMembers(workspace.branches[activeBranchId]?.members ?? []),
    [activeBranchId, workspace.branches],
  );

  const acceptedMembers = useMemo(
    () =>
      activeBranchMembers.filter((member) => member.status === "accepted"),
    [activeBranchMembers],
  );

  const pendingMembers = useMemo(
    () =>
      activeBranchMembers.filter((member) => member.status === "pending"),
    [activeBranchMembers],
  );

  const archivedMembers = useMemo(
    () =>
      activeBranchMembers.filter(
        (member) =>
          member.status === "rejected" || member.status === "removed",
      ),
    [activeBranchMembers],
  );

  useEffect(() => {
    if (!accessToken || deferredQuery.length < 2 || !activeBranchId) {
      return;
    }

    let active = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const membersByUserId = new Set(
          activeBranchMembers
            .filter(
              (member) =>
                member.status === "accepted" || member.status === "pending",
            )
            .map((member) => member.user_id),
        );

        const results = await searchUsoUsers(deferredQuery, accessToken);
        if (!active) {
          return;
        }

        const filtered = results.filter(
          (user) => !membersByUserId.has(user.id),
        );

        startTransition(() => {
          setSearchResults(filtered);
          setSearchState("done");
        });
      } catch {
        if (!active) {
          return;
        }

        setSearchResults([]);
        setSearchState("error");
        setFeedback({
          tone: "error",
          message: copy.inviteReadonly,
        });
      }
    }, 280);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, activeBranchId, activeBranchMembers, copy, deferredQuery]);

  function updateBranchMembers(
    branchId: string,
    updater: (members: TeamMemberRecord[]) => TeamMemberRecord[],
  ) {
    setWorkspace((current) => {
      const branchTeam = current.branches[branchId] ?? {
        branch_id: branchId,
        members: [],
      };

      return {
        ...current,
        updated_at: new Date().toISOString(),
        branches: {
          ...current.branches,
          [branchId]: {
            branch_id: branchId,
            members: updater(branchTeam.members),
          },
        },
      };
    });
  }

  function handleInvite(user: UserSearchResult) {
    if (!activeBranchId) {
      return;
    }

    updateBranchMembers(activeBranchId, (members) => {
      const existing = members.find((member) => member.user_id === user.id);

      if (existing) {
        return members.map((member) =>
          member.user_id === user.id
            ? {
                ...member,
                status: "pending",
                invited_at: new Date().toISOString(),
              }
            : member,
        );
      }

      return [
        ...members,
        {
          id:
            globalThis.crypto?.randomUUID?.() ??
            `${activeBranchId}:${user.id}:${Date.now()}`,
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar_url: user.avatar_url ?? null,
          role: "member",
          status: "pending",
          invited_at: new Date().toISOString(),
          invited_by_user_id: currentUser.id,
        },
      ];
    });

    setSearchQuery("");
    setSearchResults([]);
    setSearchState("idle");
    setFeedback({
      tone: "success",
      message: copy.inviteSuccess,
    });
  }

  function handleMemberStatusChange(
    memberId: string,
    nextStatus: TeamMemberStatus,
  ) {
    if (!activeBranchId) {
      return;
    }

    updateBranchMembers(activeBranchId, (members) =>
      members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              status: nextStatus,
            }
          : member,
      ),
    );
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
          <strong className={styles.metaValue}>{acceptedMembers.length}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{copy.pendingMetric}</span>
          <strong className={styles.metaValue}>{pendingMembers.length}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{copy.laneMetric}</span>
          <strong className={styles.metaValue}>{acceptedMembers.length}</strong>
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
            {branches.map((branch) => {
              const branchMembers =
                workspace.branches[branch.id]?.members ?? [];
              const acceptedCount = branchMembers.filter(
                (member) => member.status === "accepted",
              ).length;
              const pendingCount = branchMembers.filter(
                (member) => member.status === "pending",
              ).length;

              return (
                <button
                  key={branch.id}
                  type="button"
                  className={`${styles.branchButton} ${
                    branch.id === activeBranchId ? styles.branchButtonActive : ""
                  }`}
                  onClick={() => {
                    setActiveBranchId(branch.id);
                    setSearchQuery("");
                    setSearchResults([]);
                    setSearchState("idle");
                    setFeedback(null);
                  }}
                >
                  <div className={styles.branchButtonTop}>
                    <span className={styles.branchName}>{branch.name}</span>
                    <Badge
                      variant="outline"
                      icon="groups"
                      className={styles.branchBadge}
                    >
                      {acceptedCount}
                    </Badge>
                  </div>
                  <p className={styles.branchAddress}>{formatAddress(branch)}</p>
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
                    <h2 className={styles.branchHeroTitle}>{activeBranch.name}</h2>
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
                      {activeBranch.phone || activeBranch.email || copy.noContact}
                    </strong>
                  </div>
                </div>
              </section>

              <section className={styles.banner}>
                <Icon icon="lan" size={16} color="current" />
                <p>{copy.browserState}</p>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>{copy.inviteTitle}</h3>
                    <p className={styles.sectionLead}>{copy.inviteDescription}</p>
                  </div>
                  <Badge variant="outline" icon="memory">
                    UI sandbox
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
                      : deferredQuery.length < 2
                        ? copy.searchIdle
                        : searchResults.length === 0
                          ? copy.searchEmpty
                          : copy.inviteReadonly}
                  </div>

                  {searchResults.length > 0 ? (
                    <div className={styles.searchList}>
                      {searchResults.map((result) => (
                        <article key={result.id} className={styles.searchCard}>
                          <div className={styles.memberIdentity}>
                            <div
                              className={styles.avatar}
                              style={
                                proxyMediaUrl(result.avatar_url)
                                  ? {
                                      backgroundImage: `url(${proxyMediaUrl(result.avatar_url)})`,
                                    }
                                  : undefined
                              }
                              data-has-image={proxyMediaUrl(result.avatar_url) ? "true" : "false"}
                            >
                              {!proxyMediaUrl(result.avatar_url)
                                ? getInitials({
                                    first_name: result.first_name,
                                    last_name: result.last_name,
                                  } as TeamMemberRecord)
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
                            onClick={() => handleInvite(result)}
                          >
                            {copy.inviteAction}
                          </Button>
                        </article>
                      ))}
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
                    {acceptedMembers.map((member) => (
                      <article key={member.id} className={styles.memberCard}>
                        <div className={styles.memberHeader}>
                          <div className={styles.memberIdentity}>
                            <div
                              className={styles.avatar}
                              style={
                                proxyMediaUrl(member.avatar_url)
                                  ? {
                                      backgroundImage: `url(${proxyMediaUrl(member.avatar_url)})`,
                                    }
                                  : undefined
                              }
                              data-has-image={proxyMediaUrl(member.avatar_url) ? "true" : "false"}
                            >
                              {!proxyMediaUrl(member.avatar_url)
                                ? getInitials(member)
                                : null}
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
                              {member.role === "owner"
                                ? copy.ownerRole
                                : copy.memberRole}
                            </Badge>
                            <Badge variant="outline">
                              {copy.statusAccepted}
                            </Badge>
                          </div>
                        </div>

                        {member.role !== "owner" ? (
                          <div className={styles.memberActions}>
                            <Button
                              variant="outline"
                              size="small"
                              icon="person_remove"
                              onClick={() =>
                                handleMemberStatusChange(member.id, "removed")
                              }
                            >
                              {copy.removeMember}
                            </Button>
                          </div>
                        ) : null}
                      </article>
                    ))}
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
                    {pendingMembers.map((member) => (
                      <article key={member.id} className={styles.memberCard}>
                        <div className={styles.memberHeader}>
                          <div className={styles.memberIdentity}>
                            <div
                              className={styles.avatar}
                              style={
                                proxyMediaUrl(member.avatar_url)
                                  ? {
                                      backgroundImage: `url(${proxyMediaUrl(member.avatar_url)})`,
                                    }
                                  : undefined
                              }
                              data-has-image={proxyMediaUrl(member.avatar_url) ? "true" : "false"}
                            >
                              {!proxyMediaUrl(member.avatar_url)
                                ? getInitials(member)
                                : null}
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
                            variant="outline"
                            size="small"
                            icon="check_circle"
                            onClick={() =>
                              handleMemberStatusChange(member.id, "accepted")
                            }
                          >
                            {copy.previewAccept}
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            icon="cancel"
                            onClick={() =>
                              handleMemberStatusChange(member.id, "rejected")
                            }
                          >
                            {copy.previewReject}
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            icon="close"
                            onClick={() =>
                              handleMemberStatusChange(member.id, "removed")
                            }
                          >
                            {copy.cancelInvite}
                          </Button>
                        </div>
                      </article>
                    ))}
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
                    {archivedMembers.map((member) => (
                      <article key={member.id} className={styles.memberCard}>
                        <div className={styles.memberHeader}>
                          <div className={styles.memberIdentity}>
                            <div
                              className={styles.avatar}
                              style={
                                proxyMediaUrl(member.avatar_url)
                                  ? {
                                      backgroundImage: `url(${proxyMediaUrl(member.avatar_url)})`,
                                    }
                                  : undefined
                              }
                              data-has-image={proxyMediaUrl(member.avatar_url) ? "true" : "false"}
                            >
                              {!proxyMediaUrl(member.avatar_url)
                                ? getInitials(member)
                                : null}
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
                            onClick={() =>
                              handleMemberStatusChange(member.id, "pending")
                            }
                          >
                            {member.status === "removed"
                              ? copy.restoreInvite
                              : copy.reinviteMember}
                          </Button>
                        </div>
                      </article>
                    ))}
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
