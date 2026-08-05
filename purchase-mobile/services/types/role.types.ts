export type Role = {
  id?: number;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Backend RoleDto */
  permissionNames?: string[];
  /** Alternatif alan adı */
  permissions?: string[];
};

export type CreateRoleRequest = {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
};

export type UpdateRoleRequest = CreateRoleRequest & {
  id: number;
};

export type RoleFormValues = {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
};

export type RoleFilter = 'all' | 'active' | 'system' | 'custom';

export function emptyRoleForm(): RoleFormValues {
  return {
    name: '',
    displayName: '',
    description: '',
    isActive: true,
    isSystemRole: false,
  };
}

export function getRolePermissionNames(role: Role): string[] {
  return role.permissionNames ?? role.permissions ?? [];
}

export function validateRoleForm(values: RoleFormValues): { ok: true } | { ok: false; message: string } {
  if (!values.name.trim()) {
    return { ok: false, message: 'Rol adı gereklidir' };
  }
  if (!values.displayName.trim()) {
    return { ok: false, message: 'Görünen ad gereklidir' };
  }
  if (!values.description.trim()) {
    return { ok: false, message: 'Açıklama gereklidir' };
  }
  if (!/^[A-Z_]+$/.test(values.name.trim())) {
    return {
      ok: false,
      message: 'Rol adı sadece büyük harfler ve alt çizgi içerebilir (örn: TEST_ROLE)',
    };
  }
  return { ok: true };
}
