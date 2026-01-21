/**
 * Drizzle + postgres-js compatibility helpers for Better Auth
 *
 * Better Auth passes JavaScript Date objects to the database adapter,
 * but postgres-js doesn't automatically serialize them. This module
 * provides helpers to wrap the postgres client for proper Date handling.
 */

// Re-export schema
export * from './schema';

/**
 * Recursively converts Date objects to ISO strings in any value.
 * Used to serialize dates before passing to postgres-js.
 */
export function serializeDates<T>(obj: T): T {
  if (obj instanceof Date) {
    return obj.toISOString() as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDates) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeDates(value);
    }
    return result as T;
  }
  return obj;
}

/**
 * Wraps a postgres-js client to automatically serialize Date objects.
 *
 * This is required because Better Auth passes Date objects but postgres-js
 * doesn't serialize them automatically, causing errors like:
 * "The 'string' argument must be of type string... Received an instance of Date"
 *
 * @example
 * ```ts
 * import postgres from 'postgres';
 * import { drizzle } from 'drizzle-orm/postgres-js';
 * import { wrapPostgresForBetterAuth } from 'better-auth-connect/server/drizzle';
 *
 * const client = wrapPostgresForBetterAuth(
 *   postgres(process.env.DATABASE_URL!, { max: 10 })
 * );
 * export const db = drizzle(client, { schema });
 * ```
 */
export function wrapPostgresForBetterAuth<T extends { unsafe: (...args: unknown[]) => unknown }>(
  client: T
): T {
  const originalUnsafe = client.unsafe.bind(client);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).unsafe = (query: string, params?: unknown[], options?: unknown) => {
    const serializedParams = params ? serializeDates(params) : params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalUnsafe as any)(query, serializedParams, options);
  };

  return client;
}
