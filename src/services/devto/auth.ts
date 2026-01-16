import type { DevToAccount } from '../../types';
import {
  getCachedAccounts,
  cacheAccounts,
  clearAccountCache,
  isCacheValid,
  ACCOUNT_CACHE_TTL,
} from '../../utils/cache';
import { ApiKeyError, ConnectionError } from '../../utils/errors';
import type { DevToUser } from './types';

// ============================================================================
// Service Factory
// ============================================================================

export interface DevToAuthServiceConfig {
  apiBasePath?: string;
}

export const createDevToAuthService = (config: DevToAuthServiceConfig = {}) => {
  const { apiBasePath = '' } = config;

  return {
    /**
     * Validate API key by fetching user profile from Dev.to
     */
    validateApiKey: async (apiKey: string): Promise<DevToUser | null> => {
      try {
        const response = await fetch('https://dev.to/api/users/me', {
          headers: {
            'api-key': apiKey,
            Accept: 'application/vnd.forem.api-v1+json',
          },
        });

        if (!response.ok) {
          return null;
        }

        return await response.json();
      } catch {
        return null;
      }
    },

    /**
     * Add a new Dev.to account with API key
     * This validates the key and stores it via the API route
     */
    addAccount: async (apiKey: string): Promise<DevToAccount> => {
      const response = await fetch(`${apiBasePath}/api/auth/devto/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiKeyError('devto', error.error || 'Failed to add Dev.to account');
      }

      // Clear cache to force refresh
      await clearAccountCache('devto');

      return response.json();
    },

    /**
     * Connect Dev.to account (same as addAccount for API key auth)
     */
    connect: async (apiKey: string): Promise<DevToAccount> => {
      return devtoAuthService.addAccount(apiKey);
    },

    /**
     * Get connected Dev.to accounts with IndexedDB caching
     */
    getAccounts: async (forceRefresh = false): Promise<DevToAccount[]> => {
      // Check IndexedDB cache first
      if (!forceRefresh) {
        try {
          const cached = await getCachedAccounts('devto');
          if (cached && isCacheValid(cached.cachedAt, ACCOUNT_CACHE_TTL)) {
            return cached.accounts as DevToAccount[];
          }
        } catch {
          // Continue to fetch from API
        }
      }

      // Fetch from API
      const response = await fetch(`${apiBasePath}/api/auth/devto/accounts`);
      if (response.ok) {
        const accounts = await response.json();
        try {
          await cacheAccounts('devto', accounts);
        } catch {
          // Cache failure is non-fatal
        }
        return accounts;
      }
      return [];
    },

    /**
     * Remove a Dev.to account
     */
    removeAccount: async (accountId: string): Promise<void> => {
      const response = await fetch(`${apiBasePath}/api/auth/devto/accounts?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ConnectionError('devto', error.error || 'Failed to remove account');
      }

      await clearAccountCache('devto');
    },

    /**
     * Disconnect a Dev.to account (alias for removeAccount)
     */
    disconnect: async (accountId: string): Promise<void> => {
      return devtoAuthService.removeAccount(accountId);
    },

    /**
     * Clear the account cache
     */
    clearCache: async (): Promise<void> => {
      await clearAccountCache('devto');
    },
  };
};

// Default instance
let devtoAuthService: ReturnType<typeof createDevToAuthService>;

export const initDevToAuthService = (config: DevToAuthServiceConfig = {}) => {
  devtoAuthService = createDevToAuthService(config);
  return devtoAuthService;
};

export const getDevToAuthService = () => {
  if (!devtoAuthService) {
    throw new Error('DevTo auth service not initialized. Use IntegrationProvider.');
  }
  return devtoAuthService;
};

export { devtoAuthService };
