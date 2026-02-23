import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import type {
  UserGroup,
  UserGroupLink,
  CreateUserGroupRequest,
  UpdateUserGroupRequest,
  CreateUserGroupLinkRequest,
  UserGroupMembersRequest,
  WhiteboardData,
  UpdateGroupPositionsRequest,
} from '../types/user-group';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class UserGroupService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getWhiteboardData(): Promise<WhiteboardData> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/whiteboard`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Whiteboard verisi alınamadı');
    const json: ApiResponse<WhiteboardData> = await res.json();
    return json.data;
  }

  async getAllGroups(): Promise<UserGroup[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Gruplar alınamadı');
    const json: ApiResponse<UserGroup[]> = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  async getGroupById(id: number): Promise<UserGroup> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Grup alınamadı');
    const json: ApiResponse<UserGroup> = await res.json();
    return json.data;
  }

  async createGroup(dto: CreateUserGroupRequest): Promise<UserGroup> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Grup oluşturulamadı');
    }
    const json: ApiResponse<UserGroup> = await res.json();
    return json.data;
  }

  async updateGroup(id: number, dto: UpdateUserGroupRequest): Promise<UserGroup> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Grup güncellenemedi');
    const json: ApiResponse<UserGroup> = await res.json();
    return json.data;
  }

  async updateGroupPosition(id: number, positionX: number, positionY: number): Promise<UserGroup> {
    const params = new URLSearchParams({ positionX: String(positionX), positionY: String(positionY) });
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/${id}/position?${params}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Pozisyon güncellenemedi');
    const json: ApiResponse<UserGroup> = await res.json();
    return json.data;
  }

  async updateGroupPositions(dto: UpdateGroupPositionsRequest): Promise<void> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/positions`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Pozisyonlar kaydedilemedi');
  }

  async deleteGroup(id: number): Promise<void> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Grup silinemedi');
  }

  async getAllLinks(): Promise<UserGroupLink[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/links`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Bağlantılar alınamadı');
    const json: ApiResponse<UserGroupLink[]> = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  async createLink(dto: CreateUserGroupLinkRequest): Promise<UserGroupLink> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/links`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Bağlantı oluşturulamadı');
    const json: ApiResponse<UserGroupLink> = await res.json();
    return json.data;
  }

  async deleteLink(linkId: number): Promise<void> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/links/${linkId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Bağlantı silinemedi');
  }

  async setGroupMembers(dto: UserGroupMembersRequest): Promise<UserGroup> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/user-groups/members`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Üyeler güncellenemedi');
    const json: ApiResponse<UserGroup> = await res.json();
    return json.data;
  }
}

export const userGroupService = new UserGroupService();
