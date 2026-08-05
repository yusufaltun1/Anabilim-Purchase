import type {
  CreateRoleRequest,
  Role,
  UpdateRoleRequest,
} from '../types/role.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

export type { Role } from '../types/role.types';

function unwrapEntity(data: unknown): Role {
  if (data && typeof data === 'object' && 'data' in data && (data as { data: unknown }).data) {
    return (data as { data: Role }).data;
  }
  return data as Role;
}

function normalizeList(data: unknown): Role[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: Role[] }).data;
  }
  return [];
}

class RoleService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getAllRoles(token: string): Promise<Role[]> {
    const response = await fetch(`${this.baseUrl}/api/roles`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Roller yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getActiveRoles(token: string): Promise<Role[]> {
    const response = await fetch(`${this.baseUrl}/api/roles/active`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Aktif roller yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getSystemRoles(token: string): Promise<Role[]> {
    const response = await fetch(`${this.baseUrl}/api/roles/system`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Sistem rolleri yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getRoleById(id: number, token: string): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/api/roles/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Rol bulunamadı (${response.status})`
      );
    }
    const role = unwrapEntity(json);
    if (!role || typeof role !== 'object') {
      throw new Error('Geçersiz rol verisi alındı');
    }
    return role;
  }

  async getRoleByName(name: string, token: string): Promise<Role> {
    const response = await fetch(
      `${this.baseUrl}/api/roles/name/${encodeURIComponent(name)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Rol bulunamadı (${response.status})`
      );
    }
    const role = unwrapEntity(json);
    if (!role || typeof role !== 'object') {
      throw new Error('Geçersiz rol verisi alındı');
    }
    return role;
  }

  async createRole(role: CreateRoleRequest, token: string): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/api/roles`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(role),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Rol oluşturulamadı (${response.status})`
      );
    }
    const created = unwrapEntity(json);
    if (!created || typeof created !== 'object') {
      throw new Error('Geçersiz rol verisi alındı');
    }
    return created;
  }

  async updateRole(id: number, role: UpdateRoleRequest, token: string): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/api/roles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(role),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (json as { message?: string })?.message || `Rol güncellenemedi (${response.status})`
      );
    }
    const updated = unwrapEntity(json);
    if (!updated || typeof updated !== 'object') {
      throw new Error('Geçersiz rol verisi alındı');
    }
    return updated;
  }

  async deleteRole(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/roles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string })?.message || `Rol silinemedi (${response.status})`
      );
    }
  }

  async addPermissionToRole(
    roleId: number,
    permissionName: string,
    token: string
  ): Promise<void> {
    const qs = `permissionName=${encodeURIComponent(permissionName)}`;
    const response = await fetch(
      `${this.baseUrl}/api/roles/${roleId}/permissions?${qs}`,
      { method: 'POST', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string })?.message ||
          `Permission atanamadı (${response.status})`
      );
    }
  }

  async removePermissionFromRole(
    roleId: number,
    permissionName: string,
    token: string
  ): Promise<void> {
    const qs = `permissionName=${encodeURIComponent(permissionName)}`;
    const response = await fetch(
      `${this.baseUrl}/api/roles/${roleId}/permissions?${qs}`,
      { method: 'DELETE', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string })?.message ||
          `Permission kaldırılamadı (${response.status})`
      );
    }
  }
}

export const roleService = new RoleService();
