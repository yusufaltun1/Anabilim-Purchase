import { authService } from '@/services/api/auth.service';
import { registerDeviceForPushNotifications } from '@/services/notifications/push-token.service';
import { storageService } from '@/services/storage/storage.service';
import { AuthState, LoginRequest, UserInfo, MicrosoftLoginRequest } from '@/services/types/auth.types';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  loginWithMicrosoft?: (data: MicrosoftLoginRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserInfo; token: string; refreshToken: string | null } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { user: UserInfo; token: string; refreshToken: string | null } }
  | { type: 'REFRESH_FAILURE' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REFRESH_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
      };
    
    case 'LOGIN_FAILURE':
    case 'REFRESH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Uygulama başladığında kayıtlı auth bilgilerini kontrol et
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [token, refreshToken, userInfo] = await Promise.all([
          storageService.getAuthToken(),
          storageService.getRefreshToken(),
          storageService.getUserInfo(),
        ]);

        if (token && userInfo) { // refreshToken zorunlu değil
          dispatch({
            type: 'REFRESH_SUCCESS',
            payload: { user: userInfo, token, refreshToken },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token, refreshToken, userInfo } = response.data;
        
        // Auth bilgilerini storage'a kaydet
        await storageService.saveAuthData(token, refreshToken, userInfo);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: userInfo, token, refreshToken },
        });
        void registerDeviceForPushNotifications(token);
      } else {
        throw new Error(response.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const loginWithMicrosoft = async (data: MicrosoftLoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.verifyMicrosoftToken(data);

      if (response.success) {
        const { token, refreshToken, userInfo } = response.data;
        await storageService.saveAuthData(token, refreshToken, userInfo);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: userInfo, token, refreshToken },
        });
        void registerDeviceForPushNotifications(token);
      } else {
        throw new Error(response.message || 'Microsoft ile giriş başarısız');
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storageService.clearAuthData();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile logout yap
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshAuth = async () => {
    // Refresh token yoksa işlemi sessizce atla
    if (!state.refreshToken) {
      return;
    }

    try {
      dispatch({ type: 'REFRESH_START' });
      
      const response = await authService.refreshToken(state.refreshToken);
      
      if (response.success) {
        const { token, refreshToken, userInfo } = response.data;
        
        // Yeni auth bilgilerini storage'a kaydet
        await storageService.saveAuthData(token, refreshToken, userInfo);
        
        dispatch({
          type: 'REFRESH_SUCCESS',
          payload: { user: userInfo, token, refreshToken },
        });
        void registerDeviceForPushNotifications(token);
      } else {
        throw new Error(response.message || 'Token yenileme başarısız');
      }
    } catch (error) {
      console.error('Refresh auth error:', error);
      dispatch({ type: 'REFRESH_FAILURE' });
      // Refresh başarısız olursa logout yap
      await logout();
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAuth,
    loginWithMicrosoft,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
