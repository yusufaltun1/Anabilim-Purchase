import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { 
  Role, 
  RoleResponse, 
  CreateRoleRequest, 
  UpdateRoleRequest 
} from '../types/role';

class RoleService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllRoles(): Promise<Role[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // API returns array directly instead of RoleResponse object
    return Array.isArray(data) ? data : [];
  }

  async getRoleById(id: number): Promise<Role> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }

    const data = await response.json();
    console.log('API Response for getRoleById:', data);
    
    // API returns role object directly instead of RoleResponse
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid role data received from API');
    }

    return data;
  }

  async getRoleByName(name: string): Promise<Role> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/name/${name}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch role by name');
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid role data received from API');
    }

    return data;
  }

  async getActiveRoles(): Promise<Role[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/active`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active roles');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getSystemRoles(): Promise<Role[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/system`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch system roles');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async createRole(role: CreateRoleRequest): Promise<Role> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(role),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create role');
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid role data received from API');
    }

    return data;
  }

  async updateRole(id: number, role: UpdateRoleRequest): Promise<Role> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(role),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update role');
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid role data received from API');
    }

    return data;
  }

  async deleteRole(id: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete role');
    }
  }

  async addPermissionToRole(roleId: number, permissionName: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/${roleId}/permissions?permissionName=${permissionName}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add permission to role');
    }
  }

  async removePermissionFromRole(roleId: number, permissionName: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/${roleId}/permissions?permissionName=${permissionName}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to remove permission from role');
    }
  }
}

export const roleService = new RoleService(); 