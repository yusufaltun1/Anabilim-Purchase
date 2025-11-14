import { Navigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { authService } from '../services/auth.service';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { accounts, instance } = useMsal();
  const location = useLocation();
  
  const isAuthenticated = accounts.length > 0 || authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = authService.getUserInfo();
  const userRoles = userInfo?.roles || [];
  
  const restrictedRoles = ['OGRETMEN', 'ZUMRE_BASKANI', 'OKUL_MUDURU'];
  const hasRestrictedRole = userRoles.some(role => restrictedRoles.includes(role));

  if (hasRestrictedRole) {
    if (!location.pathname.startsWith('/purchase-requests')) {
      return <Navigate to="/purchase-requests" replace />;
    }
  }

  return <>{children}</>;
};