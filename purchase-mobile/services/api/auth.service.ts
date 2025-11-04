import { LoginRequest, LoginResponse } from '../types/auth.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

class AuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Token'ı temizle, local storage'dan kaldır
    // Bu implementasyon storage service'e bağlı olacak
  }
}

export const authService = new AuthService();
