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
import { StatusBanner } from "@/components/molecules/status-banner";
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
  initialWorkspace?: BrandTeamWorkspaceData | null;
};


function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

function formatAvailability(branch: TeamWorkspaceBranch, allDayLabel: string) {
  if (branch.availability.is_24_7) {
    return allDayLabel;
  }

  if (branch.availability.opening && branch.availability.closing) {
    return `${branch.availability.opening} - ${branch.availability.closing}`;
  }

  return "—";
}

function formatAddress(branch: TeamWorkspaceBranch) {
  return [branch.address.address1, branch.address.address2].filter(Boolean).join(", ");
}

function getStatusLabel(status: TeamMemberStatus, t: { workspaceStatusAccepted: string; workspacePendingStatus: string; workspaceRejectedStatus: string; workspaceRemovedStatus: string }) {
  switch (status) {
    case "ACCEPTED":
      return t.workspaceStatusAccepted;
    case "PENDING":
      return t.workspacePendingStatus;
    case "REJECTED":
      return t.workspaceRejectedStatus;
    case "REMOVED":
      return t.workspaceRemovedStatus;
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
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const accessToken = session.accessToken;
  const [workspace, setWorkspace] = useState<BrandTeamWorkspaceData | null>(
    initialWorkspace ?? null,
  );
  const [activeBranchId, setActiveBranchId] = useState<string>(
    initialWorkspace?.branches[0]?.branch_id ?? "",
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
  const [workspaceState, setWorkspaceState] = useState<
    "ready" | "loading" | "error"
  >(initialWorkspace ? "ready" : "loading");

  const branches = useMemo(() => workspace?.branches ?? [], [workspace]);
  const brandBranches = useMemo(() => brand.branches ?? [], [brand.branches]);

  useEffect(() => {
    if (!branches.some((branchItem) => branchItem.branch_id === activeBranchId)) {
      setActiveBranchId(branches[0]?.branch_id ?? "");
    }
  }, [activeBranchId, branches]);

  useEffect(() => {
    const token = accessToken;

    if (initialWorkspace || !token) {
      return;
    }

    const authToken = token;

    let active = true;

    async function loadWorkspace() {
      try {
        const nextWorkspace = await fetchBrandTeamWorkspace(brand.id, authToken);

        if (!active) {
          return;
        }

        setWorkspace(nextWorkspace);
        setActiveBranchId((current) => current || nextWorkspace.branches[0]?.branch_id || "");
        setWorkspaceState("ready");
      } catch {
        if (!active) {
          return;
        }

        setWorkspaceState("error");
      }
    }

    void loadWorkspace();

    return () => {
      active = false;
    };
  }, [accessToken, brand.id, initialWorkspace]);

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
            t.workspaceSearchError,
            messages.backendErrors,
          ),
        });
      }
    }, 280);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, activeBranch, t.workspaceSearchError, currentUser.id, deferredQuery, messages.backendErrors]);

  async function refreshWorkspace(options?: { showLoadingState?: boolean }) {
    if (!accessToken) {
      throw new Error(t.workspaceRefreshError);
    }

    if (options?.showLoadingState) {
      setWorkspaceState("loading");
    }

    const nextWorkspace = await fetchBrandTeamWorkspace(brand.id, accessToken);
    setWorkspace(nextWorkspace);
    setActiveBranchId((current) => current || nextWorkspace.branches[0]?.branch_id || "");
    setWorkspaceState("ready");
    return nextWorkspace;
  }

  async function handleRetryWorkspace() {
    setFeedback(null);

    try {
      await refreshWorkspace({ showLoadingState: true });
    } catch (error) {
      setWorkspaceState("error");
      setFeedback({
        tone: "error",
        message: getApiErrorMessage(
          error,
          t.workspaceRefreshError,
          messages.backendErrors,
        ),
      });
    }
  }

  async function handleInvite(user: UserSearchResult) {
    if (!accessToken || !activeBranch) {
      setFeedback({
        tone: "error",
        message: t.workspaceRefreshError,
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
        message: t.workspaceInviteSuccess,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getApiErrorMessage(
          error,
          t.workspaceRefreshError,
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
        message: t.workspaceRefreshError,
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
        message: t.workspaceRemoveSuccess,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getApiErrorMessage(
          error,
          t.workspaceRefreshError,
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
        message: t.workspaceRefreshError,
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
        message: t.workspaceReinviteSuccess,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getApiErrorMessage(
          error,
          t.workspaceRefreshError,
          messages.backendErrors,
        ),
      });
    } finally {
      setMemberActionId(null);
    }
  }

  if (brandBranches.length === 0) {
    return (
      <div className={styles.emptyShell}>
        <Badge icon="hub" variant="outline" className={styles.heroBadge}>
          {t.workspaceBadge}
        </Badge>
        <h1 className={styles.emptyTitle}>{t.workspaceNoBranchesTitle}</h1>
        <p className={styles.emptyDescription}>{t.workspaceNoBranchesDescription}</p>
        <div className={styles.emptyActions}>
          <Button
            variant="primary"
            icon="edit_square"
            onClick={() => router.push(`/brands?progress=edit&id=${brand.id}`)}
          >
            {t.addBranch}
          </Button>
          <Button
            variant="outline"
            icon="sell"
            onClick={() => router.push(`/brands?id=${brand.id}`)}
          >
            {t.workspaceOpenBrand}
          </Button>
        </div>
      </div>
    );
  }

  if (!workspace || workspaceState !== "ready") {
    const isLoading = workspaceState === "loading";

    return (
      <div className={styles.emptyShell}>
        <Badge icon="hub" variant="outline" className={styles.heroBadge}>
          {t.workspaceBadge}
        </Badge>
        <h1 className={styles.emptyTitle}>
          {isLoading ? t.workspaceLoadingTitle : t.workspaceErrorTitle}
        </h1>
        <p className={styles.emptyDescription}>
          {isLoading ? t.workspaceLoadingDescription : t.workspaceErrorDescription}
        </p>

        {feedback ? (
          <StatusBanner variant={feedback.tone === "success" ? "success" : "error"}>
            {feedback.message}
          </StatusBanner>
        ) : null}

        <div className={styles.emptyActions}>
          <Button
            variant="primary"
            icon="refresh"
            isLoading={isLoading}
            onClick={() => {
              void handleRetryWorkspace();
            }}
          >
            {t.workspaceRetry}
          </Button>
          <Button
            variant="outline"
            icon="edit_square"
            onClick={() => router.push(`/brands?progress=edit&id=${brand.id}`)}
          >
            {t.editBrand}
          </Button>
          <Button
            variant="outline"
            icon="sell"
            onClick={() => router.push(`/brands?id=${brand.id}`)}
          >
            {t.workspaceOpenBrand}
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
            {t.workspaceBadge}
          </Badge>
          <h1 className={styles.heroTitle}>{t.workspaceTitle}</h1>
          <p className={styles.heroDescription}>{t.workspaceDescription}</p>
        </div>

        <div className={styles.heroActions}>
          <Button
            variant="primary"
            icon="edit_square"
            onClick={() => router.push(`/brands?progress=edit&id=${brand.id}`)}
          >
            {t.editBrand}
          </Button>
          <Button
            variant="outline"
            icon="sell"
            onClick={() => router.push(`/brands?id=${brand.id}`)}
          >
            {t.workspaceOpenBrand}
          </Button>
        </div>
      </section>

      <section className={styles.metaGrid}>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{t.workspaceBranchCountLabel}</span>
          <strong className={styles.metaValue}>{branches.length}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{t.workspaceAcceptedMetric}</span>
          <strong className={styles.metaValue}>{globalMetrics.accepted}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{t.workspacePendingMetric}</span>
          <strong className={styles.metaValue}>{globalMetrics.pending}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>{t.workspaceLaneMetric}</span>
          <strong className={styles.metaValue}>{globalMetrics.accepted}</strong>
          <p className={styles.metaHint}>{t.workspaceLaneMetricHint}</p>
        </article>
      </section>

      <div className={styles.shell}>
        <aside className={styles.rail}>
          <div className={styles.railHeader}>
            <h2 className={styles.railTitle}>{t.workspaceBranchesRailTitle}</h2>
            <p className={styles.railLead}>{t.workspaceBranchesRailLead}</p>
          </div>

          <div className={styles.branchList}>
            {branches.map((branchItem) => {
              const acceptedCount = branchItem.members.accepted.length;
              const pendingCount = branchItem.members.pending.length;

              return (
                <Button
                  variant="unstyled"
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
                    <span>{acceptedCount} {t.workspaceBranchMemberCount}</span>
                    <span>{pendingCount} {t.workspaceBranchPendingCount}</span>
                  </div>
                </Button>
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
                    {t.workspaceBranchLeadLabel}: {formatName(currentUser.first_name, currentUser.last_name)}
                  </Badge>
                </div>

                <div className={styles.branchHeroGrid}>
                  <div className={styles.branchFact}>
                    <span className={styles.branchFactLabel}>{t.workspaceAvailabilitySection}</span>
                    <strong className={styles.branchFactValue}>
                      {formatAvailability(activeBranch, t.workspaceAllDay)}
                    </strong>
                  </div>
                  <div className={styles.branchFact}>
                    <span className={styles.branchFactLabel}>{t.workspaceAddressLabel}</span>
                    <strong className={styles.branchFactValue}>
                      {formatAddress(activeBranch)}
                    </strong>
                  </div>
                  <div className={styles.branchFact}>
                    <span className={styles.branchFactLabel}>{t.workspaceContactLabel}</span>
                    <strong className={styles.branchFactValue}>
                      {activeBrandBranch?.phone || activeBrandBranch?.email || t.workspaceNoContact}
                    </strong>
                  </div>
                </div>
              </section>

              <section className={styles.banner}>
                <Icon icon="lan" size={16} color="current" />
                <p>{t.workspaceLiveState}</p>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>{t.workspaceInviteTitle}</h3>
                    <p className={styles.sectionLead}>{t.workspaceInviteDescription}</p>
                  </div>
                  <Badge variant="outline" icon="lan">
                    {t.workspaceLiveApiBadge}
                  </Badge>
                </div>

                <div className={styles.invitePanel}>
                  <Field className={styles.inviteField}>
                    <FieldLabel>{t.workspaceInviteSearchLabel}</FieldLabel>
                    <Input
                      value={searchQuery}
                      placeholder={t.workspaceInviteSearchPlaceholder}
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
                      {t.workspaceInviteSearchDescription}
                    </FieldDescription>
                  </Field>

                  {feedback ? (
                    <StatusBanner variant={feedback.tone === "success" ? "success" : "error"}>
                      {feedback.message}
                    </StatusBanner>
                  ) : null}

                  <div className={styles.searchState}>
                    {searchState === "loading"
                      ? t.workspaceSearchLoading
                      : searchState === "error"
                        ? t.workspaceSearchError
                        : deferredQuery.length < 2
                          ? t.workspaceSearchIdle
                          : searchResults.length === 0
                            ? t.workspaceSearchEmpty
                            : t.workspaceSearchReady}
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
                              {t.workspaceInviteAction}
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
                  <h3 className={styles.sectionTitle}>{t.workspaceAcceptedTitle}</h3>
                </div>

                {acceptedMembers.length === 0 ? (
                  <div className={styles.emptyCard}>{t.workspaceNoAccepted}</div>
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
                                  ? t.workspaceOwnerRole
                                  : t.workspaceMemberRole}
                              </Badge>
                              <Badge variant="outline">
                                {t.workspaceStatusAccepted}
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
                                {t.workspaceRemoveMember}
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
                  <h3 className={styles.sectionTitle}>{t.workspacePendingTitle}</h3>
                </div>

                {pendingMembers.length === 0 ? (
                  <div className={styles.emptyCard}>{t.workspaceNoPending}</div>
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
                                {t.workspaceMemberRole}
                              </Badge>
                              <Badge variant="outline">
                                {t.workspacePendingStatus}
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
                              {t.workspaceCancelInvite}
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
                  <h3 className={styles.sectionTitle}>{t.workspaceArchiveTitle}</h3>
                </div>

                {archivedMembers.length === 0 ? (
                  <div className={styles.emptyCard}>{t.workspaceNoArchive}</div>
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
                                {getStatusLabel(member.status, t)}
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
                                ? t.workspaceRestoreInvite
                                : t.workspaceReinviteMember}
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
                    <h3 className={styles.futureTitle}>{t.workspaceFutureTitle}</h3>
                    <p className={styles.futureDescription}>
                      {t.workspaceFutureDescription}
                    </p>
                  </div>
                </div>

                <div className={styles.futureList}>
                  <div className={styles.futureItem}>{t.workspaceFutureListOne}</div>
                  <div className={styles.futureItem}>{t.workspaceFutureListTwo}</div>
                  <div className={styles.futureItem}>{t.workspaceFutureListThree}</div>
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
