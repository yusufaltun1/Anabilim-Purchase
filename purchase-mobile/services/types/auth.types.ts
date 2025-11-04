export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
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

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userInfo: UserInfo;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}
