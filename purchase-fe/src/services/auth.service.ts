import { API_CONFIG } from '../config/api.config';

interface UserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  department: string;
  position: string;
  roles: string[];
  permissions: string[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userInfo: UserInfo;
  };
  timestamp: string;
  errorCode: string | null;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    
    // Store authentication data
    localStorage.setItem('access_token', data.data.token);
    localStorage.setItem('refresh_token', data.data.refreshToken);
    localStorage.setItem('user_info', JSON.stringify(data.data.userInfo));
    localStorage.setItem('token_expires_in', data.data.expiresIn.toString());
    
    return data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('token_expires_in');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  getCurrentUser(): any {
    const userInfo = this.getUserInfo();
    return userInfo ? {
      id: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName
    } : null;
  }
}; 