import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { Permission } from '../types/permission';

class PermissionService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAllPermissions(): Promise<Permission[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/permissions`, { headers: this.getHeaders() });
    if (!response.ok) throw new Error('Permissionlar alınamadı');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async createPermission(permission: Permission): Promise<Permission> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/permissions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(permission)
    });
    if (!response.ok) throw new Error('Permission oluşturulamadı');
    return response.json();
  }

  async deletePermission(id: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/permissions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Permission silinemedi');
  }
}

export const permissionService = new PermissionService();

