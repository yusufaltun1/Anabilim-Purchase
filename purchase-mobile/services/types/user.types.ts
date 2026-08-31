import type { Location } from './location.types';

export type UserManagerRef = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  roles: string[];
  fullName?: string;
  workLocation?: string;
  workLocationParentId?: number | null;
  workLocationChildId?: number | null;
  workLocationName?: string;
  schoolId?: number | null;
  schoolName?: string;
  userGroupNames?: string[];
  isActive?: boolean;
  active?: boolean;
  manager?: UserManagerRef | null;
  microsoft365Id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserRequest = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  position: string;
  roles: string[];
  manager?: { id: number };
};

export type UpdateUserRequest = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  position: string;
  roles: string[];
  manager?: { id: number } | null;
  schoolId?: number | null;
  schoolTouched?: boolean;
  workLocationParentId?: number | null;
  workLocationChildId?: number | null;
  workLocationHierarchyTouched?: boolean;
  isActive?: boolean;
};

export type UserFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  position: string;
  roles: string[];
  managerId: number | null;
  schoolId: number | null;
  workLocationLevel1Id: number | null;
  workLocationLevel2Id: number | null;
  workLocationLevel3Id: number | null;
  isActive: boolean;
};

export function emptyUserForm(): UserFormValues {
  return {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    position: '',
    roles: [],
    managerId: null,
    schoolId: null,
    workLocationLevel1Id: null,
    workLocationLevel2Id: null,
    workLocationLevel3Id: null,
    isActive: true,
  };
}

function normalizePlaceholder(value?: string | null): string {
  if (!value) return '';
  return value.trim().toLowerCase() === 'unknown' ? '' : value;
}

export function userDisplayName(user: {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  id?: number;
  name?: string;
}): string {
  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.name ||
    user.email ||
    (user.id != null ? `Kullanıcı #${user.id}` : 'Kullanıcı')
  );
}

export function isUserActive(user: { isActive?: boolean; active?: boolean }): boolean {
  if (typeof user.isActive === 'boolean') return user.isActive;
  if (typeof user.active === 'boolean') return user.active;
  return true;
}

export function mapApiToUser(raw: unknown): User {
  const u = (raw ?? {}) as Record<string, unknown> & {
    manager?: UserManagerRef | null;
    roles?: string[];
    name?: string;
  };
  const id = Number(u.id);
  const firstName = String(u.firstName ?? '');
  const lastName = String(u.lastName ?? '');
  const email = String(u.email ?? '');
  const roles = Array.isArray(u.roles) ? u.roles.map(String) : [];
  const isActive =
    typeof u.isActive === 'boolean'
      ? u.isActive
      : typeof u.active === 'boolean'
        ? u.active
        : true;

  return {
    id,
    email,
    firstName,
    lastName,
    department: normalizePlaceholder(typeof u.department === 'string' ? u.department : ''),
    position: normalizePlaceholder(typeof u.position === 'string' ? u.position : ''),
    phone: String(u.phone ?? ''),
    roles,
    fullName: userDisplayName({
      firstName,
      lastName,
      fullName: typeof u.fullName === 'string' ? u.fullName : undefined,
      email,
      id,
      name: typeof u.name === 'string' ? u.name : undefined,
    }),
    workLocation: typeof u.workLocation === 'string' ? u.workLocation : undefined,
    workLocationParentId:
      u.workLocationParentId === null || u.workLocationParentId === undefined
        ? null
        : Number(u.workLocationParentId),
    workLocationChildId:
      u.workLocationChildId === null || u.workLocationChildId === undefined
        ? null
        : Number(u.workLocationChildId),
    workLocationName: typeof u.workLocationName === 'string' ? u.workLocationName : undefined,
    schoolId:
      u.schoolId === null || u.schoolId === undefined ? null : Number(u.schoolId),
    schoolName: typeof u.schoolName === 'string' ? u.schoolName : undefined,
    userGroupNames: Array.isArray(u.userGroupNames)
      ? u.userGroupNames.filter((name): name is string => typeof name === 'string')
      : undefined,
    isActive,
    active: isActive,
    manager:
      u.manager?.id != null
        ? {
            ...u.manager,
            id: Number(u.manager.id),
          }
        : null,
    microsoft365Id: typeof u.microsoft365Id === 'string' ? u.microsoft365Id : undefined,
    createdAt: typeof u.createdAt === 'string' ? u.createdAt : undefined,
    updatedAt: typeof u.updatedAt === 'string' ? u.updatedAt : undefined,
  };
}

/** workLocationParentId + childId → 3 seviyeli picker değerleri */
export function resolveUserWorkLocationLevels(
  locations: Location[],
  parentId: number | null | undefined,
  childId: number | null | undefined
): { level1Id: number | null; level2Id: number | null; level3Id: number | null } {
  const rootId = parentId ?? null;
  const leafOrMiddle = childId ?? null;
  if (!rootId && !leafOrMiddle) {
    return { level1Id: null, level2Id: null, level3Id: null };
  }
  if (!leafOrMiddle) {
    return { level1Id: rootId, level2Id: null, level3Id: null };
  }

  const byId = new Map(locations.map((l) => [l.id, l]));
  const chain: number[] = [];
  let current = byId.get(leafOrMiddle);
  while (current) {
    chain.unshift(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  if (chain.length === 1) {
    return { level1Id: chain[0], level2Id: null, level3Id: null };
  }
  if (chain.length === 2) {
    return { level1Id: chain[0], level2Id: chain[1], level3Id: null };
  }
  return { level1Id: chain[0], level2Id: chain[1], level3Id: chain[2] };
}

export function resolveUserWorkLocationPayload(
  level1Id: number | null,
  level2Id: number | null,
  level3Id: number | null
): { workLocationParentId: number | null; workLocationChildId: number | null } {
  return {
    workLocationParentId: level1Id,
    workLocationChildId: level3Id ?? level2Id ?? null,
  };
}

export function userToForm(
  user: User,
  locationLevels?: { level1Id: number | null; level2Id: number | null; level3Id: number | null }
): UserFormValues {
  return {
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    department: user.department || '',
    position: user.position || '',
    roles: user.roles ?? [],
    managerId: user.manager?.id ?? null,
    schoolId: user.schoolId ?? null,
    workLocationLevel1Id: locationLevels?.level1Id ?? null,
    workLocationLevel2Id: locationLevels?.level2Id ?? null,
    workLocationLevel3Id: locationLevels?.level3Id ?? null,
    isActive: isUserActive(user),
  };
}

export function validateUserForm(
  values: UserFormValues
): { ok: true } | { ok: false; message: string } {
  if (!values.email.trim()) {
    return { ok: false, message: 'E-posta zorunludur' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return { ok: false, message: 'Geçerli bir e-posta girin' };
  }
  if (!values.firstName.trim()) {
    return { ok: false, message: 'Ad zorunludur' };
  }
  if (!values.lastName.trim()) {
    return { ok: false, message: 'Soyad zorunludur' };
  }
  if (!values.phone.trim()) {
    return { ok: false, message: 'Telefon zorunludur' };
  }
  if (!values.department.trim()) {
    return { ok: false, message: 'Departman zorunludur' };
  }
  if (!values.position.trim()) {
    return { ok: false, message: 'Pozisyon zorunludur' };
  }
  if (!values.roles.length) {
    return { ok: false, message: 'En az bir rol seçilmelidir' };
  }
  return { ok: true };
}
