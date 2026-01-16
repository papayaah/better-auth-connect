import type { AuthClient, GoogleAccount, Session } from '../../types';
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

export interface GoogleAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createGoogleAuthService = (config: GoogleAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/google' } = config;

  return {
    /**
     * Connect Google account
     * - If user is logged in: links Google to existing account
     * - If user is not logged in: signs in with Google (creates new user if needed)
     */
    connect: async (
      scopes: string[] = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/youtube.readonly',
      ]
    ) => {
      try {
        // Use the injected authClient (do not rely on module-level singleton init).
        const sessionResult = await authClient.getSession();
        const session = sessionResult?.data || null;

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'google',
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with Google
          await authClient.signIn.social({
            provider: 'google',
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('google', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with Google (always creates new session)
     */
    signIn: async (
      scopes: string[] = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/youtube.readonly',
      ]
    ) => {
      try {
        await authClient.signIn.social({
          provider: 'google',
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('google', error instanceof Error ? error.message : undefined);
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
    getAccounts: async (forceRefresh = false): Promise<GoogleAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('google');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as GoogleAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/google/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('google', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect a Google account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/google/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('google', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('google');
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('google');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let googleAuthService: ReturnType<typeof createGoogleAuthService>;

export const initGoogleAuthService = (config: GoogleAuthServiceConfig) => {
  googleAuthService = createGoogleAuthService(config);
  return googleAuthService;
};

export const getGoogleAuthService = () => {
  if (!googleAuthService) {
    throw new Error('Google auth service not initialized. Use IntegrationProvider.');
  }
  return googleAuthService;
};

export { googleAuthService };
