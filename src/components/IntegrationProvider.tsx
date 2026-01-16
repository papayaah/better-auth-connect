import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { AuthClient, CacheConfig } from '../types';
import { createRedditAuthService, type RedditAuthServiceConfig } from '../services/reddit/auth';
import { createXAuthService, type XAuthServiceConfig } from '../services/x/auth';
import { createDevToAuthService, type DevToAuthServiceConfig } from '../services/devto/auth';
import { createGoogleAuthService, type GoogleAuthServiceConfig } from '../services/google/auth';

// ============================================================================
// Service Types
// ============================================================================

interface Services {
  reddit: ReturnType<typeof createRedditAuthService>;
  x: ReturnType<typeof createXAuthService>;
  devto: ReturnType<typeof createDevToAuthService>;
  google: ReturnType<typeof createGoogleAuthService>;
}

// ============================================================================
// Context Types
// ============================================================================

interface IntegrationContextValue {
  authClient: AuthClient;
  services: Services;
  cacheConfig: CacheConfig;
  onError?: (error: Error) => void;
  apiBasePath: string;
}

// ============================================================================
// Context
// ============================================================================

const IntegrationContext = createContext<IntegrationContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface IntegrationProviderProps {
  children: ReactNode;
  authClient: AuthClient;
  cacheConfig?: CacheConfig;
  onError?: (error: Error) => void;
  apiBasePath?: string;
}

// ============================================================================
// Provider Component
// ============================================================================

export const IntegrationProvider = ({
  children,
  authClient,
  cacheConfig = { ttl: 300000, enabled: true },
  onError,
  apiBasePath = '',
}: IntegrationProviderProps) => {
  const services = useMemo<Services>(() => {
    const redditConfig: RedditAuthServiceConfig = {
      authClient,
      apiBasePath,
    };

    const xConfig: XAuthServiceConfig = {
      authClient,
      apiBasePath,
    };

    const devtoConfig: DevToAuthServiceConfig = {
      apiBasePath,
    };

    const googleConfig: GoogleAuthServiceConfig = {
      authClient,
      apiBasePath,
    };

    return {
      reddit: createRedditAuthService(redditConfig),
      x: createXAuthService(xConfig),
      devto: createDevToAuthService(devtoConfig),
      google: createGoogleAuthService(googleConfig),
    };
  }, [authClient, apiBasePath]);

  const value = useMemo<IntegrationContextValue>(
    () => ({
      authClient,
      services,
      cacheConfig,
      onError,
      apiBasePath,
    }),
    [authClient, services, cacheConfig, onError, apiBasePath]
  );

  return <IntegrationContext.Provider value={value}>{children}</IntegrationContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

export const useIntegrationContext = (): IntegrationContextValue => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegrationContext must be used within an IntegrationProvider');
  }
  return context;
};
