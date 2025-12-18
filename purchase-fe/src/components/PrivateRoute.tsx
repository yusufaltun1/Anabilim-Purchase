import { Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { authService } from '../services/auth.service';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { accounts, instance } = useMsal();
  
  // Check both MSAL and traditional auth
  const msalAuth = accounts.length > 0 && instance.getActiveAccount();
  const traditionalAuth = authService.isAuthenticated();
  const isAuthenticated = msalAuth || traditionalAuth;
  
  console.log('🛡️ PrivateRoute - MSAL accounts:', accounts.length);
  console.log('🛡️ PrivateRoute - Active account:', !!instance.getActiveAccount());
  console.log('🛡️ PrivateRoute - Traditional auth:', traditionalAuth);
  console.log('🛡️ PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('🛡️ PrivateRoute - Current path:', window.location.pathname);

  // MSAL authentication varsa direkt geç
  if (msalAuth) {
    console.log('✅ PrivateRoute - MSAL authenticated, allowing access');
    return <>{children}</>;
  }

  // Traditional auth kontrolü
  if (traditionalAuth) {
    console.log('✅ PrivateRoute - Traditional authenticated, allowing access');
  return <>{children}</>;
  }

  console.log('❌ PrivateRoute - Not authenticated, redirecting to login');
  return <Navigate to="/login" replace />;
}; 