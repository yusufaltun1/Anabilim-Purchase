import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCapabilityFlags,
  hasCapability,
  type AppCapability,
  type CapabilityFlags,
} from '@/services/auth/capabilities';

export function useCapabilities(): CapabilityFlags & {
  hasCapability: (capability: AppCapability) => boolean;
} {
  const { user, isAuthenticated } = useAuth();

  return useMemo(() => {
    const flags = getCapabilityFlags(user, isAuthenticated);
    return {
      ...flags,
      hasCapability: (capability: AppCapability) =>
        hasCapability(user, capability, isAuthenticated),
    };
  }, [user, isAuthenticated]);
}
