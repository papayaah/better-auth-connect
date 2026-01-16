import { useState, useEffect, useCallback } from 'react';
import type { Account, Platform, UseIntegrationReturn } from '../types';
import { useIntegrationContext } from '../components/IntegrationProvider';
import { PLATFORM_CONFIGS } from '../types';

/**
 * Main hook for integration state management
 */
export const useIntegration = (platform: Platform): UseIntegrationReturn => {
  const { services, onError } = useIntegrationContext();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getService = useCallback(() => {
    switch (platform) {
      case 'reddit':
        return services.reddit;
      case 'x':
        return services.x;
      case 'devto':
        return services.devto;
      case 'google':
        return services.google;
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }, [platform, services]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const service = getService();
      const fetchedAccounts = await service.getAccounts(true);
      setAccounts(fetchedAccounts);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch accounts');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [getService, onError]);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const service = getService();
      const fetchedAccounts = await service.getAccounts(false);
      setAccounts(fetchedAccounts);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch accounts');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [getService, onError]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const connect = useCallback(
    async (scopes?: string[]) => {
      try {
        setLoading(true);
        setError(null);
        const service = getService();
        const config = PLATFORM_CONFIGS[platform];

        if (platform === 'devto') {
          // DevTo uses API key - this should be handled by the component
          throw new Error('Dev.to requires API key. Use the ApiKeyInput component.');
        }

        const scopesToUse = scopes || config.defaultScopes || [];
        await (service as { connect: (s: string[]) => Promise<void> }).connect(scopesToUse);
        // Note: OAuth will redirect, so we won't reach this point
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to connect');
        setError(error);
        onError?.(error);
        setLoading(false);
      }
    },
    [getService, platform, onError]
  );

  const disconnect = useCallback(
    async (accountId: string) => {
      try {
        setLoading(true);
        setError(null);
        const service = getService();
        await service.disconnect(accountId);
        // Refresh accounts after disconnect
        const fetchedAccounts = await service.getAccounts(true);
        setAccounts(fetchedAccounts);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to disconnect');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [getService, onError]
  );

  return {
    accounts,
    loading,
    error,
    connected: accounts.length > 0,
    connect,
    disconnect,
    refresh,
  };
};
