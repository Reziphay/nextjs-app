export type UserRole = 'UCR' | 'USO';
export type AppRole = 'UCR' | 'USO' | 'ADMIN';

export type UserRoleItem = {
  role: AppRole;
  id: string;
};

export type User = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  phoneVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  activeRole: AppRole;
  roles: UserRoleItem[];
  isNewUser: boolean;
  avatarUrl: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toAppRole(value: unknown): AppRole | null {
  return value === 'UCR' || value === 'USO' || value === 'ADMIN' ? value : null;
}

function normalizeRoles(value: unknown, fallbackRole: AppRole): UserRoleItem[] {
  if (!Array.isArray(value)) {
    return [{ id: fallbackRole, role: fallbackRole }];
  }

  const roles = value
    .map((item) => {
      if (typeof item === 'string') {
        const role = toAppRole(item);
        return role ? { id: role, role } : null;
      }

      if (!isRecord(item)) return null;

      const role = toAppRole(item.role);
      if (!role) return null;

      return {
        id: typeof item.id === 'string' && item.id.trim() ? item.id : role,
        role,
      };
    })
    .filter((item): item is UserRoleItem => item !== null);

  return roles.length > 0 ? roles : [{ id: fallbackRole, role: fallbackRole }];
}

export function normalizeUser(payload: unknown): User | null {
  if (!isRecord(payload)) return null;

  const fallbackRole = toAppRole(payload.activeRole) ?? 'UCR';
  const roles = normalizeRoles(payload.roles, fallbackRole);
  const activeRole = toAppRole(payload.activeRole) ?? roles[0]?.role ?? 'UCR';
  const id = typeof payload.id === 'string' ? payload.id : null;
  const phone = typeof payload.phone === 'string' ? payload.phone : null;

  if (!id || !phone) return null;

  return {
    id,
    fullName: typeof payload.fullName === 'string' ? payload.fullName : '',
    email: typeof payload.email === 'string' ? payload.email : null,
    phone,
    phoneVerifiedAt:
      typeof payload.phoneVerifiedAt === 'string' ? payload.phoneVerifiedAt : null,
    emailVerifiedAt:
      typeof payload.emailVerifiedAt === 'string' ? payload.emailVerifiedAt : null,
    activeRole,
    roles,
    isNewUser: typeof payload.isNewUser === 'boolean' ? payload.isNewUser : false,
    avatarUrl: typeof payload.avatarUrl === 'string' ? payload.avatarUrl : null,
  };
}

export function hasUsoRole(user: User): boolean {
  return user.roles.some((r) => r.role === 'USO');
}

export function hasUcrRole(user: User): boolean {
  return user.roles.some((r) => r.role === 'UCR');
}

export function isProfileComplete(user: User): boolean {
  return Boolean(user.fullName && user.email);
}
