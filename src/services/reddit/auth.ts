import type { AuthClient, RedditAccount, Session } from '../../types';
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

export interface RedditAuthServiceConfig {
  authClient: AuthClient;
  apiBasePath?: string;
  callbackURL?: string;
}

export const createRedditAuthService = (config: RedditAuthServiceConfig) => {
  const { authClient, apiBasePath = '', callbackURL = '/app/integrations/reddit' } = config;

  return {
    /**
     * Connect Reddit account
     * - If user is logged in: links Reddit to existing account
     * - If user is not logged in: signs in with Reddit (creates new user if needed)
     */
    connect: async (scopes: string[] = ['identity', 'read', 'submit', 'mysubreddits']) => {
      try {
        // Use the injected authClient (do not rely on module-level singleton init).
        const sessionResult = await authClient.getSession();
        const session = sessionResult?.data || null;

        if (session?.user) {
          // User is logged in - link the account
          await authClient.linkSocial({
            provider: 'reddit',
            callbackURL,
            scopes,
          });
        } else {
          // User not logged in - sign in with Reddit
          await authClient.signIn.social({
            provider: 'reddit',
            callbackURL,
            scopes,
          });
        }
      } catch (error) {
        throw new ConnectionError('reddit', error instanceof Error ? error.message : undefined);
      }
    },

    /**
     * Sign in with Reddit (always creates new session)
     */
    signIn: async (scopes: string[] = ['identity', 'read', 'submit', 'mysubreddits']) => {
      try {
        await authClient.signIn.social({
          provider: 'reddit',
          callbackURL,
          scopes,
        });
      } catch (error) {
        throw new ConnectionError('reddit', error instanceof Error ? error.message : undefined);
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
    getAccounts: async (forceRefresh = false): Promise<RedditAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('reddit');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            // Verify tokens haven't expired
            const allTokensValid = cached.accounts.every((acc) => !isTokenExpired(acc));
            if (allTokensValid) {
              return cached.accounts as RedditAccount[];
            }
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/reddit/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('reddit', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Disconnect a Reddit account
     */
    disconnect: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/reddit/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('reddit', error.error || 'Failed to disconnect account');
      }

      await clearAccountCache('reddit');
    },

    /**
     * Clear the account cache
     */
    clearCache: async () => {
      await clearAccountCache('reddit');
    },
  };
};

// Default instance (requires initialization via IntegrationProvider)
let redditAuthService: ReturnType<typeof createRedditAuthService>;

export const initRedditAuthService = (config: RedditAuthServiceConfig) => {
  redditAuthService = createRedditAuthService(config);
  return redditAuthService;
};

export const getRedditAuthService = () => {
  if (!redditAuthService) {
    throw new Error('Reddit auth service not initialized. Use IntegrationProvider.');
  }
  return redditAuthService;
};

export { redditAuthService };
