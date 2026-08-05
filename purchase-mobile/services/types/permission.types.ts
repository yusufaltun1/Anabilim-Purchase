export type Permission = {
  id?: number;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePermissionRequest = {
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
};

export function emptyPermissionForm(): CreatePermissionRequest {
  return {
    name: '',
    displayName: '',
    description: '',
    resource: '',
    action: '',
    isActive: true,
  };
}

export function validatePermissionForm(
  values: CreatePermissionRequest
): { ok: true } | { ok: false; message: string } {
  if (!values.name.trim()) {
    return { ok: false, message: 'Permission adı gereklidir' };
  }
  if (!values.displayName.trim()) {
    return { ok: false, message: 'Görünen ad gereklidir' };
  }
  if (!values.resource.trim()) {
    return { ok: false, message: 'Resource gereklidir' };
  }
  if (!values.action.trim()) {
    return { ok: false, message: 'Action gereklidir' };
  }
  if (!values.description.trim()) {
    return { ok: false, message: 'Açıklama gereklidir' };
  }
  return { ok: true };
}
