export interface LoginRequest {
  email: string;
  password: string;
}

export interface MicrosoftLoginRequest {
  accessToken: string;
  microsoftId: string;
  email: string;
  name: string;
}

export interface UserInfo {
  id: number;
  email: string;
  displayName: string;
  // Bu alanlar null olabilir
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  position: string | null;
  roles: string[] | null;
  permissions: string[] | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    // refreshToken null olabilir
    refreshToken: string | null;
    tokenType: string;
    expiresIn: number | null;
    userInfo: UserInfo;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  // refreshToken null olabilir
  refreshToken: string | null;
  isLoading: boolean;
}
