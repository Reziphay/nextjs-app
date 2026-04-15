import type { Brand } from "@/types/brand";
import type { AuthenticatedUser } from "@/types";

export type TeamMemberStatus =
  | "accepted"
  | "pending"
  | "rejected"
  | "removed";

export type TeamMemberRole = "owner" | "member";

export type TeamMemberRecord = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  invited_at: string;
  invited_by_user_id: string;
};

export type BranchTeamRecord = {
  branch_id: string;
  members: TeamMemberRecord[];
};

export type BrandTeamWorkspaceState = {
  version: 1;
  updated_at: string;
  branches: Record<string, BranchTeamRecord>;
};

const STORAGE_PREFIX = "rzp-team-workspace:v1:";

function createOwnerMember(
  branchId: string,
  owner: Pick<
    AuthenticatedUser,
    "id" | "first_name" | "last_name" | "email" | "avatar_url"
  >,
): TeamMemberRecord {
  return {
    id: `${branchId}:owner:${owner.id}`,
    user_id: owner.id,
    first_name: owner.first_name,
    last_name: owner.last_name,
    email: owner.email,
    avatar_url: owner.avatar_url ?? null,
    role: "owner",
    status: "accepted",
    invited_at: new Date().toISOString(),
    invited_by_user_id: owner.id,
  };
}

function ensureOwnerMember(
  branchId: string,
  members: TeamMemberRecord[],
  owner: Pick<
    AuthenticatedUser,
    "id" | "first_name" | "last_name" | "email" | "avatar_url"
  >,
) {
  const ownerMember = createOwnerMember(branchId, owner);
  const nextMembers = members.filter((member) => member.user_id !== owner.id);

  return [ownerMember, ...nextMembers];
}

function isWorkspaceState(value: unknown): value is BrandTeamWorkspaceState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeState = value as Partial<BrandTeamWorkspaceState>;
  return maybeState.version === 1 && Boolean(maybeState.branches);
}

function getStorageKey(brandId: string) {
  return `${STORAGE_PREFIX}${brandId}`;
}

export function createSeedBrandTeamWorkspace(
  brand: Pick<Brand, "branches"> & { id: string },
  owner: Pick<
    AuthenticatedUser,
    "id" | "first_name" | "last_name" | "email" | "avatar_url"
  >,
): BrandTeamWorkspaceState {
  const branches = Object.fromEntries(
    (brand.branches ?? []).map((branch) => [
      branch.id,
      {
        branch_id: branch.id,
        members: [createOwnerMember(branch.id, owner)],
      } satisfies BranchTeamRecord,
    ]),
  );

  return {
    version: 1,
    updated_at: new Date().toISOString(),
    branches,
  };
}

export function mergeBrandTeamWorkspace(
  brand: Pick<Brand, "branches"> & { id: string },
  owner: Pick<
    AuthenticatedUser,
    "id" | "first_name" | "last_name" | "email" | "avatar_url"
  >,
  snapshot?: BrandTeamWorkspaceState | null,
): BrandTeamWorkspaceState {
  const seed = createSeedBrandTeamWorkspace(brand, owner);

  if (!snapshot) {
    return seed;
  }

  const branches = Object.fromEntries(
    (brand.branches ?? []).map((branch) => {
      const savedBranch = snapshot.branches[branch.id];
      const mergedMembers = ensureOwnerMember(
        branch.id,
        savedBranch?.members ?? [],
        owner,
      );

      return [
        branch.id,
        {
          branch_id: branch.id,
          members: mergedMembers,
        } satisfies BranchTeamRecord,
      ];
    }),
  );

  return {
    version: 1,
    updated_at: snapshot.updated_at ?? seed.updated_at,
    branches,
  };
}

export function readBrandTeamWorkspace(
  brand: Pick<Brand, "branches"> & { id: string },
  owner: Pick<
    AuthenticatedUser,
    "id" | "first_name" | "last_name" | "email" | "avatar_url"
  >,
): BrandTeamWorkspaceState {
  if (typeof window === "undefined") {
    return createSeedBrandTeamWorkspace(brand, owner);
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(brand.id));
    if (!raw) {
      return createSeedBrandTeamWorkspace(brand, owner);
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isWorkspaceState(parsed)) {
      return createSeedBrandTeamWorkspace(brand, owner);
    }

    return mergeBrandTeamWorkspace(brand, owner, parsed);
  } catch {
    return createSeedBrandTeamWorkspace(brand, owner);
  }
}

export function writeBrandTeamWorkspace(
  brandId: string,
  state: BrandTeamWorkspaceState,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(brandId),
      JSON.stringify({
        ...state,
        updated_at: new Date().toISOString(),
      } satisfies BrandTeamWorkspaceState),
    );
  } catch {
    // Ignore storage write failures and keep the UI responsive.
  }
}
