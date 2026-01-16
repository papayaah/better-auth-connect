import { useState, useEffect, useCallback } from 'react';
import type { Session, UseAuthSessionReturn } from '../types';
import { useIntegrationContext } from '../components/IntegrationProvider';

/**
 * Hook for Better Auth session management
 */
export const useAuthSession = (): UseAuthSessionReturn => {
  const { authClient } = useIntegrationContext();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authClient.getSession();
      setSession(result?.data || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch session'));
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [authClient]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    loading,
    error,
  };
};
