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

export type AppCapability =
  | 'REQUEST_CREATE'
  | 'REQUEST_EDIT'
  | 'REQUEST_VIEW'
  | 'REQUEST_APPROVE'
  | 'QUOTE_COLLECT'
  | 'COUNTER_OFFER'
  | 'ORDER_CREATE'
  | 'REQUEST_CLOSE'
  | 'SYSTEM_MANAGE'
  | 'INVENTORY_VIEW'
  | 'INVENTORY_MANAGE';

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

interface MicrosoftLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      fullName: string;
      microsoftId: string;
    };
  };
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

  getPerspectiveRole(): string | null {
    return localStorage.getItem('perspective_role');
  },

  setPerspectiveRole(role: string | null) {
    if (role) {
      localStorage.setItem('perspective_role', role);
    } else {
      localStorage.removeItem('perspective_role');
    }
  },

  getEffectiveUserInfo(): UserInfo | null {
    const userInfo = this.getUserInfo();
    if (!userInfo) return null;
    const perspectiveRole = this.getPerspectiveRole();
    if (!perspectiveRole) return userInfo;
    return {
      ...userInfo,
      roles: [perspectiveRole]
    };
  },

  getEffectiveRoles(): string[] {
    return this.getEffectiveUserInfo()?.roles || [];
  },

  hasCapability(capability: AppCapability): boolean {
    const userInfo = this.getUserInfo();
    const roles = this.getEffectiveRoles();
    const permissions = userInfo?.permissions || [];

    // Tüm kullanıcılarda talep açma yetkisi var
    if (capability === 'REQUEST_CREATE') return this.isAuthenticated();
    if (capability === 'REQUEST_VIEW') return this.isAuthenticated();

    const hasRole = (allowed: string[]) => roles.some(r => allowed.includes(r));
    switch (capability) {
      case 'REQUEST_EDIT':
        return permissions.includes('REQUEST_UPDATE') || permissions.includes('REQUEST_EDIT');
      case 'REQUEST_APPROVE':
        return hasRole([
          'MUDUR', 'MUDUR_YARDIMCISI', 'IDARI_YONETIM_MUDURU',
          'SERKAN_BEY', 'BOLUM_BASKANI', 'KAMPUS_MUDURU',
          'SEDA_HANIM', 'SATIN_ALMA_DEPARTMANI', 'BILGI_ISLEM_DEPARTMANI',
          'SYSTEM_ADMIN', 'MANAGER', 'PURCHASE_MANAGER'
        ]) || permissions.includes('APPROVAL_APPROVE');
      case 'COUNTER_OFFER':
        return hasRole(['SERKAN_BEY', 'BILGI_ISLEM_DEPARTMANI', 'SYSTEM_ADMIN']);
      case 'QUOTE_COLLECT':
      case 'ORDER_CREATE':
      case 'REQUEST_CLOSE':
        return hasRole(['SATIN_ALMA_DEPARTMANI', 'BILGI_ISLEM_DEPARTMANI', 'SYSTEM_ADMIN', 'PURCHASE_MANAGER']);
      case 'SYSTEM_MANAGE':
        return hasRole(['BILGI_ISLEM_DEPARTMANI', 'SYSTEM_ADMIN']);
      case 'INVENTORY_VIEW':
        return (
          permissions.includes('INVENTORY_READ') ||
          permissions.includes('INVENTORY_UPDATE') ||
          hasRole([
            'SATIN_ALMA_DEPARTMANI',
            'BILGI_ISLEM_DEPARTMANI',
            'SYSTEM_ADMIN',
            'PURCHASE_MANAGER',
            'MANAGER',
          ])
        );
      case 'INVENTORY_MANAGE':
        return (
          permissions.includes('INVENTORY_UPDATE') ||
          hasRole(['SATIN_ALMA_DEPARTMANI', 'BILGI_ISLEM_DEPARTMANI', 'SYSTEM_ADMIN', 'PURCHASE_MANAGER'])
        );
      default:
        return false;
    }
  },

  isRealSystemAdmin(): boolean {
    const roles = this.getUserInfo()?.roles || [];
    return roles.includes('SYSTEM_ADMIN') || roles.includes('BILGI_ISLEM_DEPARTMANI');
  },

  getCurrentUser(): any {
    const userInfo = this.getUserInfo();
    return userInfo ? {
      id: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName
    } : null;
  },

  async microsoftLogin(): Promise<void> {
    // Microsoft OAuth2 login sayfasına yönlendir
    // Backend'de redirect URI: http://localhost:3000/auth/microsoft/callback olarak ayarlanmalı
    const microsoftAuthUrl = `${API_CONFIG.BASE_URL}/oauth2/authorization/microsoft`;
    window.location.href = microsoftAuthUrl;
  },

  async handleMicrosoftCallback(): Promise<MicrosoftLoginResponse> {
    // URL'den authorization code'u al
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (!code) {
      throw new Error('Authorization code not found');
    }

    // Doğru endpoint'e code gönder
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/microsoft/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Microsoft login failed');
    }

    const data: MicrosoftLoginResponse = await response.json();
    
    // Store authentication data
    localStorage.setItem('access_token', data.data.token);
    localStorage.setItem('user_info', JSON.stringify(data.data.user));
    
    return data;
  }
}; 