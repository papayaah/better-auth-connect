import { useState, useEffect, useCallback } from 'react';
import type { Account, Platform, UseAccountsReturn } from '../types';
import { useIntegrationContext } from '../components/IntegrationProvider';
import { isTokenExpired } from '../utils/cache';

/**
 * Hook for managing connected accounts for a platform
 */
export const useAccounts = (
  platform: Platform,
  options: { forceRefresh?: boolean } = {}
): UseAccountsReturn => {
  const { services } = useIntegrationContext();
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
      setError(err instanceof Error ? err : new Error('Failed to fetch accounts'));
    } finally {
      setLoading(false);
    }
  }, [getService]);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const service = getService();
      const fetchedAccounts = await service.getAccounts(options.forceRefresh);
      setAccounts(fetchedAccounts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch accounts'));
    } finally {
      setLoading(false);
    }
  }, [getService, options.forceRefresh]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const isExpired = useCallback((account: Account): boolean => {
    return isTokenExpired(account);
  }, []);

  return {
    accounts,
    loading,
    error,
    refresh,
    isExpired,
  };
};
