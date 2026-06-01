import { Navigate } from 'react-router-dom';
import { authService, AppCapability } from '../services/auth.service';

interface CapabilityRouteProps {
  capability: AppCapability;
  children: React.ReactNode;
}

export const CapabilityRoute = ({ capability, children }: CapabilityRouteProps) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!authService.hasCapability(capability)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
