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

export function hasUsoRole(user: User): boolean {
  return user.roles.some((r) => r.role === 'USO');
}

export function hasUcrRole(user: User): boolean {
  return user.roles.some((r) => r.role === 'UCR');
}

export function isProfileComplete(user: User): boolean {
  return Boolean(user.fullName && user.email);
}
