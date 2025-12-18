import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';
import { authService } from '../services/auth.service';
import { API_CONFIG } from '../config/api.config';
import { loginRequest } from '../config/msalConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  user: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { instance, accounts } = useMsal();

  const verifyMicrosoftToken = async (activeAccount: any) => {
    console.log('🔄 AuthContext - verifyMicrosoftToken called');
    try {
      const tokenResult = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/microsoft/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: tokenResult.accessToken,
          microsoftId: activeAccount.localAccountId,
          email: activeAccount.username,
          name: activeAccount.name || activeAccount.idTokenClaims?.name || activeAccount.username
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Microsoft token verification failed');
      }

      const data = await response.json();
      if (data?.data?.token) {
        localStorage.setItem('access_token', data.data.token);
      }
      if (data?.data?.userInfo) {
        localStorage.setItem('user_info', JSON.stringify(data.data.userInfo));
        setUser(data.data.userInfo);
      }
    } catch (err) {
      console.error('❌ AuthContext - verifyMicrosoftToken error:', err);
      throw err;
    }
  };

  useEffect(() => {
    const callbackId = instance.addEventCallback(async (event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload && 'account' in event.payload) {
        const account = event.payload.account;
        try {
          await verifyMicrosoftToken(account);
          window.location.href = '/dashboard';
        } catch (err) {
          console.error('❌ AuthContext - verify after login error:', err);
        }
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  // Check authentication status on mount and whenever accounts change
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 AuthContext - checkAuthStatus called');
      console.log('🔍 AuthContext - accounts.length:', accounts.length);
      console.log('🔍 AuthContext - activeAccount:', !!instance.getActiveAccount());
      console.log('🔍 AuthContext - getAllAccounts:', instance.getAllAccounts().length);
      
      try {
        // Check MSAL authentication first - try both accounts and getAllAccounts
        const allAccounts = instance.getAllAccounts();
        const hasAccounts = accounts.length > 0 || allAccounts.length > 0;
        
        console.log('🔍 AuthContext - hasAccounts:', hasAccounts);
        
        if (hasAccounts) {
          let activeAccount = instance.getActiveAccount();
          
          // If no active account but we have accounts, set the first one
          if (!activeAccount && allAccounts.length > 0) {
            console.log('🔄 AuthContext - Setting first account as active');
            instance.setActiveAccount(allAccounts[0]);
            activeAccount = allAccounts[0];
          }
          
          console.log('🔍 AuthContext - activeAccount details:', activeAccount);
          
          if (activeAccount) {
            console.log('✅ AuthContext - MSAL authentication found, verifying with backend');
            try {
              if (!localStorage.getItem('access_token')) {
                await verifyMicrosoftToken(activeAccount);
              } else {
                const cachedUser = localStorage.getItem('user_info');
                if (cachedUser) {
                  setUser(JSON.parse(cachedUser));
                } else {
                  setUser(activeAccount);
                }
              }
              setIsAuthenticated(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Microsoft doğrulaması başarısız');
              setIsAuthenticated(false);
            } finally {
              setIsLoading(false);
            }

            return;
          }
        }

        // Check traditional auth as fallback
        const traditionalAuth = authService.isAuthenticated();
        console.log('🔍 AuthContext - traditionalAuth:', traditionalAuth);
        
        if (traditionalAuth) {
          console.log('✅ AuthContext - Traditional authentication found');
          setIsAuthenticated(true);
          setUser(authService.getUserInfo());
        } else {
          console.log('❌ AuthContext - No authentication found');
          setIsAuthenticated(false);
          setUser(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ AuthContext - Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      setIsLoading(false);
      }
    };

    // Delay to ensure MSAL is fully initialized
    const timeoutId = setTimeout(() => {
    checkAuthStatus();
    }, 100);

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [accounts, instance]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.login(email, password);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      // MSAL logout
      if (accounts.length > 0) {
        await instance.logoutRedirect();
      }
      
      // Traditional auth logout
      authService.logout();
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback logout
    authService.logout();
    setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Don't render anything while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, error, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 