import type { AuthClient, XAccount, Session } from '../../types';
import {
  getCachedAccounts,
  cacheAccounts,
  clearAccountCache,
  isCacheValid,
  isTokenExpired,
  ACCOUNT_CACHE_TTL,
} from '../../utils/cache';
import { ConnectionError, SessionError } from '../../utils/errors';

// ============================================================================
// In-Memory Session Cache
// ============================================================================

let sessionPromise: Promise<Session | null> | null = null;
let sessionCache: { data: Session | null; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// ============================================================================
// Service Factory
// ============================================================================

export interface XAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createXAuthService = (config: XAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/x' } = config;

  return {
    /**
     * Connect X account
     * - If user is logged in: links X to existing account
     * - If user is not logged in: signs in with X (creates new user if needed)
     */
    connect: async (scopes: string[] = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']) => {
      try {
        // Use the injected authClient (do not rely on module-level singleton init).
        const sessionResult = await authClient.getSession();
        const session = sessionResult?.data || null;

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'twitter',
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with X
          await authClient.signIn.social({
            provider: 'twitter',
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('x', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with X (always creates new session)
     */
    signIn: async (scopes: string[] = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']) => {
      try {
        await authClient.signIn.social({
          provider: 'twitter',
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('x', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign out
     */
    signOut: async () => {
      await authClient.signOut();
      sessionPromise = null;
      sessionCache = null;
    },

    /**
     * Get the current session with in-memory caching
     */
    getSession: async (): Promise<Session | null> => {
      // Check valid cached session
      if (sessionCache && Date.now() - sessionCache.timestamp < SESSION_CACHE_DURATION) {
        return sessionCache.data;
      }

      // Reuse in-flight request
      if (sessionPromise) {
        return sessionPromise;
      }

      // Create new request
      sessionPromise = authClient
        .getSession()
        .then((result) => {
          const session = result?.data || null;
          sessionCache = {
            data: session,
            timestamp: Date.now(),
          };
          sessionPromise = null;
          return session;
        })
        .catch((error) => {
          sessionPromise = null;
          throw new SessionError(error instanceof Error ? error.message : undefined);
        });

      return sessionPromise;
    },

    /**
     * Get connected accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<XAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('x');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as XAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/x/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('x', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect an X account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/x/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('x', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('x');
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('x');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let xAuthService: ReturnType<typeof createXAuthService>;

export const initXAuthService = (config: XAuthServiceConfig) => {
  xAuthService = createXAuthService(config);
  return xAuthService;
};

export const getXAuthService = () => {
  if (!xAuthService) {
    throw new Error('X auth service not initialized. Use IntegrationProvider.');
  }
  return xAuthService;
};

export { xAuthService };
