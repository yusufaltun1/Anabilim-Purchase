import {
  mapApiToUser,
  type CreateUserRequest,
  type UpdateUserRequest,
  type User,
} from '../types/user.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

type UpdateExpoPushTokenRequest = {
  token: string;
};

/** @deprecated Prefer User from user.types — kept for transfer/assignment callers */
export type ActiveUser = User;

function unwrapUserList(data: unknown): User[] {
  const list: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { data?: unknown })?.data)
      ? ((data as { data: unknown[] }).data)
      : Array.isArray((data as { content?: unknown })?.content)
        ? ((data as { content: unknown[] }).content)
        : [];
  return list.map(mapApiToUser);
}

function unwrapUser(data: unknown): User {
  if (data && typeof data === 'object' && 'data' in data) {
    const nested = (data as { data?: unknown }).data;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return mapApiToUser(nested);
    }
  }
  return mapApiToUser(data);
}

class UserService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getActiveUsers(token: string): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/active`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        const list = unwrapUserList(data);
        if (list.length) return list;
      }
    } catch {
      // fallback below
    }
    return this.getAllUsers(token);
  }

  async getAllUsers(token: string): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/api/users`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Kullanıcılar yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapUserList(data);
  }

  async getUserById(id: number, token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Kullanıcı yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapUser(data);
  }

  async createUser(payload: CreateUserRequest, token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/users`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Kullanıcı oluşturulamadı (${response.status})`
      );
    }
    return unwrapUser(data);
  }

  async updateUser(id: number, payload: UpdateUserRequest, token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Kullanıcı güncellenemedi (${response.status})`
      );
    }
    return unwrapUser(data);
  }

  async deleteUser(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || `Kullanıcı silinemedi (${response.status})`
      );
    }
  }

  async updateExpoPushToken(token: string, authToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/users/me/expo-push-token`, {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify({ token } satisfies UpdateExpoPushTokenRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message || 'Failed to update push token'
      );
    }
  }
}

export const userService = new UserService();
