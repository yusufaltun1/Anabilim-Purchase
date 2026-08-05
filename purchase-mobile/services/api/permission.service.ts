import type { CreatePermissionRequest, Permission } from '../types/permission.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

function unwrapEntity(data: unknown): Permission {
  if (data && typeof data === 'object' && 'data' in data && (data as { data: unknown }).data) {
    return (data as { data: Permission }).data;
  }
  return data as Permission;
}

function normalizeList(data: unknown): Permission[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: Permission[] }).data;
  }
  return [];
}

class PermissionService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getAllPermissions(token: string): Promise<Permission[]> {
    const response = await fetch(`${this.baseUrl}/api/permissions`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Permissionlar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async createPermission(
    permission: CreatePermissionRequest | Permission,
    token: string
  ): Promise<Permission> {
    const response = await fetch(`${this.baseUrl}/api/permissions`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(permission),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message ||
          `Permission oluşturulamadı (${response.status})`
      );
    }
    return unwrapEntity(json);
  }

  async deletePermission(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/permissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string })?.message ||
          `Permission silinemedi (${response.status})`
      );
    }
  }
}

export const permissionService = new PermissionService();
