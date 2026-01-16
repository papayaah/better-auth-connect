import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Account, Platform } from '../types';

// ============================================================================
// Constants
// ============================================================================

export const ACCOUNT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DB_NAME = 'better-auth-connect';
const DB_VERSION = 1;
const ACCOUNTS_STORE = 'accounts';

// ============================================================================
// Database Schema
// ============================================================================

interface CacheDBSchema extends DBSchema {
  accounts: {
    key: Platform;
    value: {
      platform: Platform;
      accounts: Account[];
      cachedAt: number;
    };
  };
}

// ============================================================================
// Database Instance
// ============================================================================

let dbPromise: Promise<IDBPDatabase<CacheDBSchema>> | null = null;

const getDB = (): Promise<IDBPDatabase<CacheDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<CacheDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(ACCOUNTS_STORE)) {
          db.createObjectStore(ACCOUNTS_STORE, { keyPath: 'platform' });
        }
      },
    });
  }
  return dbPromise;
};

// ============================================================================
// Cache Operations
// ============================================================================

export interface CachedAccounts {
  platform: Platform;
  accounts: Account[];
  cachedAt: number;
}

/**
 * Get cached accounts for a platform
 */
export const getCachedAccounts = async (platform: Platform): Promise<CachedAccounts | undefined> => {
  try {
    const db = await getDB();
    return await db.get(ACCOUNTS_STORE, platform);
  } catch (error) {
    console.error(`Failed to get cached accounts for ${platform}:`, error);
    return undefined;
  }
};

/**
 * Cache accounts for a platform
 */
export const cacheAccounts = async (platform: Platform, accounts: Account[]): Promise<void> => {
  try {
    const db = await getDB();
    await db.put(ACCOUNTS_STORE, {
      platform,
      accounts,
      cachedAt: Date.now(),
    });
  } catch (error) {
    console.error(`Failed to cache accounts for ${platform}:`, error);
  }
};

/**
 * Clear cached accounts for a platform
 */
export const clearAccountCache = async (platform: Platform): Promise<void> => {
  try {
    const db = await getDB();
    await db.delete(ACCOUNTS_STORE, platform);
  } catch (error) {
    console.error(`Failed to clear cache for ${platform}:`, error);
  }
};

/**
 * Clear all cached accounts
 */
export const clearAllAccountCache = async (): Promise<void> => {
  try {
    const db = await getDB();
    await db.clear(ACCOUNTS_STORE);
  } catch (error) {
    console.error('Failed to clear all account cache:', error);
  }
};

/**
 * Check if cache is still valid
 */
export const isCacheValid = (cachedAt: number, ttl: number = ACCOUNT_CACHE_TTL): boolean => {
  return Date.now() - cachedAt < ttl;
};

/**
 * Check if an account's token is expired
 */
export const isTokenExpired = (account: Account): boolean => {
  if (!account.accessTokenExpiresAt) return false;
  const expiresAt = new Date(account.accessTokenExpiresAt);
  return expiresAt <= new Date();
};

/**
 * Check if an account's token is expiring soon (within 24 hours)
 */
export const isTokenExpiringSoon = (account: Account, thresholdHours: number = 24): boolean => {
  if (!account.accessTokenExpiresAt) return false;
  const expiresAt = new Date(account.accessTokenExpiresAt);
  const now = new Date();
  const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilExpiry > 0 && hoursUntilExpiry < thresholdHours;
};
